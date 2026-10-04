import { formatNumber, getPayments, isCompletePhone, numberToKazakhWords, toAmount } from '../utils';
import { FileText, Download, Share2, Send } from 'lucide-react';

const inputClass =
  'w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition';

function Field({ label, hint, warning, className = '', ...inputProps }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      <input className={inputClass} {...inputProps} />
      {warning ? (
        <span className="mt-1 block text-xs text-amber-700">{warning}</span>
      ) : (
        hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>
      )}
    </label>
  );
}

const amountHint = (value) => {
  const amount = toAmount(value);
  return amount === null ? null : `${numberToKazakhWords(amount)} теңге`;
};

const noticeStyles = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  error: 'bg-red-50 text-red-800 border-red-200',
};

export default function ContractForm({ formData, onFieldChange, onDownload, onShare, busy, canShare, shareReady, notice }) {
  const handleChange = (e) => onFieldChange(e.target.name, e.target.value);
  const payments = getPayments(formData);

  const iinWarning = formData.iin && formData.iin.length !== 12 ? `ИИН должен содержать 12 цифр (сейчас ${formData.iin.length})` : null;
  const phoneWarning = formData.phone && !isCompletePhone(formData.phone) ? 'Номер введён не полностью' : null;

  let prepaymentHint = amountHint(formData.pay3);
  if (payments.prepaymentPercent !== null && payments.prepayment !== null) {
    prepaymentHint = `${payments.prepaymentPercent}% — ${prepaymentHint}`;
  } else if (payments.prepayment !== null && payments.total) {
    prepaymentHint = `${prepaymentHint} · процент не целый, в договоре будет без «%»`;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
      <div className="bg-blue-600 p-6 text-white flex items-center gap-3">
        <FileText size={28} />
        <div>
          <h2 className="text-xl font-bold">Генератор Договора</h2>
          <p className="text-blue-100 text-sm">Заполните данные для создания PDF</p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Personal Details */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Личные данные клиента</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Номер договора" name="contractNumber" placeholder="Например, 136" value={formData.contractNumber} onChange={handleChange} />
            <Field label="Дата договора" type="date" name="date" value={formData.date} onChange={handleChange} />
            <Field label="ФИО клиента" name="name" placeholder="Иванов Иван Иванович" autoComplete="off" value={formData.name} onChange={handleChange} />
            <Field
              label="ЖСН / ИИН (12 цифр)"
              name="iin"
              inputMode="numeric"
              autoComplete="off"
              placeholder="123456789012"
              value={formData.iin}
              onChange={handleChange}
              warning={iinWarning}
            />
            <Field label="Жеке куәлік (№ удостоверения)" name="idCard" placeholder="012345678" autoComplete="off" value={formData.idCard} onChange={handleChange} />
            <Field
              label="Номер телефона"
              type="tel"
              name="phone"
              inputMode="tel"
              autoComplete="off"
              placeholder="+7 (7XX) XXX-XX-XX"
              value={formData.phone}
              onChange={handleChange}
              warning={phoneWarning}
            />
            <Field
              className="md:col-span-2"
              label="Адрес проживания"
              name="address"
              placeholder="г. Шымкент, ул. Примерная, 1"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Financial Details */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Финансовые условия (в тенге)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Алдын ала кеңес беру ақысы (Консультация)"
              name="pay1"
              inputMode="numeric"
              value={formatNumber(formData.pay1)}
              onChange={handleChange}
              hint={amountHint(formData.pay1)}
            />
            <Field
              label="Қызмет көрсету ақысы (Общая стоимость)"
              name="pay2"
              inputMode="numeric"
              value={formatNumber(formData.pay2)}
              onChange={handleChange}
              hint={amountHint(formData.pay2)}
            />
            <Field
              label="Алдын-ала төлем (Предоплата, по умолчанию 50%)"
              name="pay3"
              inputMode="numeric"
              value={formatNumber(formData.pay3)}
              onChange={handleChange}
              hint={prepaymentHint}
              warning={payments.prepaymentExceedsTotal ? 'Предоплата больше общей стоимости' : null}
            />
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-1">Қалған төлем (Остаток)</span>
              <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-gray-700" data-testid="remainder">
                {formatNumber(payments.remainder ?? 0)} ₸
              </div>
              {payments.remainder !== null && (
                <span className="mt-1 block text-xs text-gray-500">{numberToKazakhWords(payments.remainder)} теңге</span>
              )}
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="pt-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onDownload}
              disabled={busy !== null}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {busy === 'download' ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              ) : (
                <><Download size={20} /> Скачать PDF</>
              )}
            </button>

            {canShare && (
              <button
                type="button"
                onClick={onShare}
                disabled={busy !== null}
                className="sm:w-auto w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {busy === 'share' ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                ) : shareReady ? (
                  <><Send size={20} /> Отправить PDF</>
                ) : (
                  <><Share2 size={20} /> Поделиться</>
                )}
              </button>
            )}
          </div>

          {notice && (
            <p role="status" className={`text-sm border rounded-lg px-4 py-2 ${noticeStyles[notice.type]}`}>
              {notice.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
