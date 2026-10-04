/**
 * English UI catalog. Console command names, HTTP methods and code stay
 * untranslated in every locale; only surrounding copy is localized.
 */

export const en = {
  locale: 'en',
  dir: 'ltr',
  ui: {
    // toolbar
    sandboxMode: 'sandbox mode',
    levels: 'Levels',
    lesson: 'Lesson',
    lessonTitle: 'Replay the intro slides for this level',
    guide: 'Guide',
    hint: 'Hint',
    solution: 'Solution',
    undo: 'Undo',
    reset: 'Reset',
    sandboxBtn: 'Sandbox',
    help: 'Help',
    uiGuideTitle: 'UI guide: what each part does',
    language: 'Language',
    menuLabel: 'Menu',
    githubTitle: 'GitHub: source and issues',
    support: 'Buy me a coffee',
    supportTitle: 'Support the publisher',
    visitorsTitle: 'Unique learners who practiced here',
    titleLine: (id, name, par) => `${id} · ${name} · ideal ${par} commands`,
    guidePanel: 'Learning guide panel',

    // workspace
    tabPipeline: 'Pipeline',
    tabSurface: 'API Surface',
    tabOpenapi: 'OpenAPI',
    editorRun: 'Run',
    openapiPlaceholder: '// press Run to compile',
    consoleTitle: 'Console',

    // dock (guide)
    guideTitle: 'Learning guide',
    guideSubtitle: 'Always-on panel. In a level it shows concepts, field notes, and the solution checklist.',
    startHere: 'Start here',
    startHereItems: [
      'Open **Levels** and begin with HTTP basics: What is an endpoint?',
      'Type `help` in the console for the command list',
      'Press **Run** (`Ctrl+Enter`) to compile the editor into the mock server',
      'Type `call GET /` to send a request and watch the pipeline',
    ],
    sandboxTip: 'Sandbox tip',
    sandboxTipItems: [
      'Pipeline: Client → Router → Handler → Response',
      'Console: `call POST /users body={"name":"ada"}`',
      'The OpenAPI tab shows the live document for your code',
      'Progress is saved in this browser (localStorage + cookie)',
    ],
    noActiveLevel: 'No active level',
    noActiveLevelDetail: 'levels → pick a challenge to see the checklist here',
    guideFlashNote: 'The toolbar **Guide** button flashes this panel. It stays open at full page height.',
    youAreLearning: 'You are learning',
    fieldNotesTitle: 'In production (field notes)',
    typeNextTitle: 'Type next, highlighted in orange',
    remainingLabel: 'remaining',
    wrongCommandNote: 'Wrong result? You stay here and progress is kept. History: ↑ / ↓',
    allSolutionMet: 'Every goal of this level is satisfied.',
    nowChip: 'now',
    stateNotes: 'Open goals:',
    bestSoFar: (cmds, par) => `Best so far: ${cmds} commands · ideal: ${par}`,
    idealSolution: (par) => `Ideal: ${par} commands (lower or equal is great)`,
    solvedBanner: (n) => `Level solved${n !== null ? ` in ${n} commands` : ''}.`,
    targetBadge: {
      editor: 'Editor',
      run: 'Editor → Run',
      openapi: 'OpenAPI',
      console: 'Console',
    },
    targetActionHint: {
      editor: 'server.py',
      run: 'Ctrl+Enter',
      openapi: 'contract',
      console: 'api $',
    },
    nextStepTitle: {
      edit: 'Next step: Write in Code Editor',
      run: 'Next step: Compile Server (Run)',
      call: 'Next step: Test in Console',
    },
    nextStepPrompt: {
      edit: 'Add to editor:',
      run: 'Compile code:',
      call: 'Type in terminal:',
    },
    goalDetail: (g) => {
      if (g.kind === 'code') return 'Write in editor: code must contain this';
      if (g.kind === 'endpoint') return `Compile with Run: register this route${g.status ? ` · status ${g.status}` : ''}`;
      if (g.kind === 'openapi') return 'OpenAPI tab: document must contain this schema/path';
      if (g.kind === 'call') return `Console: send request · must return ${g.expectStatus}${g.expectBody ? ' · body matches' : ''}`;
      return '';
    },
    runNext: 'Press Run (Ctrl+Enter) in the editor to compile the mock server',
    editNext: (g) => {
      if (g.kind === 'code') return `In editor: write "${g.label}", then press Run`;
      if (g.kind === 'endpoint') return `In editor: define this route, then press Run`;
      return `In editor: add models/routes for this schema, then press Run`;
    },
    allDoneNext: 'All goals met',

    // terminal
    termNext: 'Next',
    termTabNote: 'Tab fills one word at a time',
    termPlaceholder: (cmd) => `Next: ${cmd} (Tab steps word-by-word)`,
    termPlaceholderIdle: 'Type a command, e.g. help',
    welcomeLine: 'welcome to learn <api>',
    welcomeSub: 'Interactive API sandbox. Type `help`, or `levels` to start the first tutorial.',
    sandboxSeeded: 'Sandbox is ready with a starter FastAPI app. Edit it, press Run, then `call GET /`.',
    progressSaved: 'Progress is saved in this browser (localStorage + cookie). Come back any time.',
    resumeLines: (done, total, pct, nextName) => [
      `Welcome back. Progress saved: ${done}/${total} levels (${pct}%).`,
      nextName ? `Next up: ${nextName}` : 'All levels cleared.',
      'Open Levels to resume. Type `goal` inside a level for the checklist.',
    ],
    loadedLevel: (name) => `loaded: ${name}`,
    sandboxFree: 'sandbox: free play',
    serverNotRunning: 'server is not running. Press Run first',
    runSummary: (n, title) => `run: ${n} route(s) · ${title}`,
    editorWarn: 'compiled with warnings',
    editorCompiled: (n, lang) => `${n} route${n === 1 ? '' : 's'} · ${lang}`,
    editorGoalsOpen: (n) => `${n} goal(s) open`,
    editorSolved: 'solved',
    nothingToUndo: 'nothing to undo',
    undoMeta: 'went back to the previous run',
    resetMeta: (name) => `reset: ${name}`,
    solutionLoaded: 'solution loaded, press Run',
    noSolution: 'no solution in sandbox',
    noHint: 'no hint here',
    levelsPick: 'opened the level list',
    nextMeta: (cmd) => `Next: ${cmd}`,
    unknownCommand: (name) => `unknown command: ${name}. Try 'help'`,
    usageCall: 'usage: call <METHOD> <path> [body=JSON] [headers=JSON]',
    invalidJson: (what, raw) => `${what} is not valid JSON: ${raw}`,
    goalsHeading: 'goals',
    cmdHelp: {
      help: 'show this list',
      levels: 'browse levels',
      hint: 'show the level hint',
      run: 'compile editor code into the mock server',
      call: 'send a request, e.g. call GET /users body={"name":"ada"}',
      openapi: 'print the OpenAPI document',
      goal: 'show the level checklist',
      solution: 'reveal the solution (counts against golf)',
      undo: 'go back to the previous run',
      reset: 'restart the level',
      next: 'go to the next level',
      sandbox: 'free play',
      clear: 'clear the console',
    },
    helpTitle: 'commands',

    // dialogs
    continueBtn: 'Continue',
    startBtn: 'Start',
    closeBtn: 'Close',
    tryDemo: 'Try demo',
    solveIt: 'Solve it',
    demoLabel: 'demo',
    goalsTitle: 'Goals',
    goalsFooter: (par) => `ideal ${par} commands · \`hint\` · \`solution\``,

    // welcome
    welcomeTitle: 'welcome to learn api',
    welcomeTitleHtml: 'welcome to learn <span class="logo-api">API</span>',
    welcomeIntro: 'Interactive **Web API** tutorial — sandbox + guided production levels.',
    welcomeBoard: 'The visualizer inspects **Client → Router → Handler → Response**. That is the request pipeline LearnAPI simulates.',
    welcomeTracks:
      '- Basics: HTTP methods, status codes, query & path parameters\n- FastAPI (Python): Pydantic schemas, validation, dependencies\n- Plumber (R): routing, filters, endpoint decorators\n- OpenAPI: contract-first schemas, interactive docs\n- Comparative Architecture: Python vs R production patterns',
    welcomeMeta: 'Meta: `levels`, `run`, `call`, `openapi`, `hint`, `solution`, `undo`, `reset`.',
    welcomeLevelsCount: (n) => `**${n}** levels included. Open Levels to begin, or stay in sandbox.`,
    welcomeWhat: '**What is LearnAPI?**',
    welcomeWhatBody:
      'A browser lab bench for web APIs: you write real-world FastAPI and Plumber code, compile it into an in-memory mock engine, issue realistic HTTP requests, and watch the pipeline trace and OpenAPI schemas update instantly. No local server install required.',
    welcomePublisher: '**Publisher**',
    welcomePublisherBody:
      'Published and maintained by **Ali Sadeghi Aghili** — programmer, data engineer / scientist, ML engineer. [linktr.ee/aliaghili](https://linktr.ee/aliaghili)',
    welcomeGithub: '- [GitHub — source & issues](https://github.com/alisadeghiaghili/learn-api)',
    welcomeCoffee: 'Buy Me a Coffee (supports the publisher):',
    welcomeLevels: 'Browse levels',
    welcomeFirst: 'Start level 1',
    welcomeSandbox: 'Open sandbox',

    // levels dialog
    levelsTitle: 'Levels',
    pickChallenge: 'Pick a challenge. Solved levels are remembered in this browser.',
    parNote: (par) => `ideal ${par}`,
    solvedChip: 'solved',
    legendTitle: 'How to read a level row',
    legendIdeal: '**Ideal** is the length of a clean solution (command golf target, not a hard limit).',
    legendSolved: '**Solved** means you passed it; the number is your best command count.',
    seq: {
      http: 'HTTP basics',
      fastapi: 'FastAPI',
      plumber: 'plumber (R)',
      openapi: 'OpenAPI / Swagger',
      compare: 'Compare stacks',
    },

    // UI guide modal
    uiGuide: [
      { h: 'Toolbar', p: 'Levels, Lesson (replay intro), Guide (focus the panel), Hint, Solution, Undo, Reset and Sandbox.' },
      { h: 'Workspace', p: 'Left: Pipeline, API Surface and the live OpenAPI document. Right: the code editor with Run.' },
      { h: 'Console', p: 'Bottom. Commands stay in English. Tab completes the suggested next command word by word.' },
      { h: 'Learning guide', p: 'Right side. Concepts, production field notes and the checklist; the orange card is your next step.' },
    ],

    // celebration
    levelCleared: 'LEVEL CLEARED',
    levelComplete: 'Level complete',
    levelSolvedBanner: '*** LEVEL SOLVED ***',
    partyMode: '*** CELEBRATION *** confetti time. Share buttons are in the dialog.',
    commandsUsed: (n, par) => `${n} command${n === 1 ? '' : 's'} used · ideal ${par}`,
    idealCommands: (par) => `ideal solution: ${par} commands`,
    cheers: [
      'Clean endpoint design. The contract holds.',
      'Request pipeline satisfied. Nicely done.',
      'Deterministic output, production-ready thinking.',
      'The specification is valid and the routes bind cleanly.',
    ],
    statsUnder: (n, par) => `**${n}** command${n === 1 ? '' : 's'}. Ideal is ${par}. You matched it.`,
    statsOver: (n, par) => `**${n}** command${n === 1 ? '' : 's'}. Ideal is ${par}. Still counts, you got there.`,
    statsIdeal: (par) => `Ideal for this level: **${par}** commands.`,
    progressLine: (done, total) => `${done} / ${total} levels solved · progress saved in this browser`,
    shareTitle: 'Share your progress',
    styleList: 'Skills you have practiced',
    solveMoreLevels: 'Solve more levels to fill this list',
    shareGroupLabel: 'Share on social networks',
    linkedin: 'LinkedIn',
    xTwitter: 'X',
    facebook: 'Facebook',
    copyPost: 'Copy post',
    copiedNotice: 'Copied to the clipboard.',
    copyFailed: 'Could not copy automatically.',
    baskInIt: 'Stay here',
    celebrateOn: (id) => `Next: ${id}`,
    browseLevels: 'Browse levels',
    nextCelebration: (id, name) => `Up next: **${name}** (\`${id}\`)`,
    lastInPack: 'That was the last level. Try the sandbox to build your own API.',
    shareText: (name, done, total) =>
      `I just cleared "${name}" on LearnAPI and now stand at ${done}/${total} levels. Hands-on FastAPI, plumber and OpenAPI in the browser.`,
    shareCta: 'Try it yourself',
    shareHeadline: 'LearnAPI progress',
  },
};
