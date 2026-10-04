import { CONTRACT_CITY, EXECUTOR } from './executor';
import { formatContractDate, formatNumber, getPayments, numberToKazakhWords } from '../utils';

// Page geometry copied from the reference Word contract (A4, Times New Roman 12 pt).
const mm = (value) => (value * 72) / 25.4;
const PAGE_MARGINS = [mm(22.5), mm(11.8), mm(17.1), mm(14.3)]; // left, top, right, bottom
const FONT_SIZE = 12;
const LINE = FONT_SIZE * 1.15; // one empty line in Word "single" spacing
const INDENT = mm(10);

const BLANK = '____________________';
const BLANK_SHORT = '__________';

const b = (text) => ({ text, bold: true });
const valueOr = (value, placeholder = BLANK) => {
  const trimmed = String(value ?? '').trim();
  return trimmed === '' ? placeholder : trimmed;
};

// "150 000 (жүз елу мың)" or a blank to fill in by hand.
const amountWithWords = (amount) =>
  amount === null ? `${BLANK_SHORT} (${BLANK})` : `${formatNumber(amount)} (${numberToKazakhWords(amount)})`;

const percentPrefix = (percent) => (percent === null ? '' : `${percent}% `);
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Contract body. Numbering (1., 1.1., 2.1.1. ...) is generated, so items can be
// added or removed without renumbering by hand.
function buildSections(data) {
  const p = getPayments(data);
  const prepaymentPct = percentPrefix(p.prepaymentPercent);
  const remainderPct = percentPrefix(p.remainderPercent);

  return [
    {
      title: 'ШАРТТЫҢ МӘНІ',
      items: [
        ['Орындаушы Тапсырыс берушінің тапсырмасы бойынша осы Шарттың 1.2-тармағында көрсетілген қызметтерді ұсынуға міндеттенеді, ал Тапсырыс беруші осы қызметтер үшін ақы төлеуге міндеттенеді.'],
        ['Орындаушы келесі қызметтерді көрсетуді міндеттенеді: ', b('жылжымайтын мүлікті сатып алу, ипотекаға рәсімдеу бойынша сүйемелдеу қызметі'), ' (бұдан әрі «Қызметтер» деп аталады).'],
        ['Қызметтерді көрсету мерзімі осы Шартқа қол қойылған күннен бастап ', b('бір жыл'), ' мерзімді құрайды. Егер бір жыл ішінде тараптардың кінәсінсіз жағдайлармен (форс-мажор, мемлекеттік бағдарламаның тоқтатылуы, мемлекеттік кезектің ұзақтығы т.б.) шарт міндеттемесін яғни жылжымайтын мүлікті алу мүмкін болмаған жағдайда, осы шарттың мерзімі тараптардың келісімімен 6 (алты) айға ұзартылады. Егер бұл жағдайда шарт мерзімі ұзартылмаса, бір жыл көлемінде атқарылған жұмыстың шығындары ұстап қалынады.'],
        ['Қызметтерді көрсету уақыты мен орнын Орындаушы белгілейді.'],
      ],
    },
    {
      title: 'ТАРАПТАРДЫҢ ҚҰҚЫҚТАРЫ МЕН МІНДЕТТЕР',
      groups: [
        {
          title: 'Орындаушы міндетті:',
          items: [
            ['Қызметті тиісті сапада, уақытылы және толық орындауға;'],
            ['Тапсырыс берушінің қызметтер бойынша туындаған сұрақтарына жауап беруге, ол үшін тиімді ипотекалық бағдарламалар бойынша кеңестер беруге;'],
            ['Тапсырыс берушінің жылжымайтын мүлікті алуға оң әсер ететін құқықтық жағдайына мониторинг жасап отыруға;'],
            ['Өз бетімен немесе Тапсырыс берушімен бірге ипотека рәсімдеуге оңтайлы екінші деңгейлі банк іздеуге және олармен келіссөздер жүргізуге;'],
            ['Екінші деңгейлі банктерден ипотека бойынша оң қорытынды алуға қажетті құжаттарды тапсыруға, конкурстарға қатысуына көмек көрсетуге;'],
            ['Конкурс немесе банкке тапсырылған құжаттар негізінде шығарылатын шешімге бақылау жасауға және шешім шыққан жағдайда Тапсырыс берушіге хабардар етуге;'],
            ['Тапсырыс берушіден алынған құжаттардың, материалдық құндылықтардың жоғалып кетпеуіне жауапкершілік алуға және Тапсырыс берушінің мүлкіне ұқыпты қарауға;'],
            ['Тапсырыс берушіге адамдардың өмірі мен денсаулығына, Тапсырыс берушінің мүліктерінің сақталуына қауіп төндіретін жағдайлардың пайда болуы мүмкіндігі туралы дереу хабарлауға;'],
            ['Қызмет көрсету барысында өзіне белгілі болған қызметтік, коммерциялық немесе заңмен қорғалатын өзге де құпияны құрайтын мәліметтерді жария етпеуге.'],
          ],
        },
        {
          title: 'Тапсырыс беруші міндетті:',
          items: [
            ['Көрсетілген қызметтерді уақытылы қабылдауға және ақысын төлеуге;'],
            ['Қызметтерді көрсетуге қажетті барлық жағдайларды жасауға, екінші деңгейлі банктермен келіссөздерге, құжаттарға қол қою және басқа да жағдайларда өзі немесе заңды өкілі арқылы міндетті түрде қатысуға;'],
            ['Осы шарттың мерзімі аясында басқа тұлғаларға (брокерлерге, консалтинг компанияларына және т.б.) осы шарт мәніне ұқсас қызметтер алу үшін жүгінбеуге;'],
            ['Осы шарт бойынша міндеттемесін орындауға кедергі келтіретін жағдайлар орын алғанда, ол жайлы Орындаушыға дереу хабарлауға;'],
            ['Орындаушыға оң нәтиже алуға қажетті рас, дұрыс ақпараттарды, құжаттарды және т.б. уақтылы беруге;'],
            ['Тапсырыс берушінің жылжымайтын мүлікті алуға оң әсер ететін құқықтық жағдайына мониторинг жасап отыруына қажетті ақпараттарды ұсынуға;'],
            ['Орындаушының қызметінің нәтижесінде ипотеканы сәтті рәсімдеген жағдайда Whatsapp желісі арқылы аудио немесе смспен пікір білдіруге;'],
            ['Ипотека рәсімдеген соң Орындаушының кейсі ретінде видео немесе фотосының әлеуметтік желіге шығаруына рұқсат беруге;'],
            ['ҚР заң талаптары мен осы Шарт ережелерін қатаң сақтауға.'],
          ],
        },
        {
          title: 'Орындаушы құқылы:',
          items: [
            ['Осы Шарт талаптарына сәйкес қызмет көрсету ақысының төленуін талап етуге егер төленбеген жағдайда ҚР заңнамасы аясында талап етуге;'],
            ['Тапсырыс берушінің өзіне құрметпен қарауын, сыпайылық танытуын талап етуге;'],
            ['Осы шарт бойынша қызмет көрсетуге үшінші тұлғаларды тартуға.'],
          ],
        },
        {
          title: 'Тапсырыс беруші құқылы:',
          items: [
            ['Осы Шартқа сәйкес Орындаушыдан Қызметтердің уақытылы және толық көлемде көрсетілуін талап етуге;'],
            ['Кез келген уақытта Орындаушының қызметіне кедергі келтірместен, қызметтерді көрсету барысы мен сапасын тексеруге.'],
          ],
        },
      ],
    },
    {
      title: 'ШАРТТЫҢ ҚҰНЫ ЖӘНЕ ТӨЛЕУ ШАРТТАРЫ',
      items: [
        ['Қызметке ақы төлеу Орындаушы ұсынған шотқа төлем жасау арқылы жүргізіледі.'],
        ['Баға теңгемен көрсетіледі.'],
        ['Алдын ала кеңес беру ақысы – ', b(`${amountWithWords(p.consultation)} теңге.`), ' Бұл сома алдын ала кеңес алу барысында төленуі тиіс және ол қайтарылуға жатпайды.'],
        ['Қызмет көрсету ақысы – ', b(`${amountWithWords(p.total)} теңге.`)],
        ['Қызмет ақысы қолма-қол немесе 1-Тараптың есеп шотына аударым жасау арқылы жүргізіледі.'],
        [b(capitalize(`${prepaymentPct}алдын-ала төлем – ${amountWithWords(p.prepayment)}`)), ' теңге осы Шартқа қол қойған күннен бастап 1 (бір) күн ішінде жасалады.'],
        ['Ипотека рәсімдеу барысында басқа шығындар (нотариус, бағалаушы қызметақысы, банктің комиссиялары және т.б.) Тапсырыс берушімен бөлек төленеді.'],
        ['Бір жыл ішінде Орындаушы ипотекаға жылжымайтын мүлік алуды сәтті орындаса, ', b(`жылжымайтын мүліктің бойынша сату сатып алу шарты жасалған сәтте қалған ${remainderPct}төлем – ${amountWithWords(p.remainder)} теңге 1 күн ішінде төленуі тиіс.`)],
      ],
    },
    {
      title: 'ТАРАПТАРДЫҢ ЖАУАПКЕРШІЛІГІ',
      items: [
        ['Осы шарт бойынша міндеттемелерді орындамағаны немесе тиісінше орындамағаны үшін Тараптар Қазақстан Республикасының заңнамасына сәйкес жауаптылықта болады.'],
        ['Осы шарт аясында алынған жылжымайтын мүліктің сапасына Орындаушы жауапты емес. Мемлекеттік бағдарламамен берілетін үйдің қабатына, бөлме санына Орындаушы жауапты емес.'],
        [`Егер ипотека рәсімдеу барысында Тапсырыс берушінің тарапынан банктің оң шешім қабылдауына кедергі келтірген әрекеттер орын алса (несие алу, ломбард немесе микроқаржы ұйымынан қарыз алу, басқа тұлғаларға, брокерлерге жүгіну т.б.), банктің теріс шешімі үшін Орындаушы жауапты болып табылмайды. Мұндай жағдайда Орындаушы тарапынан қызмет толық көрсетілді деп есептеледі және ${prepaymentPct}алдын ала төлем қайтарылмайды.`],
        ['Алдын ала орын алу үшін (бронь) төлеген төлем Орындаушының шығыны ретінде ұсталып қалады.'],
        ['Орындаушы Қазақстан Республикасының қолданыстағы заңнамасы мен осы Шарт ережелеріне сәйкес, Тапсырыс берушінің мүлкін жоғалтқаны немесе бүлдіргені үшін, Орындаушының әрекеті (әрекетсіздігі) салдарынан болған залал үшін, оның ішінде құпия ақпаратты жария еткен жағдайда материалдық жауаптылықта болады.'],
        ['Конкурстан өткен жағдайда жылжымайтын мүлік Тапсырыс берушінің субъективтік күткеніндей болмағаны үшін Орындаушы жауап бермейді. Бұл жағдайда жылжымайтын мүлікті рәсімдеу немесе рәсімдемеуіне қарамастан, қызмет толық көрсетілген болып саналады және толық қызмет ақы төленуге жатады.'],
        ['Тапсырыс беруші Мемлекеттік порталдардан, 1414 колл орталығынан, банк жүйесінен келген кодтар мен парольдерді Орындаушының рұқсатынсыз жауап бермеуі тиіс.'],
        ['Егер жер сілкінісі, өрт, тасқын су секілді өзге де табиғи апаттардың, эпидемия, авария, жарылыс, әскери әрекеттер, заңнаманың өзгеруі, уәкілетті тұлғалардың актілері немесе нотариустың, бағалаушы компанияның қателігі, банк жүйесіндегі ақаулар т.б. әсерінен орындау мүмкін емес жағдайлар орын алған кезде Тараптар осы Шарт бойынша міндеттемелерді орындамағаны немесе тиісінше орындамағаны үшін жауапкершіліктен босатылады. Мұндай жағдайда тараптар Шарт бойынша өз міндеттемелерін орындау үшін барлық мүмкін әрекеттерді жасайды және міндеттемелерді орындау мерзімін келісілген уақытқа өзгерте алады.'],
      ],
    },
    {
      title: 'ДЕРБЕС ДЕРЕКТЕРДІ ӨҢДЕУ',
      items: [
        ['Орындаушы ҚР заңнамасына сәйкес дербес деректерге өңдеу жүргізуге құқылы – яғни, осы шартты орындау қажеттігіне байланысты мақсатта автоматтандыру құралдарын пайдалана отырып немесе ондай құралдарды пайдаланбай дербес деректерді жинауды, жазуды, жүйелеуді, жинақтауды, сақтауды, нақтылауды (жаңарту, өзгерту), алуды, пайдалануды, беруді (тарату, ұсыну, қолжетімділік), иесіздендіруді, бұғаттауды, өшіруді, жоюды қоса алғандағы кез келген әрекет (операция) немесе әрекеттер жиынтығы (операциялар).'],
      ],
    },
    {
      title: 'ШАРТ БОЙЫНША ДАУЛАРДЫ ШЕШУ',
      items: [
        ['Тараптар арасында осы шарт бойынша туындаған барлық даулар Тараптар арасындағы келіссөздер арқылы шешіледі.'],
        ['Тараптар өзара келіссөздер барысында келісімге келе алмаған жағдайда барлық даулар Қазақстан Республикасының заңнамасына сәйкес сот тәртібімен Орындаушының тіркелген жері бойынша қаралады.'],
      ],
    },
    {
      title: 'ҚОРЫТЫНДЫ ЕРЕЖЕЛЕР',
      items: [
        ['Осы Шарт оған Тараптар қол қойған күнінен бастап күшіне енеді және міндеттемелер толық орындалғанға дейін әрекет етеді.'],
        ['Шарт Тараптардың екі жақты келісімі бойынша бұзылуы мүмкін. Шартты тоқтатуды талап ететін Тарап өзінің ниеті туралы екінші Тарапты 1 (бір) айдан кешіктірмей хабардар етуге тиіс.'],
        ['Шарт мерзімі аяқталғанда немесе мерзімінен бұрын бұзылған жағдайда тараптардың арасында көрсетілген қызметтердің актісі жасалынуы тиіс.'],
        ['Осы Шарт мерзімінен бұрын бұзылған жағдайда Орындаушы нақты шығындар үшін қызмет ақысын ұстап қалуға құқылы.'],
        ['Осы Шартпен реттелмеген жағдайлар бойынша Тараптар Қазақстан Республикасының заңнамасын басшылыққа алады.'],
        ['Осы Шартқа енгізілген кез келген өзгерістер мен толықтырулар, егер олар жазбаша түрде жасалған және тараптар қол қойған кезде ғана жарамды болады. Осы Шартқа қосымшалар оның ажырамас бөлігін құрайды.'],
        ['Соттың осы Шарттың белгілі бір бөлігін жарамсыз немесе мәжбүрлі түрде орындауға жатпайды деп тануы Шарттың басқа бөлігінің жарамсыздығын немесе орындалмайтындығын білдірмейді.'],
        ['Осы Шарт бірдей заңды күші бар қазақ тілінде 2 (екі) данада, Тараптардың әрқайсысы үшін бір-бір данадан жасалды.'],
      ],
    },
  ];
}

const heading = (number, title) => ({
  text: [`${number}. `, b(title)],
  alignment: 'center',
  margin: [0, LINE, 0, LINE],
});

const paragraph = (number, runs) => ({ text: [`${number} `, ...runs], leadingIndent: INDENT });
const subheading = (number, title) => ({ text: `${number} ${title}`, bold: true, leadingIndent: INDENT });

// A heading (and a sub-heading) must never be left alone at the bottom of a page:
// it is glued to the paragraph that follows it.
const keepTogether = (...blocks) => ({ stack: blocks, unbreakable: true });

function renderSection(section, sectionNo) {
  const out = [];
  const head = heading(sectionNo, section.title);

  if (section.items) {
    section.items.forEach((runs, i) => {
      const block = paragraph(`${sectionNo}.${i + 1}.`, runs);
      out.push(i === 0 ? keepTogether(head, block) : block);
    });
    return out;
  }

  section.groups.forEach((group, g) => {
    const groupNo = `${sectionNo}.${g + 1}.`;
    const sub = subheading(groupNo, group.title);
    group.items.forEach((runs, i) => {
      const block = paragraph(`${groupNo}${i + 1}.`, runs);
      if (i > 0) out.push(block);
      else if (g === 0) out.push(keepTogether(head, sub, block));
      else out.push(keepTogether(sub, block));
    });
  });
  return out;
}

const line = (label, value, { boldValue = false } = {}) => ({
  text: [b(label), boldValue ? b(value) : value],
  margin: [0, 0, 0, 2],
});

const signature = () => ({
  margin: [0, LINE * 2, 0, 0],
  columns: [
    { width: 100, stack: [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 0.6 }] }, { text: 'қолы', italics: true, alignment: 'center', fontSize: 10 }] },
    { width: 14, text: '' },
    { width: '*', stack: [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 110, y2: 0, lineWidth: 0.6 }] }, { text: 'ТАӘ', italics: true, alignment: 'left', margin: [48, 0, 0, 0], fontSize: 10 }] },
  ],
});

function requisites(data, sectionNo) {
  const client = [
    { text: 'Тапсырыс беруші:', bold: true, margin: [0, 0, 0, 4] },
    { text: valueOr(data.name), bold: true, margin: [0, 0, 0, 2] },
    line('Мекен-жайы: ', valueOr(data.address)),
    line('БСН/ЖСН: ', valueOr(data.iin), { boldValue: true }),
    line('Жеке куәлік: ', valueOr(data.idCard)),
    line('Тел.: ', valueOr(data.phone), { boldValue: true }),
  ];
  const executor = [
    { text: 'Орындаушы:', bold: true, margin: [0, 0, 0, 4] },
    { text: EXECUTOR.name, bold: true, margin: [0, 0, 0, 2] },
    line('Мекен-жайы: ', EXECUTOR.address),
    line('ЖСН: ', EXECUTOR.iin),
    line('Банк: ', EXECUTOR.bank),
    line('КБе: ', EXECUTOR.kbe),
    line('БИК: ', EXECUTOR.bik),
    line('Шот: ', EXECUTOR.iban),
  ];

  return keepTogether(
    heading(sectionNo, 'ТАРАПТАРДЫҢ РЕКВИЗИТТЕРІ'),
    {
      alignment: 'left',
      table: {
        widths: ['*', '*'],
        body: [
          [{ stack: client }, { stack: executor }],
          [signature(), signature()],
        ],
      },
      layout: {
        hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0.6 : 0),
        vLineWidth: () => 0.6,
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: (i) => (i === 0 ? 5 : 0),
        paddingBottom: (i, node) => (i === node.table.body.length - 1 ? 8 : 0),
      },
    },
  );
}

// Work around two pdfmake quirks in justified text:
//  * it breaks lines after "-" and stretches the gap between the halves of a word ("алдын- ала");
//    a non-breaking hyphen (U+2011) keeps such words whole;
//  * a run starting with a space becomes a separate "word" that gets extra justification space,
//    so a space between runs is moved to the end of the previous run.
const NB_HYPHEN = String.fromCharCode(0x2011);
const runText = (run) => (typeof run === 'string' ? run : run.text);
const withRunText = (run, text) => (typeof run === 'string' ? text : { ...run, text });

function joinRuns(runs) {
  const out = runs.map(typeset);
  for (let i = 1; i < out.length; i++) {
    const prev = runText(out[i - 1]);
    const text = runText(out[i]);
    if (typeof prev === 'string' && typeof text === 'string' && /^\s/.test(text)) {
      out[i - 1] = withRunText(out[i - 1], `${prev.trimEnd()} `);
      out[i] = withRunText(out[i], text.trimStart());
    }
  }
  return out.filter((run) => runText(run) !== '');
}

function typeset(node) {
  if (typeof node === 'string') return node.replace(/(?<=\S)-(?=\S)/g, NB_HYPHEN);
  if (Array.isArray(node)) return node.map(typeset);
  if (!node || typeof node !== 'object') return node;
  const out = { ...node };
  if (Array.isArray(out.text)) out.text = joinRuns(out.text);
  else if ('text' in out) out.text = typeset(out.text);
  for (const key of ['stack', 'columns']) if (key in out) out[key] = typeset(out[key]);
  if (out.table) out.table = { ...out.table, body: typeset(out.table.body) };
  return out;
}

export const contractTitle = (data) => `Қызмет көрсету шарты №${valueOr(data.contractNumber, '____')}`;

export function buildContractDocument(data) {
  const sections = buildSections(data);
  const date = formatContractDate(data.date);

  const content = [
    { text: contractTitle(data), bold: true, alignment: 'center', margin: [0, 0, 0, LINE] },
    {
      columns: [
        { text: CONTRACT_CITY, bold: true },
        { text: `${date || BLANK_SHORT} жыл`, bold: true, alignment: 'right' },
      ],
      margin: [0, 0, 0, LINE],
    },
    {
      leadingIndent: INDENT,
      text: [
        b('Бұдан әрі «Тапсырыс беруші» деп аталатын '),
        b(valueOr(data.name)),
        ' ',
        b(`(${valueOr(data.iin, '____________')})`),
        ' негізінде әрекет ететін және екінші тараптан, бұдан әрі «Орындаушы» деп аталатын ',
        `${EXECUTOR.name} `,
        b(`(ЖСН: ${EXECUTOR.iin})`),
        ' атынан директоры ',
        b(EXECUTOR.director),
        ' бұдан әрі бірлескен түрде – «Тараптар», ал жекелей түрде – «Тарап» деп аталатын екі жақ төменде көрсетілгендер туралы осы қызмет көрсету шартын (бұдан әрі – «Шарт») жасасты:',
      ],
    },
    ...sections.flatMap((section, i) => renderSection(section, i + 1)),
    requisites(data, sections.length + 1),
  ];

  return {
    pageSize: 'A4',
    pageMargins: PAGE_MARGINS,
    info: { title: contractTitle(data), author: 'SENIMDI', subject: 'Қызмет көрсету шарты' },
    defaultStyle: { font: 'Tinos', fontSize: FONT_SIZE, alignment: 'justify' },
    footer: (currentPage) =>
      currentPage > 1
        ? { text: String(currentPage), alignment: 'right', fontSize: 10, margin: [PAGE_MARGINS[0], 0, PAGE_MARGINS[2], 0] }
        : null,
    content: typeset(content),
  };
}
