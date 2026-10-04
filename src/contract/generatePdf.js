import { buildContractDocument } from './contractDocument';

// Tinos is metric-compatible with Times New Roman (the font of the paper contract)
// and covers the Kazakh alphabet. Files live in /public/fonts and are precached by the PWA.
const FONT_FILES = {
  normal: 'Tinos-Regular.ttf',
  bold: 'Tinos-Bold.ttf',
  italics: 'Tinos-Italic.ttf',
  bolditalics: 'Tinos-BoldItalic.ttf',
};

const fontUrl = (file) => new URL(`${import.meta.env.BASE_URL}fonts/${file}`, window.location.href).href;

let pdfMakePromise = null;

// pdfmake is ~1 MB, so it is loaded only when the first PDF is requested.
function loadPdfMake() {
  pdfMakePromise ??= import('pdfmake/build/pdfmake')
    .then((module) => {
      const pdfMake = module.default ?? module;
      const fonts = Object.fromEntries(Object.entries(FONT_FILES).map(([style, file]) => [style, fontUrl(file)]));
      pdfMake.addFonts({ Tinos: fonts });
      // Only our own font files may be fetched while building the document.
      pdfMake.setUrlAccessPolicy((url) => new URL(url).origin === window.location.origin);
      return pdfMake;
    })
    .catch((error) => {
      pdfMakePromise = null; // allow a retry, e.g. after the connection comes back
      throw error;
    });
  return pdfMakePromise;
}

export async function generateContractPdf(data) {
  const pdfMake = await loadPdfMake();
  return pdfMake.createPdf(buildContractDocument(data)).getBlob();
}
