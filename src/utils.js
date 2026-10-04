// Amounts are stored as digit strings: '' means "not filled", '0' is an explicit zero.
export const MAX_AMOUNT_DIGITS = 12;

export const onlyDigits = (value, maxLength = Infinity) =>
  String(value ?? '').replace(/\D/g, '').slice(0, maxLength);

// '' / null / undefined -> null, otherwise a non-negative integer.
export const toAmount = (value) => {
  const digits = onlyDigits(value, MAX_AMOUNT_DIGITS);
  return digits === '' ? null : Number(digits);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return '';
  const n = Number(num);
  if (!Number.isFinite(n)) return '';
  return Math.trunc(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const units = ['', 'бір', 'екі', 'үш', 'төрт', 'бес', 'алты', 'жеті', 'сегіз', 'тоғыз'];
const tens = ['', 'он', 'жиырма', 'отыз', 'қырық', 'елу', 'алпыс', 'жетпіс', 'сексен', 'тоқсан'];
const scales = [
  [1_000_000_000, 'миллиард'],
  [1_000_000, 'миллион'],
  [1_000, 'мың'],
];

function getThreeDigitWords(n) {
  const words = [];
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;

  if (h > 0) words.push(h === 1 ? 'жүз' : `${units[h]} жүз`);
  if (t > 0) words.push(tens[t]);
  if (u > 0) words.push(units[u]);
  return words.join(' ');
}

// Amount in Kazakh words (whole tenge, up to 999 999 999 999).
export const numberToKazakhWords = (num) => {
  if (num === null || num === undefined || num === '') return '';
  const n = Number(num);
  if (!Number.isFinite(n) || n < 0 || n >= 1e12) return '';
  let rest = Math.trunc(n);
  if (rest === 0) return 'нөл';

  const words = [];
  for (const [size, name] of scales) {
    const chunk = Math.floor(rest / size);
    if (chunk > 0) words.push(`${getThreeDigitWords(chunk)} ${name}`);
    rest %= size;
  }
  if (rest > 0) words.push(getThreeDigitWords(rest));
  return words.join(' ');
};

// Contract amounts in whole tenge; null means the field is empty.
export const DEFAULT_PREPAYMENT_PERCENT = 50;

export function getPayments({ pay1, pay2, pay3 }) {
  const consultation = toAmount(pay1);
  const total = toAmount(pay2);
  const prepayment = toAmount(pay3);
  const remainder = total === null ? null : Math.max(0, total - (prepayment ?? 0));

  let prepaymentPercent = null;
  if (total === null && prepayment === null) {
    prepaymentPercent = DEFAULT_PREPAYMENT_PERCENT; // blank form: standard terms
  } else if (total > 0 && prepayment !== null && prepayment <= total) {
    const pct = (prepayment / total) * 100;
    if (Number.isInteger(pct)) prepaymentPercent = pct;
  }

  return {
    consultation,
    total,
    prepayment,
    remainder,
    prepaymentPercent,
    remainderPercent: prepaymentPercent === null ? null : 100 - prepaymentPercent,
    prepaymentExceedsTotal: total !== null && prepayment !== null && prepayment > total,
  };
}

export const halfOf = (value) => {
  const n = toAmount(value);
  return n === null ? '' : String(Math.round(n / 2));
};

// Dates come from <input type="date"> as YYYY-MM-DD; never route them through UTC.
const pad2 = (n) => String(n).padStart(2, '0');

export const todayISO = (now = new Date()) =>
  `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

export const formatContractDate = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  return m ? `${m[3]}.${m[2]}.${m[1]}` : '';
};

// Kazakhstan phone: +7 (7XX) XXX-XX-XX. Operator codes always start with 7, so a leading 8
// (or the first 7 of an 11-digit number) is the trunk/country prefix, not part of the number.
const PHONE_PREFIX = '+7';

const phoneDigits = (value) => {
  const raw = String(value ?? '').trim();
  let digits = onlyDigits(raw);
  if (raw.startsWith(PHONE_PREFIX)) digits = digits.slice(1);
  return digits;
};

export function formatPhone(input, previous = '') {
  const raw = String(input ?? '').trim();
  let digits = phoneDigits(raw);
  // Prefix handling applies to pasted / freshly typed numbers. Once the field shows "+7 (",
  // further digits belong to the subscriber number and anything past 10 digits is ignored.
  if (!raw.startsWith(PHONE_PREFIX)) {
    if (digits.startsWith('8')) digits = digits.slice(1);
    else if (digits.length === 11 && digits.startsWith('7')) digits = digits.slice(1);
  }

  // Backspace over a bracket/dash leaves the digits unchanged: drop the digit before it.
  if (previous && raw.length < previous.length && digits === phoneDigits(previous)) {
    digits = digits.slice(0, -1);
  }
  digits = digits.slice(0, 10);
  if (digits.length === 0) return raw === '+' || raw === PHONE_PREFIX ? raw : '';

  let formatted = `${PHONE_PREFIX} (${digits.slice(0, 3)}`;
  if (digits.length > 3) formatted += `) ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  return formatted;
}

export const isCompletePhone = (value) => phoneDigits(value).length === 10;

// Strip characters that are not allowed in file names on Windows/Android/iOS.
const FORBIDDEN_FILE_CHARS = '\\/:*?"<>|';

export const safeFileName = (name) =>
  [...String(name)]
    .map((ch) => (ch.charCodeAt(0) < 32 || FORBIDDEN_FILE_CHARS.includes(ch) ? ' ' : ch))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
