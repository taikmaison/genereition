import { useState, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import ContractForm from './components/ContractForm';
import ContractTemplate from './components/ContractTemplate';

function App() {
  const [formData, setFormData] = useState({
    contractNumber: '',
    date: new Date().toISOString().split('T')[0],
    name: '',
    iin: '',
    idCard: '',
    phone: '',
    address: '',
    pay1: '',
    pay2: '',
    pay3: '',
    pay4: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const templateRef = useRef(null);

  const generatePDF = async (share = false) => {
    setIsGenerating(true);
    const element = templateRef.current;
    
    const opt = {
      margin:       [20, 15, 20, 15],
      filename:     `Договор_${formData.name || 'Клиент'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  {
        scale: 2,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll('*').forEach((node) => {
            node.style.color = '#000000';
            node.style.backgroundColor = 'transparent';
            node.style.borderColor = '#000000';
            node.style.textDecorationColor = '#000000';
            node.style.boxShadow = 'none';
          });

          const root = clonedDoc.querySelector('[data-pdf-root="true"]');
          if (root) {
            root.style.backgroundColor = '#ffffff';
          }
        }
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] }
    };

    try {
      if (share && navigator.share) {
        // Generate Blob to share
        const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
        const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Договор SENIMDI',
            text: `Договор для ${formData.name}`,
            files: [file]
          });
        } else {
          // Fallback to download if cannot share file
          alert('Ваш браузер не поддерживает отправку файлов. Файл будет скачан.');
          await html2pdf().set(opt).from(element).save();
        }
      } else {
        // Standard Download
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile && navigator.canShare) {
            // Force share if mobile and can share, even if they clicked download
            const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
            const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Договор SENIMDI',
                    files: [file]
                });
                return;
            }
        }
        await html2pdf().set(opt).from(element).save();
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('Произошла ошибка при генерации PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative overflow-x-hidden">
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">SENIMDI PWA</h1>
            <p className="text-gray-500">Система генерации договоров для внутреннего использования</p>
          </header>

          <ContractForm 
            formData={formData} 
            setFormData={setFormData} 
            onGenerate={generatePDF}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      {/* Hidden container for PDF generation */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: -1000, opacity: 0.001, pointerEvents: 'none', width: '180mm' }}>
        <ContractTemplate ref={templateRef} data={formData} />
      </div>
    </div>
  );
}

export default App;
