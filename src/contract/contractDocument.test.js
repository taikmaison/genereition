import { describe, expect, it } from 'vitest';
import { buildContractDocument } from './contractDocument';
import { EXECUTOR } from './executor';

const NB_HYPHEN = String.fromCharCode(0x2011);

// Flatten a pdfmake node tree into plain text, one block per line.
const textOf = (node) => {
  if (node == null) return '';
  if (typeof node === 'string') return node.replaceAll(NB_HYPHEN, '-');
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node.text !== undefined) return textOf(node.text);
  if (node.stack) return node.stack.map(textOf).join('\n');
  if (node.columns) return node.columns.map(textOf).join(' | ');
  if (node.table) return node.table.body.map((row) => row.map(textOf).join(' | ')).join('\n');
  return '';
};
const docText = (data) => buildContractDocument(data).content.map(textOf).join('\n');

const FILLED = {
  contractNumber: '136',
  date: '2026-10-04',
  name: 'Тестов Тест Тестұлы',
  iin: '900101300123',
  idCard: '012345678',
  phone: '+7 (701) 123-45-67',
  address: 'Шымкент қ., Тест к-сі, 1',
  pay1: '5000',
  pay2: '300000',
  pay3: '150000',
};

describe('buildContractDocument', () => {
  const text = docText(FILLED);

  it('uses the paper contract page setup', () => {
    const doc = buildContractDocument(FILLED);
    expect(doc.pageSize).toBe('A4');
    expect(doc.defaultStyle).toMatchObject({ font: 'Tinos', fontSize: 12, alignment: 'justify' });
    expect(doc.pageMargins.map((pt) => Math.round((pt * 25.4) / 72 * 10) / 10)).toEqual([22.5, 11.8, 17.1, 14.3]);
    expect(doc.footer(1)).toBeNull();
    expect(doc.footer(2).text).toBe('2');
  });

  it('fills the header and preamble', () => {
    expect(text).toContain('Қызмет көрсету шарты №136');
    expect(text).toContain('Шымкент қаласы | 04.10.2026 жыл');
    expect(text).toContain('деп аталатын Тестов Тест Тестұлы (900101300123) негізінде әрекет ететін');
    expect(text).toContain('«SENIMDI» ЖК (ЖСН: 961103401303) атынан');
    expect(text).toContain(`атынан директоры ${EXECUTOR.director}`);
  });

  it('numbers sections and items without gaps or duplicates', () => {
    const numbers = [...text.matchAll(/^(?:\d+\.)+(?= )/gm)].map((m) => m[0]);
    expect(new Set(numbers).size).toBe(numbers.length);
    expect(numbers).toContain('2.2.');
    expect(numbers).toContain('2.4.2.');
    expect(numbers).toContain('3.8.');
    expect(numbers).toContain('4.8.');
    expect(numbers).toContain('7.8.');
    expect(text).toMatch(/^8\. ТАРАПТАРДЫҢ РЕКВИЗИТТЕРІ$/m);
    const headings = [...text.matchAll(/^(\d)\. ([А-ЯӘҒҚҢӨҰҮҺІ ]+)$/gm)].map((m) => Number(m[1]));
    expect(headings).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('writes amounts with words and the prepayment percent', () => {
    expect(text).toContain('Алдын ала кеңес беру ақысы – 5 000 (бес мың) теңге.');
    expect(text).toContain('Қызмет көрсету ақысы – 300 000 (үш жүз мың) теңге.');
    expect(text).toContain('50% алдын-ала төлем – 150 000 (жүз елу мың) теңге осы Шартқа');
    expect(text).toContain('сату сатып алу шарты жасалған сәтте қалған 50% төлем – 150 000 (жүз елу мың) теңге 1 күн ішінде');
    expect(text).toContain('және 50% алдын ала төлем қайтарылмайды.');
  });

  it('follows a non-standard prepayment', () => {
    const t = docText({ ...FILLED, pay2: '400000', pay3: '120000' });
    expect(t).toContain('30% алдын-ала төлем – 120 000 (жүз жиырма мың)');
    expect(t).toContain('қалған 70% төлем – 280 000 (екі жүз сексен мың)');
    const odd = docText({ ...FILLED, pay2: '300000', pay3: '100000' });
    expect(odd).toContain('3.6. Алдын-ала төлем – 100 000 (жүз мың)');
    expect(odd).toContain('қалған төлем – 200 000 (екі жүз мың)');
    expect(odd).not.toMatch(/\d% алдын/);
  });

  it('includes the current executor requisites', () => {
    for (const value of [EXECUTOR.iban, EXECUTOR.bik, EXECUTOR.iin, EXECUTOR.address]) expect(text).toContain(value);
    expect(EXECUTOR.iban).toMatch(/^KZ\d{2}[A-Z0-9]{16}$/);
    expect(text).toContain('БСН/ЖСН: 900101300123');
    expect(text).toContain('Тел.: +7 (701) 123-45-67');
    expect(text).toContain('Жеке куәлік: 012345678');
  });

  it('contains the clauses changed in the current contract', () => {
    expect(text).toContain('4.4. Алдын ала орын алу үшін (бронь) төлеген төлем Орындаушының шығыны ретінде ұсталып қалады.');
    expect(text).toContain('2.2. Тапсырыс беруші міндетті:');
    expect(text).toContain('екі жақ төменде');
    expect(text).not.toMatch(/кілті берілген/);
  });

  it('renders a blank form with lines instead of "нөл" or "undefined"', () => {
    const blank = docText({ contractNumber: '', date: '', name: '', iin: '', idCard: '', phone: '', address: '', pay1: '', pay2: '', pay3: '' });
    expect(blank).not.toMatch(/undefined|null|NaN|нөл/);
    expect(blank).toContain('Қызмет көрсету шарты №____');
    expect(blank).toContain('Алдын ала кеңес беру ақысы – __________ (____________________) теңге.');
    expect(blank).toContain('50% алдын-ала төлем – __________');
  });

  it('writes an explicit zero as "0 (нөл)"', () => {
    expect(docText({ ...FILLED, pay1: '0' })).toContain('ақысы – 0 (нөл) теңге');
  });

  it('keeps justified lines free of artificial gaps', () => {
    const doc = buildContractDocument(FILLED);
    const raw = JSON.stringify(doc.content);
    // hyphenated words must not be split by the line breaker
    expect(raw).toContain(`алдын${NB_HYPHEN}ала`);
    expect(raw).not.toMatch(/[А-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі]-[А-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі]/);
    // pdfmake adds justification space between runs, so runs must meet at a single trailing space
    const paragraphs = [];
    const walk = (n) => {
      if (!n || typeof n !== 'object') return;
      if (Array.isArray(n)) return n.forEach(walk);
      if (Array.isArray(n.text) && n.alignment !== 'center') paragraphs.push(n.text);
      ['stack', 'columns'].forEach((k) => n[k] && walk(n[k]));
    };
    walk(doc.content);
    const str = (r) => (typeof r === 'string' ? r : r.text);
    for (const runs of paragraphs) {
      for (let i = 1; i < runs.length; i++) {
        const where = `${str(runs[i - 1])}|${str(runs[i])}`;
        expect(str(runs[i - 1]), where).toMatch(/\s$/); // the space ends the previous run...
        expect(str(runs[i]), where).not.toMatch(/^\s/); // ...and never starts the next one
      }
    }
  });

  it('uses only Cyrillic letters inside Kazakh words', () => {
    // Latin "ə"/"i" look identical on screen but break search and some fonts.
    expect(text).not.toMatch(/ə/); // Latin schwa instead of Cyrillic "ә"
    expect(text).not.toMatch(/[Ѐ-ӿ]i|i[Ѐ-ӿ]/); // Latin "i" instead of Cyrillic "і"
  });
});
