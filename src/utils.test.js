import { describe, expect, it } from 'vitest';
import {
  formatContractDate,
  formatNumber,
  formatPhone,
  getPayments,
  halfOf,
  isCompletePhone,
  numberToKazakhWords,
  safeFileName,
  toAmount,
  todayISO,
} from './utils';

describe('formatNumber', () => {
  it('groups thousands with spaces', () => {
    expect(formatNumber(150000)).toBe('150 000');
    expect(formatNumber('300000')).toBe('300 000');
    expect(formatNumber(1234567890)).toBe('1 234 567 890');
  });

  it('keeps an explicit zero and blanks empty values', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber('0')).toBe('0');
    expect(formatNumber('')).toBe('');
    expect(formatNumber(null)).toBe('');
    expect(formatNumber(undefined)).toBe('');
  });
});

describe('numberToKazakhWords', () => {
  it.each([
    [0, 'нөл'],
    [1, 'бір'],
    [10, 'он'],
    [15, 'он бес'],
    [100, 'жүз'],
    [101, 'жүз бір'],
    [250, 'екі жүз елу'],
    [1000, 'бір мың'],
    [5000, 'бес мың'],
    [150000, 'жүз елу мың'],
    [300000, 'үш жүз мың'],
    [1000000, 'бір миллион'],
    [2500000, 'екі миллион бес жүз мың'],
    [999999999999, 'тоғыз жүз тоқсан тоғыз миллиард тоғыз жүз тоқсан тоғыз миллион тоғыз жүз тоқсан тоғыз мың тоғыз жүз тоқсан тоғыз'],
  ])('%s -> %s', (n, words) => {
    expect(numberToKazakhWords(n)).toBe(words);
  });

  it('never produces "undefined" or garbage', () => {
    expect(numberToKazakhWords(1000.5)).toBe('бір мың');
    expect(numberToKazakhWords(-500)).toBe('');
    expect(numberToKazakhWords('')).toBe('');
    expect(numberToKazakhWords(null)).toBe('');
    expect(numberToKazakhWords(NaN)).toBe('');
    expect(numberToKazakhWords(1e12)).toBe('');
    for (let n = 0; n <= 20000; n += 7) expect(numberToKazakhWords(n)).not.toMatch(/undefined|\s{2}|^\s|\s$/);
  });
});

describe('toAmount', () => {
  it('parses digit strings and treats empty as null', () => {
    expect(toAmount('')).toBeNull();
    expect(toAmount('0')).toBe(0);
    expect(toAmount('007')).toBe(7);
    expect(toAmount('150 000')).toBe(150000);
    expect(toAmount('-5')).toBe(5); // the minus sign is not a digit
  });
});

describe('getPayments', () => {
  it('computes remainder and the prepayment percent', () => {
    expect(getPayments({ pay1: '5000', pay2: '300000', pay3: '150000' })).toMatchObject({
      consultation: 5000,
      total: 300000,
      prepayment: 150000,
      remainder: 150000,
      prepaymentPercent: 50,
      remainderPercent: 50,
      prepaymentExceedsTotal: false,
    });
    expect(getPayments({ pay1: '', pay2: '400000', pay3: '120000' })).toMatchObject({ prepaymentPercent: 30, remainderPercent: 70, remainder: 280000 });
  });

  it('omits the percent when it is not a whole number', () => {
    expect(getPayments({ pay1: '', pay2: '300000', pay3: '100000' })).toMatchObject({ prepaymentPercent: null, remainderPercent: null, remainder: 200000 });
  });

  it('uses the standard 50% for a blank form', () => {
    expect(getPayments({ pay1: '', pay2: '', pay3: '' })).toMatchObject({ total: null, remainder: null, prepaymentPercent: 50, remainderPercent: 50 });
  });

  it('never returns a negative remainder', () => {
    expect(getPayments({ pay1: '', pay2: '100', pay3: '500' })).toMatchObject({ remainder: 0, prepaymentPercent: null, prepaymentExceedsTotal: true });
  });

  it('treats a missing prepayment as zero for the remainder', () => {
    expect(getPayments({ pay1: '', pay2: '300000', pay3: '' })).toMatchObject({ remainder: 300000, prepaymentPercent: null });
  });
});

describe('halfOf', () => {
  it('returns half as a digit string', () => {
    expect(halfOf('300000')).toBe('150000');
    expect(halfOf('5')).toBe('3');
    expect(halfOf('')).toBe('');
  });
});

describe('dates', () => {
  it('uses the local calendar day, not UTC', () => {
    // 00:30 local time on 5 Oct: toISOString() would still say 4 Oct in UTC+5.
    expect(todayISO(new Date(2026, 9, 5, 0, 30))).toBe('2026-10-05');
    expect(todayISO(new Date(2026, 0, 1, 23, 59))).toBe('2026-01-01');
  });

  it('formats the contract date as DD.MM.YYYY', () => {
    expect(formatContractDate('2026-10-04')).toBe('04.10.2026');
    expect(formatContractDate('')).toBe('');
    expect(formatContractDate(undefined)).toBe('');
    expect(formatContractDate('garbage')).toBe('');
  });
});

describe('formatPhone', () => {
  const typeChars = (chars) => [...chars].reduce((value, ch) => formatPhone(value + ch, value), '');
  const backspace = (value, times) => {
    let v = value;
    for (let i = 0; i < times; i++) v = formatPhone(v.slice(0, -1), v);
    return v;
  };

  it.each(['7011234567', '87011234567', '+77011234567'])('typing %s char by char', (input) => {
    expect(typeChars(input)).toBe('+7 (701) 123-45-67');
  });

  it.each(['+7 (701) 123-45-67', '87011234567', '8 701 123 45 67', '+7 701 123 4567', '7011234567', '77011234567'])('pasting %s', (input) => {
    expect(formatPhone(input, '')).toBe('+7 (701) 123-45-67');
  });

  it('formats partial input progressively', () => {
    expect(typeChars('7')).toBe('+7 (7');
    expect(typeChars('7012')).toBe('+7 (701) 2');
    expect(typeChars('7012345')).toBe('+7 (701) 234-5');
  });

  it('ignores extra digits once the number is complete', () => {
    expect(typeChars('701123456799')).toBe('+7 (701) 123-45-67');
    expect(formatPhone('+7 (701) 123-45-679', '+7 (701) 123-45-67')).toBe('+7 (701) 123-45-67');
  });

  it('lets the user type the "+7" prefix by hand', () => {
    expect(typeChars('+')).toBe('+');
    expect(typeChars('+7')).toBe('+7');
    expect(typeChars('+77')).toBe('+7 (7');
  });

  it('deletes one digit per backspace, including over brackets and dashes', () => {
    const full = '+7 (701) 123-45-67';
    expect(backspace(full, 1)).toBe('+7 (701) 123-45-6');
    expect(backspace(full, 2)).toBe('+7 (701) 123-45');
    expect(backspace(full, 3)).toBe('+7 (701) 123-4');
    expect(backspace(full, 7)).toBe('+7 (701');
    expect(backspace(full, 10)).toBe('');
    expect(formatPhone('+7 (701) 123-45-67'.replace(')', ''), '+7 (701) 123-45-67')).toBe('+7 (701) 123-45-6');
  });

  it('clears the field', () => {
    expect(formatPhone('', '+7 (7')).toBe('');
  });

  it('detects a complete number', () => {
    expect(isCompletePhone('+7 (701) 123-45-67')).toBe(true);
    expect(isCompletePhone('+7 (701) 123-45')).toBe(false);
  });
});

describe('safeFileName', () => {
  it('removes characters that break file names', () => {
    expect(safeFileName('Договор №5 Иванов/Петров: "тест"')).toBe('Договор №5 Иванов Петров тест');
  });
});
