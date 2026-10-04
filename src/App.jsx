import { useRef, useState } from 'react';
import ContractForm from './components/ContractForm';
import { formatPhone, halfOf, onlyDigits, MAX_AMOUNT_DIGITS, safeFileName, todayISO } from './utils';
import {
  canShareFile,
  downloadFile,
  prefersShareForDownload,
  shareFile,
  SHARE_RESULT,
  supportsShare,
} from './pdfDelivery';

const INITIAL_FORM = {
  contractNumber: '',
  date: todayISO(),
  name: '',
  iin: '',
  idCard: '',
  phone: '',
  address: '',
  pay1: '',
  pay2: '',
  pay3: '',
};

const normalizeAmount = (value) => onlyDigits(value, MAX_AMOUNT_DIGITS).replace(/^0+(?=\d)/, '');

const pdfFileName = (data) =>
  safeFileName(`Договор ${data.contractNumber ? `№${data.contractNumber} ` : ''}${data.name || 'Клиент'}`) + '.pdf';

function App() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  // Prepayment follows 50% of the total until the user types their own value.
  const [prepaymentEdited, setPrepaymentEdited] = useState(false);
  const [busy, setBusy] = useState(null); // 'download' | 'share' | null
  const [notice, setNotice] = useState(null); // { type: 'success' | 'info' | 'error', text }
  const [shareReadyKey, setShareReadyKey] = useState(null);
  const pdfCache = useRef(null); // { key, file } — the last generated PDF

  const formKey = JSON.stringify(formData);
  const shareReady = shareReadyKey === formKey;

  const handleFieldChange = (name, rawValue) => {
    setNotice(null);
    setFormData((prev) => {
      switch (name) {
        case 'iin':
          return { ...prev, iin: onlyDigits(rawValue, 12) };
        case 'phone':
          return { ...prev, phone: formatPhone(rawValue, prev.phone) };
        case 'pay1':
          return { ...prev, pay1: normalizeAmount(rawValue) };
        case 'pay2': {
          const pay2 = normalizeAmount(rawValue);
          return prepaymentEdited ? { ...prev, pay2 } : { ...prev, pay2, pay3: halfOf(pay2) };
        }
        case 'pay3':
          return { ...prev, pay3: normalizeAmount(rawValue) };
        default:
          return { ...prev, [name]: rawValue };
      }
    });
    if (name === 'pay3') setPrepaymentEdited(normalizeAmount(rawValue) !== '');
  };

  // Generating takes a few seconds, so the result is cached until the form changes.
  const getPdfFile = async () => {
    if (pdfCache.current?.key === formKey) return { file: pdfCache.current.file, fresh: false };
    const { generateContractPdf } = await import('./contract/generatePdf');
    const blob = await generateContractPdf(formData);
    const file = new File([blob], pdfFileName(formData), { type: 'application/pdf' });
    pdfCache.current = { key: formKey, file };
    return { file, fresh: true };
  };

  const share = async (file, fresh) => {
    const result = await shareFile(file, { title: 'Договор SENIMDI', text: `Договор для ${formData.name || 'клиента'}` });
    if (result === SHARE_RESULT.needsTap && fresh) {
      // The browser only opens the share sheet right after a tap; the file is ready now.
      setShareReadyKey(formKey);
      setNotice({ type: 'info', text: 'PDF готов. Нажмите «Отправить PDF», чтобы поделиться.' });
      return;
    }
    if (result === SHARE_RESULT.needsTap) {
      downloadFile(file);
      setNotice({ type: 'info', text: 'Браузер не разрешил отправку, поэтому PDF скачан.' });
      return;
    }
    setShareReadyKey(null);
    if (result === SHARE_RESULT.shared) setNotice({ type: 'success', text: 'PDF отправлен.' });
  };

  const run = async (kind, action) => {
    setBusy(kind);
    setNotice(null);
    try {
      await action();
    } catch (error) {
      console.error('PDF error:', error);
      setNotice({ type: 'error', text: 'Не удалось создать PDF. Проверьте интернет и попробуйте ещё раз.' });
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = () =>
    run('download', async () => {
      const { file, fresh } = await getPdfFile();
      if (prefersShareForDownload() && canShareFile(file)) {
        await share(file, fresh);
        return;
      }
      downloadFile(file);
      setNotice({ type: 'success', text: `PDF скачан: ${file.name}` });
    });

  const handleShare = () =>
    run('share', async () => {
      const { file, fresh } = await getPdfFile();
      if (!canShareFile(file)) {
        downloadFile(file);
        setNotice({ type: 'info', text: 'Этот браузер не умеет отправлять файлы, поэтому PDF скачан.' });
        return;
      }
      await share(file, fresh);
    });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">SENIMDI PWA</h1>
          <p className="text-gray-500">Система генерации договоров для внутреннего использования</p>
        </header>

        <ContractForm
          formData={formData}
          onFieldChange={handleFieldChange}
          onDownload={handleDownload}
          onShare={handleShare}
          busy={busy}
          canShare={supportsShare()}
          shareReady={shareReady}
          notice={notice}
        />
      </div>
    </div>
  );
}

export default App;
