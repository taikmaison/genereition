// Getting a generated PDF out of the browser: download or the native share sheet.

export const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;

export const supportsShare = () => typeof navigator.share === 'function';

export const canShareFile = (file) =>
  supportsShare() && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

// An iOS home-screen app cannot save blob downloads, so there the share sheet is the only way out.
export const prefersShareForDownload = () => isIOS() && isStandalone();

export function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export const SHARE_RESULT = {
  shared: 'shared',
  cancelled: 'cancelled', // the user closed the share sheet: not an error
  needsTap: 'needs-tap', // the click "expired" while the PDF was being generated
};

export async function shareFile(file, { title, text } = {}) {
  try {
    await navigator.share({ files: [file], title, text });
    return SHARE_RESULT.shared;
  } catch (error) {
    if (error?.name === 'AbortError') return SHARE_RESULT.cancelled;
    if (error?.name === 'NotAllowedError') return SHARE_RESULT.needsTap;
    throw error;
  }
}
