/**
 * Persian UI catalog. Console command names, HTTP methods and code stay in
 * English; the interface is right-to-left.
 */

export const fa = {
  locale: 'fa',
  dir: 'rtl',
  ui: {
    // toolbar
    sandboxMode: 'حالت سندباکس',
    levels: 'مرحله‌ها',
    lesson: 'درس',
    lessonTitle: 'مرور دوباره اسلایدهای مقدمه‌ی این مرحله',
    guide: 'راهنما',
    hint: 'سرنخ',
    solution: 'راه‌حل',
    undo: 'بازگشت',
    reset: 'بازنشانی',
    sandboxBtn: 'سندباکس',
    help: 'راهنما',
    uiGuideTitle: 'راهنمای رابط: هر بخش چه می‌کند',
    language: 'زبان',
    menuLabel: 'منو',
    githubTitle: 'گیت‌هاب: سورس و ایشو',
    support: 'Buy me a coffee',
    supportTitle: 'حمایت از ناشر',
    visitorsTitle: 'تعداد یادگیرندگانی که اینجا تمرین کرده‌اند',
    titleLine: (id, name, par) => `${id} · ${name} · ایده‌آل ${par} فرمان`,
    guidePanel: 'پنل راهنمای یادگیری',

    // workspace
    tabPipeline: 'خط لوله',
    tabSurface: 'سطح API',
    tabOpenapi: 'OpenAPI',
    editorRun: 'اجرا',
    openapiPlaceholder: '// برای کامپایل، Run را بزنید',
    consoleTitle: 'کنسول',

    // dock (guide)
    guideTitle: 'راهنمای یادگیری',
    guideSubtitle: 'پنل همیشه‌باز. در هر مرحله مفاهیم، یادداشت‌های میدانی و چک‌لیست راه‌حل را نشان می‌دهد.',
    startHere: 'از اینجا شروع کنید',
    startHereItems: [
      '**مرحله‌ها** را باز کنید و با مبانی HTTP شروع کنید: اندپوینت چیست؟',
      'برای فهرست دستورها در کنسول `help` بنویسید',
      '**Run** (`Ctrl+Enter`) را بزنید تا کد ادیتور در سرور شبیه‌ساز کامپایل شود',
      '`call GET /` را بنویسید تا درخواست بفرستید و خط لوله را ببینید',
    ],
    sandboxTip: 'نکته‌ی سندباکس',
    sandboxTipItems: [
      'خط لوله: Client → Router → Handler → Response',
      'کنسول: `call POST /users body={"name":"ada"}`',
      'تب OpenAPI سند زنده‌ی کد شما را نشان می‌دهد',
      'پیشرفت در همین مرورگر ذخیره می‌شود (localStorage + cookie)',
    ],
    noActiveLevel: 'مرحله‌ی فعالی نیست',
    noActiveLevelDetail: 'levels ← یک چالش انتخاب کنید تا چک‌لیست اینجا بیاید',
    guideFlashNote: 'دکمه‌ی **راهنما** در نوار ابزار این پنل را چشمک می‌زند. در تمام ارتفاع صفحه باز می‌ماند.',
    youAreLearning: 'در حال یادگیری',
    fieldNotesTitle: 'در تولید (یادداشت میدانی)',
    typeNextTitle: 'گام بعدی، با هایلایت نارنجی',
    remainingLabel: 'باقی‌مانده',
    wrongCommandNote: 'نتیجه اشتباه شد؟ همین‌جا می‌مانید و پیشرفت حفظ می‌شود. تاریخچه: ↑ / ↓',
    allSolutionMet: 'همه‌ی هدف‌های این مرحله برآورده شد.',
    nowChip: 'اکنون',
    stateNotes: 'هدف‌های باز:',
    bestSoFar: (cmds, par) => `بهترین تا اینجا: ${cmds} فرمان · ایده‌آل: ${par}`,
    idealSolution: (par) => `ایده‌آل: ${par} فرمان (کمتر یا مساوی عالی است)`,
    solvedBanner: (n) => `مرحله حل شد${n !== null ? ` با ${n} فرمان` : ''}.`,
    targetBadge: {
      editor: 'ادیتور کد',
      run: 'ادیتور ← Run',
      openapi: 'تب OpenAPI',
      console: 'کنسول',
    },
    targetActionHint: {
      editor: 'کد سرور',
      run: 'Ctrl+Enter',
      openapi: 'مستند قرارداد',
      console: 'api $',
    },
    nextStepTitle: {
      edit: 'گام بعدی: نوشتن در ادیتور کد',
      run: 'گام بعدی: کامپایل سرور (Run)',
      call: 'گام بعدی: تست در کنسول ترمینال',
    },
    nextStepPrompt: {
      edit: 'در ادیتور کد بنویسید:',
      run: 'کامپایل کد:',
      call: 'در خط فرمان کنسول وارد کنید:',
    },
    goalDetail: (g) => {
      if (g.kind === 'code') return 'در ادیتور کد بنویسید: سورس باید شامل این عبارت باشد';
      if (g.kind === 'endpoint') return `با دکمه Run کامپایل کنید تا این مسیر ثبت شود${g.status ? ` · وضعیت ${g.status}` : ''}`;
      if (g.kind === 'openapi') return 'تب OpenAPI: سند پس از کامپایل باید شامل این ساختار/مسیر باشد';
      if (g.kind === 'call') return `در کنسول ترمینال اجرا کنید: پاسخ باید کد ${g.expectStatus} باشد${g.expectBody ? ' · بدنه مطابقت دارد' : ''}`;
      return '';
    },
    runNext: 'دکمه Run (یا Ctrl+Enter) در ادیتور را بزنید تا سرور کامپایل شود',
    editNext: (g) => {
      if (g.kind === 'code') return `در ادیتور: عبارت «${g.label}» را بنویسید، سپس Run بزنید`;
      if (g.kind === 'endpoint') return `در ادیتور: این اندپوینت را تعریف کنید، سپس Run بزنید`;
      return `در ادیتور: ساختار مناسب برای این مستند را اضافه کنید، سپس Run بزنید`;
    },
    allDoneNext: 'همه‌ی هدف‌ها برآورده شد',

    // terminal
    termNext: 'بعدی',
    termTabNote: 'Tab هر بار یک کلمه کامل می‌کند',
    termPlaceholder: (cmd) => `بعدی: ${cmd} (Tab کلمه‌به‌کلمه)`,
    termPlaceholderIdle: 'یک دستور بنویسید، مثلاً help',
    welcomeLine: 'welcome to learn <api>',
    welcomeSub: 'سندباکس تعاملی API. `help` بنویسید، یا `levels` برای شروع نخستین آموزش.',
    sandboxSeeded: 'سندباکس با یک برنامه‌ی FastAPI آماده است. ویرایش کنید، Run بزنید، بعد `call GET /`.',
    progressSaved: 'پیشرفت در همین مرورگر ذخیره می‌شود (localStorage + cookie). هر زمان برگردید.',
    resumeLines: (done, total, pct, nextName) => [
      `خوش برگشتید. پیشرفت ذخیره‌شده: ${done}/${total} مرحله (${pct}٪).`,
      nextName ? `مرحله‌ی بعدی: ${nextName}` : 'همه‌ی مرحله‌ها تمام شد.',
      'برای ادامه Levels را باز کنید. داخل مرحله `goal` چک‌لیست را نشان می‌دهد.',
    ],
    loadedLevel: (name) => `بارگذاری شد: ${name}`,
    sandboxFree: 'سندباکس: کار آزاد',
    serverNotRunning: 'سرور اجرا نشده. اول Run را بزنید',
    runSummary: (n, title) => `اجرا: ${n} مسیر · ${title}`,
    editorWarn: 'با هشدار کامپایل شد',
    editorCompiled: (n, lang) => `${n} مسیر · ${lang}`,
    editorGoalsOpen: (n) => `${n} هدف باز`,
    editorSolved: 'حل شد',
    nothingToUndo: 'چیزی برای بازگشت نیست',
    undoMeta: 'به اجرای قبلی برگشتید',
    resetMeta: (name) => `بازنشانی شد: ${name}`,
    solutionLoaded: 'راه‌حل بارگذاری شد، Run را بزنید',
    noSolution: 'سندباکس راه‌حل ندارد',
    noHint: 'اینجا سرنخی نیست',
    levelsPick: 'فهرست مرحله‌ها باز شد',
    nextMeta: (cmd) => `بعدی: ${cmd}`,
    unknownCommand: (name) => `دستور ناشناخته: ${name}. 'help' را امتحان کنید`,
    usageCall: 'راهنما: call <METHOD> <path> [body=JSON] [headers=JSON]',
    invalidJson: (what, raw) => `${what} یک JSON معتبر نیست: ${raw}`,
    goalsHeading: 'هدف‌ها',
    cmdHelp: {
      help: 'نمایش همین فهرست',
      levels: 'مرور مرحله‌ها',
      hint: 'نمایش سرنخ مرحله',
      run: 'کامپایل کد ادیتور در سرور شبیه‌ساز',
      call: 'ارسال درخواست، مثل call GET /users body={"name":"ada"}',
      openapi: 'چاپ سند OpenAPI',
      goal: 'نمایش چک‌لیست مرحله',
      solution: 'نمایش راه‌حل (در امتیاز گلف حساب می‌شود)',
      undo: 'برگشت به اجرای قبلی',
      reset: 'شروع دوباره‌ی مرحله',
      next: 'رفتن به مرحله‌ی بعد',
      sandbox: 'کار آزاد',
      clear: 'پاک کردن کنسول',
    },
    helpTitle: 'دستورها',

    // dialogs
    continueBtn: 'ادامه',
    startBtn: 'شروع',
    closeBtn: 'بستن',
    tryDemo: 'اجرای دمو',
    solveIt: 'حلش کن',
    demoLabel: 'دمو',
    goalsTitle: 'هدف‌ها',
    goalsFooter: (par) => `ایده‌آل ${par} فرمان · \`hint\` · \`solution\``,

    // welcome
    welcomeTitle: 'welcome to learn api',
    welcomeTitleHtml: 'welcome to learn <span class="logo-api">API</span>',
    welcomeIntro: 'آموزش تعاملی **APIهای وب** — سندباکس + مراحل هدایت‌شده‌ی عملیاتی.',
    welcomeBoard: 'ویژوالایزر مسیر **Client → Router → Handler → Response** را نشان می‌دهد. این چرخه‌ی پایپ‌لاینی است که LearnAPI شبیه‌سازی می‌کند.',
    welcomeTracks:
      '- مبانی: متدهای HTTP، کدهای وضعیت، پارامترهای مسیر و کوئری\n- فست‌وب (FastAPI): اسکیمای Pydantic، اعتبارسنجی، تزریق وابستگی\n- پلامبر (Plumber R): مسیریابی، فیلترها، دکوراتورهای اندپوینت\n- OpenAPI: قرارداد داده، اسکیمای استاندارد، مستندسازی تعاملی\n- معماری مقایسه‌ای: الگوهای تولیدی پایتون در برابر R',
    welcomeMeta: 'متا: `levels`, `run`, `call`, `openapi`, `hint`, `solution`, `undo`, `reset`.',
    welcomeLevelsCount: (n) => `**${n}** مرحله گنجانده شده. برای شروع مرحله‌ها را باز کنید، یا در سندباکس بمانید.`,
    welcomeWhat: '**LearnAPI چیست؟**',
    welcomeWhatBody:
      'یک آزمایشگاه مرورگری برای APIهای وب: کدهای واقعی FastAPI و Plumber را می‌نویسید، در یک موتور شبیه‌ساز درون‌حافظه کامپایل می‌کنید، فراخوانی‌های واقعی HTTP می‌فرستید و ردگیری پایپ‌لاین و مشخصات OpenAPI را در لحظه مشاهده می‌کنید؛ بدون نیاز به نصب هیچ سرور محلی.',
    welcomePublisher: '**ناشر**',
    welcomePublisherBody:
      'انتشار و نگهداری توسط **Ali Sadeghi Aghili** — برنامه‌نویس، مهندس/دانشمند داده، مهندس ML. [linktr.ee/aliaghili](https://linktr.ee/aliaghili)',
    welcomeGithub: '- [GitHub — سورس و ایشو](https://github.com/alisadeghiaghili/learn-api)',
    welcomeCoffee: 'Buy Me a Coffee (از ناشر حمایت می‌کند):',
    welcomeLevels: 'مرور مرحله‌ها',
    welcomeFirst: 'شروع مرحله‌ی ۱',
    welcomeSandbox: 'باز کردن سندباکس',

    // levels dialog
    levelsTitle: 'مرحله‌ها',
    pickChallenge: 'یک چالش انتخاب کنید. مرحله‌های حل‌شده در همین مرورگر می‌مانند.',
    parNote: (par) => `ایده‌آل ${par}`,
    solvedChip: 'حل شد',
    legendTitle: 'چطور یک ردیف مرحله را بخوانید',
    legendIdeal: '**ایده‌آل** طول یک راه‌حل تمیز است (هدف گلف دستورها، نه سقف سخت).',
    legendSolved: '**حل شد** یعنی رد کرده‌اید؛ عدد بهترین تعداد فرمان شماست.',
    seq: {
      http: 'مبانی HTTP',
      fastapi: 'FastAPI',
      plumber: 'plumber (R)',
      openapi: 'OpenAPI / Swagger',
      compare: 'مقایسه‌ی استک‌ها',
    },

    // UI guide modal
    uiGuide: [
      { h: 'نوار ابزار', p: 'مرحله‌ها، درس (مرور مقدمه)، راهنما (تمرکز روی پنل)، سرنخ، راه‌حل، بازگشت، بازنشانی و سندباکس.' },
      { h: 'فضای کار', p: 'سمت چپ: خط لوله، سطح API و سند زنده‌ی OpenAPI. سمت دیگر: ادیتور کد با دکمه‌ی Run.' },
      { h: 'کنسول', p: 'پایین صفحه. دستورها انگلیسی می‌مانند. Tab دستور پیشنهادی بعدی را کلمه‌به‌کلمه کامل می‌کند.' },
      { h: 'راهنمای یادگیری', p: 'سمت کناری. مفاهیم، یادداشت‌های میدانی و چک‌لیست؛ کارت نارنجی گام بعدی شماست.' },
    ],

    // celebration
    levelCleared: 'مرحله تمام شد',
    levelComplete: 'تکمیل مرحله',
    levelSolvedBanner: '*** مرحله حل شد ***',
    partyMode: '*** جشن *** کاغذ رنگی می‌ریزد. دکمه‌های اشتراک در پنجره است.',
    commandsUsed: (n, par) => `${n} فرمان استفاده شد · ایده‌آل ${par}`,
    idealCommands: (par) => `راه‌حل ایده‌آل: ${par} فرمان`,
    cheers: [
      'طراحی تمیز اندپوینت. قرارداد برقرار است.',
      'خط لوله‌ی درخواست برآورده شد. آفرین.',
      'خروجی قطعی و تفکر آماده‌ی تولید.',
      'مشخصات معتبر است و مسیرها تمیز بسته می‌شوند.',
    ],
    statsUnder: (n, par) => `**${n}** فرمان. ایده‌آل ${par} است. به آن رسیدید.`,
    statsOver: (n, par) => `**${n}** فرمان. ایده‌آل ${par} است. باز هم حساب می‌شود، رسیدید.`,
    statsIdeal: (par) => `ایده‌آل این مرحله: **${par}** فرمان.`,
    progressLine: (done, total) => `${done} / ${total} مرحله حل شد · پیشرفت در همین مرورگر ذخیره است`,
    shareTitle: 'پیشرفتتان را به اشتراک بگذارید',
    styleList: 'مهارت‌هایی که تمرین کرده‌اید',
    solveMoreLevels: 'مرحله‌های بیشتری حل کنید تا این فهرست پر شود',
    shareGroupLabel: 'اشتراک در شبکه‌های اجتماعی',
    linkedin: 'لینکدین',
    xTwitter: 'X',
    facebook: 'فیسبوک',
    copyPost: 'کپی متن',
    copiedNotice: 'در کلیپ‌بورد کپی شد.',
    copyFailed: 'کپی خودکار انجام نشد.',
    baskInIt: 'همین‌جا بمانم',
    celebrateOn: (id) => `بعدی: ${id}`,
    browseLevels: 'مرور مرحله‌ها',
    nextCelebration: (id, name) => `مرحله‌ی بعد: **${name}** (\`${id}\`)`,
    lastInPack: 'این آخرین مرحله بود. در سندباکس API خودتان را بسازید.',
    shareText: (name, done, total) =>
      `همین الان مرحله‌ی «${name}» را در LearnAPI تمام کردم و الان ${done}/${total} مرحله پیش رفته‌ام. آموزش عملی FastAPI، plumber و OpenAPI در مرورگر.`,
    shareCta: 'خودتان امتحان کنید',
    shareHeadline: 'پیشرفت LearnAPI',
  },
};
