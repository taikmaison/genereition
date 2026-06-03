export const formatNumber = (num) => {
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const units = ['', 'бір', 'екі', 'үш', 'төрт', 'бес', 'алты', 'жеті', 'сегіз', 'тоғыз'];
const tens = ['', 'он', 'жиырма', 'отыз', 'қырық', 'елу', 'алпыс', 'жетпіс', 'сексен', 'тоқсан'];

function getThreeDigitWords(n) {
  let str = '';
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;

  if (h > 0) {
    if (h === 1) str += 'жүз ';
    else str += units[h] + ' жүз ';
  }
  if (t > 0) {
    str += tens[t] + ' ';
  }
  if (u > 0) {
    str += units[u] + ' ';
  }
  return str.trim();
}

export const numberToKazakhWords = (num) => {
  if (num === 0) return 'нөл';
  if (!num) return '';
  
  let str = '';
  
  const b = Math.floor(num / 1000000000);
  const m = Math.floor((num % 1000000000) / 1000000);
  const th = Math.floor((num % 1000000) / 1000);
  const r = num % 1000;

  if (b > 0) {
    str += getThreeDigitWords(b) + ' миллиард ';
  }
  if (m > 0) {
    str += getThreeDigitWords(m) + ' миллион ';
  }
  if (th > 0) {
    str += getThreeDigitWords(th) + ' мың ';
  }
  if (r > 0) {
    str += getThreeDigitWords(r) + ' ';
  }

  return str.trim();
};
