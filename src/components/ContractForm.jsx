import { useEffect } from 'react';
import { formatNumber } from '../utils';
import { FileText, Download, Share2 } from 'lucide-react';

export default function ContractForm({ formData, setFormData, onGenerate, isGenerating }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'iin') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 12) }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('7')) val = val.substring(1);
    
    let formatted = '+7 ';
    if (val.length > 0) formatted += `(${val.substring(0, 3)}`;
    if (val.length >= 4) formatted += `) ${val.substring(3, 6)}`;
    if (val.length >= 7) formatted += `-${val.substring(6, 8)}`;
    if (val.length >= 9) formatted += `-${val.substring(8, 10)}`;
    
    if (val.length === 0) formatted = '';
    
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  // Auto calculate pay4
  useEffect(() => {
    const p2 = Number(formData.pay2) || 0;
    const p3 = Number(formData.pay3) || 0;
    setFormData(prev => ({ ...prev, pay4: Math.max(0, p2 - p3) }));
  }, [formData.pay2, formData.pay3, setFormData]);

  const handleShare = async () => {
    onGenerate(true); // pass true for sharing
  };

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Номер договора</label>
              <input 
                type="text" 
                name="contractNumber" 
                placeholder="Например, 57"
                value={formData.contractNumber} 
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата договора</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ФИО клиента</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Иванов Иван Иванович"
                value={formData.name} 
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ЖСН / ИИН (12 цифр)</label>
              <input 
                type="number" 
                name="iin" 
                placeholder="123456789012"
                value={formData.iin} 
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Жеке куәлік (№ удостоверения)</label>
              <input 
                type="text" 
                name="idCard" 
                placeholder="012345678"
                value={formData.idCard} 
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Номер телефона</label>
              <input 
                type="text" 
                name="phone" 
                placeholder="+7 (7XX) XXX-XX-XX"
                value={formData.phone} 
                onChange={handlePhoneChange}
                maxLength={18}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Адрес проживания</label>
              <input 
                type="text" 
                name="address" 
                placeholder="г. Шымкент, ул. Примерная, 1"
                value={formData.address} 
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>
        </section>

        {/* Financial Details */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Финансовые условия (в тенге)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Алдын ала кеңес беру ақысы (Консультация)</label>
              <input 
                type="number" 
                name="pay1" 
                value={formData.pay1} 
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Қызмет көрсету ақысы (Общая стоимость)</label>
              <input 
                type="number" 
                name="pay2" 
                value={formData.pay2} 
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Алдын-ала төлем (Предоплата)</label>
              <input 
                type="number" 
                name="pay3" 
                value={formData.pay3} 
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Қалған төлем (Остаток)</label>
              <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-semibold text-gray-700">
                {formatNumber(formData.pay4) || '0'} ₸
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => onGenerate(false)}
            disabled={isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            ) : (
              <><Download size={20} /> Скачать PDF</>
            )}
          </button>

          {navigator.share && (
            <button 
              onClick={handleShare}
              disabled={isGenerating}
              className="sm:w-auto w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Share2 size={20} /> Поделиться
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
