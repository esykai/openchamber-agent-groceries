"use strict";
(() => {
  // dev/fixture.ts
  var now = Date.now();
  var dayKey = (date) => {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };
  var days = Array.from({ length: 30 }, (_, index) => {
    const date = /* @__PURE__ */ new Date();
    date.setDate(date.getDate() - (29 - index));
    const wave = Math.abs(Math.sin(index * 1.7));
    const tokens = index === 29 ? 1275853 : Math.round(18e4 + wave * 62e4);
    const input = Math.round(tokens * 0.91);
    return {
      date: dayKey(date),
      tokens,
      input,
      output: tokens - input,
      turns: 20 + Math.round(wave * 40)
    };
  });
  var sessionTitles = {
    ru: [
      "\u0420\u0435\u0439\u0442\u0438\u043D\u0433, \u043C\u0435\u0434\u0430\u043B\u0438, \u0441\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430 \u0438 \u043B\u0435\u043D\u0442\u0430 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0435\u0432",
      "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0439 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F",
      "OpenChamber widget \u043F\u043E \u043E\u0431\u0440\u0430\u0437\u0446\u0443 x5-club-widget"
    ],
    en: [
      "Ratings, medals, sorting and the comment feed",
      "Checking the extension permission flow",
      "OpenChamber widget modelled on x5-club-widget"
    ]
  };
  var fixtureUsage = (lang = "ru") => ({
    date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    source: "~/.local/share/opencode/opencode.db",
    totals: {
      eaten: 1275853,
      input: 1161026,
      output: 114827,
      reasoning: 0,
      cacheRead: 26335104,
      cacheWrite: 0,
      cost: 0,
      turns: 53
    },
    sessions: [
      {
        id: "ses_fixture_1",
        title: sessionTitles[lang][0],
        model: "deepseek-v4.1-flash",
        tokens: 721935,
        input: 64e4,
        output: 81935,
        turns: 30,
        updated: now - 4 * 6e4
      },
      {
        id: "ses_fixture_2",
        title: sessionTitles[lang][1],
        model: "claude-sonnet-4-5",
        tokens: 446961,
        input: 424026,
        output: 22935,
        turns: 15,
        updated: now - 52 * 6e4
      },
      {
        id: "ses_fixture_3",
        title: sessionTitles[lang][2],
        model: "deepseek-v4.1-flash",
        tokens: 106957,
        input: 97e3,
        output: 9957,
        turns: 8,
        updated: now - 2 * 6e4
      }
    ],
    lastAt: now - 4 * 6e4,
    days
  });

  // src/lang.ts
  var current = "ru";
  var setLang = (lang) => {
    current = lang;
  };
  var getLang = () => current;

  // src/i18n.ts
  var BRANDS = {
    ru: {
      name: "X5 \u041A\u043B\u0443\u0431",
      upper: "X5 \u041A\u041B\u0423\u0411",
      short: "X5",
      footer: "OpenChamber \xB7 X5 \u041A\u043B\u0443\u0431"
    },
    en: {
      name: "7-Eleven Club",
      upper: "7-ELEVEN CLUB",
      short: "7-Eleven",
      footer: "OpenChamber \xB7 7-Eleven Club"
    }
  };
  var customBrandName = "";
  var brand = () => {
    const base = BRANDS[getLang()];
    if (!customBrandName) return base;
    return {
      name: customBrandName,
      upper: customBrandName.toUpperCase(),
      short: customBrandName,
      footer: `OpenChamber \xB7 ${customBrandName}`
    };
  };
  var RU = {
    title: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u044A\u0435\u043B \u043C\u043E\u0439 \u0410\u0433\u0435\u043D\u0442?",
    thisIs: "\u042D\u0422\u041E \u041A\u0410\u041A",
    supply: "\u0417\u0410\u041F\u0410\u0421\u042B",
    dailySupply: "\u0434\u043D\u0435\u0432\u043D\u043E\u0439 \u0437\u0430\u043F\u0430\u0441",
    supplyForDays: "\u0437\u0430\u043F\u0430\u0441 \u043D\u0430 {days} \u0434\u043D.",
    input: "\u0432\u0445\u043E\u0434",
    output: "\u0432\u044B\u0445\u043E\u0434",
    inputUpper: "\u0412\u0425\u041E\u0414",
    outputUpper: "\u0412\u042B\u0425\u041E\u0414",
    tokens: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432",
    total: "\u0438\u0442\u043E\u0433\u043E",
    tokensToday: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0437\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F",
    tokensWeek: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0437\u0430 7 \u0434\u043D\u0435\u0439",
    tokensMonth: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432 \u0437\u0430 30 \u0434\u043D\u0435\u0439",
    tabDay: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F",
    tabWeek: "\u041D\u0435\u0434\u0435\u043B\u044F",
    tabMonth: "\u041C\u0435\u0441\u044F\u0446",
    periodDay: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F",
    periodWeek: "\u0417\u0430 7 \u0434\u043D\u0435\u0439",
    periodMonth: "\u0417\u0430 30 \u0434\u043D\u0435\u0439",
    dynamics: "\u0414\u0438\u043D\u0430\u043C\u0438\u043A\u0430",
    whoAte: "\u041A\u0442\u043E \u0441\u044A\u0435\u043B",
    settings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
    done: "\u0413\u043E\u0442\u043E\u0432\u043E",
    language: "\u042F\u0437\u044B\u043A",
    storeName: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u043B\u0443\u0431\u0430",
    storeNameMeta: "\u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E {default}",
    storeNamePlaceholder: "\u0421\u0432\u043E\u0451 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, {default})",
    storeNameAria: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u043B\u0443\u0431\u0430 \u0438\u043B\u0438 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430",
    storeNameReset: "\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E",
    countIn: "\u0421\u0447\u0438\u0442\u0430\u044E \u0432",
    dailySupplyTitle: "\u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u0437\u0430\u043F\u0430\u0441",
    tokensToProduct: "\u0442\u043E\u043A\u0435\u043D\u044B \u2192 \u043F\u0440\u043E\u0434\u0443\u043A\u0442",
    upToBillion: "\u0434\u043E 1 \u043C\u043B\u0440\u0434",
    productAria: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442 \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0430",
    periodAria: "\u041F\u0435\u0440\u0438\u043E\u0434",
    settingsAria: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
    refresh: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C",
    refreshAria: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435",
    copyImage: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0443",
    copyGif: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C GIF",
    copyingImage: "\u0420\u0438\u0441\u0443\u044E \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0443\u2026",
    copyingGif: "\u0420\u0438\u0441\u0443\u044E GIF\u2026",
    copyImageToast: "\u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 \u0432 \u0431\u0443\u0444\u0435\u0440\u0435 \u043E\u0431\u043C\u0435\u043D\u0430",
    copyGifToast: "GIF \u0432 \u0431\u0443\u0444\u0435\u0440\u0435 \u043E\u0431\u043C\u0435\u043D\u0430",
    calculating: "\u0421\u0447\u0438\u0442\u0430\u044E \u0442\u043E\u043A\u0435\u043D\u044B\u2026",
    firstResponseHint: "\u041F\u0435\u0440\u0432\u044B\u0439 \u043E\u0442\u0432\u0435\u0442 \u043C\u043E\u0436\u0435\u0442 \u0437\u0430\u043D\u044F\u0442\u044C \u043F\u0430\u0440\u0443 \u0441\u0435\u043A\u0443\u043D\u0434.",
    noData: "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445.",
    nothingToday: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u0435\u0449\u0451 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0441\u044A\u0435\u0434\u0435\u043D\u043E.",
    nothingPeriod: "\u0417\u0430 \u044D\u0442\u043E\u0442 \u043F\u0435\u0440\u0438\u043E\u0434 \u0435\u0449\u0451 \u043D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u0441\u044A\u0435\u0434\u0435\u043D\u043E.",
    retry: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C",
    budgetAria: "\u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u0437\u0430\u043F\u0430\u0441 \u0442\u043E\u043A\u0435\u043D\u043E\u0432",
    budgetMin: "\u041C\u0438\u043D\u0438\u043C\u0443\u043C {value} \u0442\u043E\u043A\u0435\u043D\u043E\u0432",
    budgetMax: "\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C {value} \u0442\u043E\u043A\u0435\u043D\u043E\u0432",
    sessionIn: "\u0432\u0445\u043E\u0434",
    sessionOut: "\u0432\u044B\u0445\u043E\u0434",
    unknownModel: "\u043C\u043E\u0434\u0435\u043B\u044C \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u0430",
    steps: "\u0448\u0430\u0433",
    stepsMany: "\u0448\u0430\u0433\u043E\u0432",
    busy: "\u0430\u0433\u0435\u043D\u0442 \u0435\u0441\u0442",
    left: "\u041E\u0421\u0422\u0410\u041B\u041E\u0421\u042C",
    bestDay: "\u041B\u0423\u0427\u0428\u0418\u0419 \u0414\u0415\u041D\u042C",
    averagePerDay: "\u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u043C {value} \u0432 \u0434\u0435\u043D\u044C",
    shareOfWeek: "{share}% \u043D\u0435\u0434\u0435\u043B\u0438",
    thanks: "\u0421\u043F\u0430\u0441\u0438\u0431\u043E, \u0447\u0442\u043E \u043A\u043E\u0440\u043C\u0438\u0442\u0435 \u043C\u043E\u0435\u0433\u043E \u0430\u0433\u0435\u043D\u0442\u0430!",
    footerStats: "\u0441\u0447\u0438\u0442\u0430\u0435\u043C \u0432\u0445\u043E\u0434, \u0432\u044B\u0445\u043E\u0434 \u0438 \u0437\u0430\u043F\u0438\u0441\u044C \u0432 \u043A\u044D\u0448",
    imageControl: "\u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430",
    supplyStatus: "\u0437\u0430\u043F\u0430\u0441\u044B {percent}%",
    supplyGone: "\u0437\u0430\u043F\u0430\u0441\u044B \u043A\u043E\u043D\u0447\u0438\u043B\u0438\u0441\u044C",
    copyNoService: "\u0420\u0430\u0437\u0440\u0435\u0448\u0438 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0435\u0440\u0432\u0438\u0441: \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u2192 \u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F \u2192 Agent Groceries.",
    copyDisabled: "\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u043D\u0430 \u043F\u0430\u0443\u0437\u0435: \u0432\u043A\u043B\u044E\u0447\u0438 \u0435\u0433\u043E \u0432 \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u2192 \u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F.",
    copyTimeout: "\u0421\u0435\u0440\u0432\u0438\u0441 \u0432\u0438\u0434\u0436\u0435\u0442\u0430 \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B.",
    copyGeneric: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0443.",
    copyPrepare: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u0438\u0442\u044C \u0444\u0430\u0439\u043B.",
    copyOldService: "\u0421\u0435\u0440\u0432\u0438\u0441 \u0432\u0438\u0434\u0436\u0435\u0442\u0430 \u0441\u0442\u0430\u0440\u043E\u0439 \u0432\u0435\u0440\u0441\u0438\u0438 \u2014 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438 OpenChamber.",
    copyTooLarge: "\u0424\u0430\u0439\u043B \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0441\u044F \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u0438\u043C.",
    copyServiceRejected: "\u0421\u0435\u0440\u0432\u0438\u0441 \u0432\u0438\u0434\u0436\u0435\u0442\u0430 \u043D\u0435 \u043F\u0440\u0438\u043D\u044F\u043B \u0444\u0430\u0439\u043B. \u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438 OpenChamber.",
    copyBusy: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u043F\u043E\u043F\u044B\u0442\u043E\u043A \u043F\u043E\u0434\u0440\u044F\u0434 \u2014 \u043F\u043E\u0434\u043E\u0436\u0434\u0438 \u043F\u0430\u0440\u0443 \u0441\u0435\u043A\u0443\u043D\u0434.",
    copyNoPowerShell: "Windows \u043D\u0435 \u043D\u0430\u0448\u0451\u043B PowerShell \u2014 \u0431\u0435\u0437 \u043D\u0435\u0433\u043E \u0444\u0430\u0439\u043B \u0432 \u0431\u0443\u0444\u0435\u0440 \u043D\u0435 \u043F\u043E\u043B\u043E\u0436\u0438\u0442\u044C.",
    copySystem: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u043D\u0435 \u043E\u0442\u0434\u0430\u043B\u0430 \u0431\u0443\u0444\u0435\u0440 \u043E\u0431\u043C\u0435\u043D\u0430. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437.",
    copyLost: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043F\u043E\u0442\u0435\u0440\u044F\u043B \u0444\u0430\u0439\u043B \u2014 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437.",
    copyRecognize: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043D\u0435 \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043B \u0444\u0430\u0439\u043B.",
    copyCouldNot: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043D\u0435 \u0441\u043C\u043E\u0433 \u043F\u043E\u043B\u043E\u0436\u0438\u0442\u044C \u0444\u0430\u0439\u043B \u0432 \u0431\u0443\u0444\u0435\u0440.",
    copyImageError: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u043D\u0430\u0440\u0438\u0441\u043E\u0432\u0430\u0442\u044C \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0443.",
    copyGifError: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u043D\u0430\u0440\u0438\u0441\u043E\u0432\u0430\u0442\u044C GIF.",
    copyImageFileError: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u0435\u0440\u0435\u0434\u0430\u0442\u044C \u0444\u0430\u0439\u043B \u0432 \u0441\u0435\u0440\u0432\u0438\u0441. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437.",
    copyClipboardOccupied: "\u0411\u0443\u0444\u0435\u0440 \u043E\u0431\u043C\u0435\u043D\u0430 \u0437\u0430\u043D\u044F\u0442. \u041F\u043E\u0434\u043E\u0436\u0434\u0438 \u0441\u0435\u043A\u0443\u043D\u0434\u0443 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437.",
    usageNoServiceTitle: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0435\u0440\u0432\u0438\u0441 \u043D\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0451\u043D",
    usageNoServiceBody: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u2192 \u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F \u2192 Agent Groceries: \u0440\u0430\u0437\u0440\u0435\u0448\u0438 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0435\u0440\u0432\u0438\u0441 \u0438 \u043E\u0442\u043A\u0440\u043E\u0439 \u0440\u0430\u0437\u0434\u0435\u043B \u0437\u0430\u043D\u043E\u0432\u043E.",
    usageServiceFailedTitle: "\u0421\u0435\u0440\u0432\u0438\u0441 \u0432\u0438\u0434\u0436\u0435\u0442\u0430 \u043D\u0435 \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u043B\u0441\u044F",
    usageServiceFailedBody: "\u041F\u0440\u043E\u0432\u0435\u0440\u044C \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u2192 \u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F \u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438 OpenChamber.",
    usageBadRequestTitle: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043D\u0435 \u043F\u043E\u043D\u044F\u043B \u0437\u0430\u043F\u0440\u043E\u0441",
    usageDbFailedTitle: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0442\u044C \u0431\u0430\u0437\u0443",
    usageHostDeniedTitle: "OpenChamber \u043D\u0435 \u043F\u0443\u0441\u0442\u0438\u043B \u043A \u0441\u0435\u0440\u0432\u0438\u0441\u0443",
    usageNoDbTitle: "\u041D\u0435\u0442 \u0431\u0430\u0437\u044B OpenCode",
    usageNoDbBody: "\u0415\u0449\u0451 \u043D\u0435 \u043F\u043E\u044F\u0432\u043B\u044F\u043B\u0430\u0441\u044C \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0437\u0430\u043F\u0443\u0441\u043A\u0430 \u0441\u0435\u0441\u0441\u0438\u0438. \u041F\u0440\u043E\u0432\u0435\u0440\u044C, \u0447\u0442\u043E OpenChamber \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0441 OpenCode, \u0438 \u043E\u0431\u043D\u043E\u0432\u0438.",
    usageNoTableTitle: "\u041D\u0435\u0437\u043D\u0430\u043A\u043E\u043C\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442 \u0431\u0430\u0437\u044B OpenCode",
    usageNoTableBody: "\u041D\u0443\u0436\u043D\u0430 \u0441\u0432\u0435\u0436\u0430\u044F \u0431\u0430\u0437\u0430 OpenCode 2.x. \u041E\u0431\u043D\u043E\u0432\u0438 OpenCode \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0441\u043D\u043E\u0432\u0430.",
    usageDisabledTitle: "\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u043D\u0430 \u043F\u0430\u0443\u0437\u0435",
    usageDisabledBody: "\u0412\u043A\u043B\u044E\u0447\u0438 Agent Groceries \u0432 \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u2192 \u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F.",
    usageTimeoutTitle: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B \u0432\u043E\u0432\u0440\u0435\u043C\u044F",
    usageHostTitle: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u0432\u044B\u0437\u0432\u0430\u0442\u044C \u0441\u0435\u0440\u0432\u0438\u0441",
    usageBadJsonTitle: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043E\u0442\u0432\u0435\u0442\u0438\u043B \u043D\u0435 JSON",
    usageBadShapeTitle: "\u0421\u0435\u0440\u0432\u0438\u0441 \u043E\u0442\u0432\u0435\u0442\u0438\u043B \u043D\u0435 \u0442\u0435\u043C, \u0447\u0442\u043E \u043E\u0436\u0438\u0434\u0430\u043B\u0438",
    presetMillion: "{value} \u043C\u043B\u043D",
    budgetUnit: "\u0442\u043E\u043A\u0435\u043D\u043E\u0432",
    settingsError: "\u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438"
  };
  var EN = {
    title: "How much did my Agent eat?",
    thisIs: "THIS IS",
    supply: "SUPPLY",
    dailySupply: "daily supply",
    supplyForDays: "supply for {days} days",
    input: "input",
    output: "output",
    inputUpper: "INPUT",
    outputUpper: "OUTPUT",
    tokens: "tokens",
    total: "total",
    tokensToday: "tokens today",
    tokensWeek: "tokens in 7 days",
    tokensMonth: "tokens in 30 days",
    tabDay: "Today",
    tabWeek: "Week",
    tabMonth: "Month",
    periodDay: "Today",
    periodWeek: "Last 7 days",
    periodMonth: "Last 30 days",
    dynamics: "Activity",
    whoAte: "Who ate",
    settings: "Settings",
    done: "Done",
    language: "Language",
    storeName: "Store / club name",
    storeNameMeta: "default: {default}",
    storeNamePlaceholder: "Custom name (e.g. {default})",
    storeNameAria: "Store or club name",
    storeNameReset: "Default",
    countIn: "Count in",
    dailySupplyTitle: "Daily supply",
    tokensToProduct: "tokens \u2192 product",
    upToBillion: "up to 1B",
    productAria: "Product for conversion",
    periodAria: "Period",
    settingsAria: "Settings",
    refresh: "Refresh",
    refreshAria: "Refresh data",
    copyImage: "Copy image",
    copyGif: "Copy GIF",
    copyingImage: "Drawing image\u2026",
    copyingGif: "Drawing GIF\u2026",
    copyImageToast: "Image is on the clipboard",
    copyGifToast: "GIF is on the clipboard",
    calculating: "Counting tokens\u2026",
    firstResponseHint: "The first reply may take a couple of seconds.",
    noData: "No data.",
    nothingToday: "Nothing has been eaten today yet.",
    nothingPeriod: "Nothing has been eaten in this period yet.",
    retry: "Retry",
    budgetAria: "Daily token supply",
    budgetMin: "Minimum {value} tokens",
    budgetMax: "Maximum {value} tokens",
    sessionIn: "in",
    sessionOut: "out",
    unknownModel: "unknown model",
    steps: "step",
    stepsMany: "steps",
    busy: "agent is eating",
    left: "LEFT",
    bestDay: "BEST DAY",
    averagePerDay: "average {value} per day",
    shareOfWeek: "{share}% of the week",
    thanks: "Thank you for feeding my agent!",
    footerStats: "counts input, output and cache writes",
    imageControl: "Image",
    supplyStatus: "supply {percent}%",
    supplyGone: "supply is gone",
    copyNoService: "Allow the local service: Settings \u2192 Extensions \u2192 Agent Groceries.",
    copyDisabled: "The extension is paused: enable it in Settings \u2192 Extensions.",
    copyTimeout: "The widget service did not respond.",
    copyGeneric: "Could not copy the image.",
    copyPrepare: "Could not prepare the file.",
    copyOldService: "The widget service is out of date \u2014 restart OpenChamber.",
    copyTooLarge: "The file turned out too large.",
    copyServiceRejected: "The widget service rejected the file. Restart OpenChamber.",
    copyBusy: "Too many attempts in a row \u2014 wait a couple of seconds.",
    copyNoPowerShell: "Windows could not find PowerShell; it is needed to put the file on the clipboard.",
    copySystem: "The system refused the clipboard. Try again.",
    copyLost: "The service lost the file \u2014 try again.",
    copyRecognize: "The service did not recognize the file.",
    copyCouldNot: "The service could not put the file on the clipboard.",
    copyImageError: "Could not draw the image.",
    copyGifError: "Could not draw the GIF.",
    copyImageFileError: "Could not send the file to the service. Try again.",
    copyClipboardOccupied: "The clipboard is busy. Wait a second and try again.",
    usageNoServiceTitle: "Local service is not allowed",
    usageNoServiceBody: "Settings \u2192 Extensions \u2192 Agent Groceries: allow the local service and open the section again.",
    usageServiceFailedTitle: "The widget service did not start",
    usageServiceFailedBody: "Check Settings \u2192 Extensions or restart OpenChamber.",
    usageBadRequestTitle: "The service did not understand the request",
    usageDbFailedTitle: "Could not read the database",
    usageHostDeniedTitle: "OpenChamber refused the service call",
    usageNoDbTitle: "No OpenCode database",
    usageNoDbBody: "It has not appeared after the first session yet. Check that OpenChamber works with OpenCode and refresh.",
    usageNoTableTitle: "Unknown OpenCode database format",
    usageNoTableBody: "A recent OpenCode 2.x database is required. Update OpenCode and try again.",
    usageDisabledTitle: "The extension is paused",
    usageDisabledBody: "Enable Agent Groceries in Settings \u2192 Extensions.",
    usageTimeoutTitle: "The service did not answer in time",
    usageHostTitle: "Could not call the service",
    usageBadJsonTitle: "The service answered with invalid JSON",
    usageBadShapeTitle: "The service answered with an unexpected shape",
    presetMillion: "{value}M",
    budgetUnit: "tokens",
    settingsError: "Could not save the settings"
  };
  var DICTS = { ru: RU, en: EN };
  var fill = (template, vars) => {
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (match, key) => Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match);
  };
  var t = (key, vars) => fill(DICTS[getLang()][key], vars);

  // src/core.ts
  var PRODUCT_COPY = {
    grechka: {
      per: 1e3,
      ru: { label: "\u0413\u0440\u0435\u0447\u043A\u0430", forms: ["\u043F\u0430\u0447\u043A\u0430", "\u043F\u0430\u0447\u043A\u0438", "\u043F\u0430\u0447\u0435\u043A"], of: " \u0433\u0440\u0435\u0447\u043A\u0438" },
      en: { label: "Buckwheat", forms: ["pack", "packs", "packs"], of: " of buckwheat" }
    },
    pelmeni: {
      per: 100,
      ru: { label: "\u041F\u0435\u043B\u044C\u043C\u0435\u043D\u0438", forms: ["\u043F\u0435\u043B\u044C\u043C\u0435\u043D\u044C", "\u043F\u0435\u043B\u044C\u043C\u0435\u043D\u044F", "\u043F\u0435\u043B\u044C\u043C\u0435\u043D\u0435\u0439"], of: "" },
      en: { label: "Pelmeni", forms: ["pelmeni", "pelmeni", "pelmeni"], of: "" }
    },
    baton: {
      per: 2e3,
      ru: { label: "\u0411\u0430\u0442\u043E\u043D", forms: ["\u0431\u0430\u0442\u043E\u043D", "\u0431\u0430\u0442\u043E\u043D\u0430", "\u0431\u0430\u0442\u043E\u043D\u043E\u0432"], of: "" },
      en: { label: "Baguette", forms: ["baguette", "baguettes", "baguettes"], of: "" }
    },
    moloko: {
      per: 1500,
      ru: { label: "\u041C\u043E\u043B\u043E\u043A\u043E", forms: ["\u043F\u0430\u043A\u0435\u0442", "\u043F\u0430\u043A\u0435\u0442\u0430", "\u043F\u0430\u043A\u0435\u0442\u043E\u0432"], of: " \u043C\u043E\u043B\u043E\u043A\u0430" },
      en: { label: "Milk", forms: ["carton", "cartons", "cartons"], of: " of milk" }
    },
    banany: {
      per: 300,
      ru: { label: "\u0411\u0430\u043D\u0430\u043D\u044B", forms: ["\u0431\u0430\u043D\u0430\u043D", "\u0431\u0430\u043D\u0430\u043D\u0430", "\u0431\u0430\u043D\u0430\u043D\u043E\u0432"], of: "" },
      en: { label: "Bananas", forms: ["banana", "bananas", "bananas"], of: "" }
    },
    tykva: {
      per: 5e3,
      ru: { label: "\u0422\u044B\u043A\u0432\u0430", forms: ["\u0442\u044B\u043A\u0432\u0430", "\u0442\u044B\u043A\u0432\u044B", "\u0442\u044B\u043A\u0432"], of: "" },
      en: { label: "Pumpkin", forms: ["pumpkin", "pumpkins", "pumpkins"], of: "" }
    },
    konfety: {
      per: 250,
      ru: { label: "\u041A\u043E\u043D\u0444\u0435\u0442\u044B", forms: ["\u043A\u043E\u043D\u0444\u0435\u0442\u0430", "\u043A\u043E\u043D\u0444\u0435\u0442\u044B", "\u043A\u043E\u043D\u0444\u0435\u0442"], of: "" },
      en: { label: "Candies", forms: ["candy", "candies", "candies"], of: "" }
    }
  };
  var makeProduct = (id) => {
    const copy = PRODUCT_COPY[id];
    const pick = () => getLang() === "en" ? copy.en : copy.ru;
    return {
      id,
      per: copy.per,
      get label() {
        return pick().label;
      },
      get forms() {
        return pick().forms;
      },
      get of() {
        return pick().of;
      }
    };
  };
  var PRODUCTS = Object.keys(PRODUCT_COPY).map(makeProduct);
  var SLOTS = 5;
  var periodUnit = (period) => period === "day" ? t("tokensToday") : period === "week" ? t("tokensWeek") : t("tokensMonth");
  var isProductId = (value) => typeof value === "string" && PRODUCTS.some((product) => product.id === value);
  var productById = (id) => PRODUCTS.find((product) => product.id === id) ?? PRODUCTS[0];
  var fmt = (value) => String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  var plural = (count, forms) => {
    const last = Math.abs(count) % 10;
    const lastTwo = Math.abs(count) % 100;
    if (last === 1 && lastTwo !== 11) return forms[0];
    if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return forms[1];
    return forms[2];
  };
  var unitsLabel = (count, product) => getLang() === "en" ? `${count === 1 ? product.forms[0] : product.forms[1]}${product.of}` : `${plural(count, product.forms)}${product.of}`;
  var mood = (percent) => {
    const en = getLang() === "en";
    if (percent >= 100) return en ? "ate everything" : "\u0432\u0441\u0451 \u0441\u044A\u0435\u043B";
    if (percent >= 75) return en ? "almost everything" : "\u043F\u043E\u0447\u0442\u0438 \u0432\u0441\u0451 \u0441\u044A\u0435\u043B";
    if (percent >= 50) return en ? "a hearty lunch" : "\u043F\u043B\u043E\u0442\u043D\u044B\u0439 \u043E\u0431\u0435\u0434";
    if (percent >= 25) return en ? "half a basket" : "\u043F\u043E\u043B\u043A\u043E\u0440\u0437\u0438\u043D\u044B";
    if (percent > 0) return en ? "a light snack" : "\u043B\u0451\u0433\u043A\u0438\u0439 \u043F\u0435\u0440\u0435\u043A\u0443\u0441";
    return en ? "waiting for the first reply" : "\u0436\u0434\u0451\u043C \u043F\u0435\u0440\u0432\u044B\u0439 \u043E\u0442\u0432\u0435\u0442";
  };
  var slotsFor = (count) => {
    const full = Math.min(SLOTS, count);
    return { full, partial: full < SLOTS && count > full, extra: Math.max(0, count - SLOTS) };
  };

  // src/art.ts
  var BOX = "0 0 48 48";
  var shadow = `<ellipse cx="24" cy="45" rx="12" ry="1.9" fill="#2a160c" opacity=".16"/>`;
  var grechka = `
<defs>
  <linearGradient id="g-gr-paper" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fbf0d8"/><stop offset=".5" stop-color="#edd9b6"/><stop offset="1" stop-color="#d9bd93"/>
  </linearGradient>
  <linearGradient id="g-gr-label" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#a9632f"/><stop offset="1" stop-color="#6f3a17"/>
  </linearGradient>
  <linearGradient id="g-gr-grain" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f0c47c"/><stop offset="1" stop-color="#c98a3d"/>
  </linearGradient>
</defs>
${shadow}
<path d="M13 13.5h22l1.4 27.2c.1 2-1.2 3.3-3.2 3.3H14.8c-2 0-3.3-1.3-3.2-3.3L13 13.5Z" fill="url(#g-gr-paper)"/>
<path d="M13.2 13.5h21.6l.2 4.6H13l.2-4.6Z" fill="#d3b384"/>
<path d="M13.5 12.9l1.5-3.3 2.2 3.2 2.3-3.2 2.2 3.2 2.3-3.2 2.2 3.2 2.3-3.2 2.2 3.2 2.3-3.2 1.5 3.3" fill="none" stroke="#b58f5c" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M14.6 18.4c4.4 1.4 14.4 1.4 18.8 0" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".38"/>
<rect x="17.4" y="22.8" width="13.2" height="14.6" rx="4.6" fill="url(#g-gr-label)"/>
<rect x="18.6" y="24" width="10.8" height="12.2" rx="3.4" fill="none" stroke="#e8b96b" stroke-width=".7" opacity=".65"/>
<path d="M24 35.4V25.6" stroke="#e8b96b" stroke-width="1.1" stroke-linecap="round"/>
<g fill="#f0c47c">
  <ellipse cx="21.8" cy="27.6" rx="1.6" ry=".9" transform="rotate(-38 21.8 27.6)"/>
  <ellipse cx="26.2" cy="27.6" rx="1.6" ry=".9" transform="rotate(38 26.2 27.6)"/>
  <ellipse cx="21.8" cy="30.6" rx="1.6" ry=".9" transform="rotate(-38 21.8 30.6)"/>
  <ellipse cx="26.2" cy="30.6" rx="1.6" ry=".9" transform="rotate(38 26.2 30.6)"/>
  <ellipse cx="24" cy="24.6" rx="1.1" ry="1.5"/>
</g>
<path d="M16.1 17.5v21.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".42"/>
<path d="M31.8 17.5c.2 6.6.3 13.6.2 21" stroke="#8a5a2c" stroke-width="1.1" stroke-linecap="round" opacity=".18"/>
`;
  var pelmeni = `
<defs>
  <linearGradient id="g-pl-dough" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff8e6"/><stop offset=".55" stop-color="#f5e3bd"/><stop offset="1" stop-color="#e3c58f"/>
  </linearGradient>
  <linearGradient id="g-pl-back" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f8e9c8"/><stop offset="1" stop-color="#dcc08a"/>
  </linearGradient>
</defs>
${shadow}
<ellipse cx="16.4" cy="29.4" rx="9.2" ry="7" fill="url(#g-pl-back)" opacity=".8"/>
<ellipse cx="32.2" cy="30.2" rx="8.6" ry="6.6" fill="url(#g-pl-back)" opacity=".72"/>
<path d="M24 18.6c7.7 0 13.4 5 13.4 11.2S31.7 40.4 24 40.4 10.6 36 10.6 29.8 16.3 18.6 24 18.6Z" fill="url(#g-pl-dough)" stroke="#c9a46b" stroke-width="1.2"/>
<path d="M12.2 29.3c1.4-2 3.5-3.4 6-4.1M19.2 22.4c1-1.6 2.7-2.8 4.8-3.4M27.6 18.7c1.6-.8 3.5-1.1 5.4-.9M33.4 21.1c1.9 1.2 3.2 2.9 4 4.9" fill="none" stroke="#c9a46b" stroke-width="1.35" stroke-linecap="round"/>
<path d="M13 30.1c-.6 4.6 4.2 8.1 11 8.1s11.6-3.5 11-8.1" fill="none" stroke="#b98f55" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
<ellipse cx="19.4" cy="27.8" rx="4.6" ry="2.1" fill="#fff" opacity=".5"/>
<ellipse cx="28.6" cy="29.4" rx="1.4" ry="1" fill="#fff" opacity=".32"/>
<circle cx="22.6" cy="33.6" r=".7" fill="#a97c42" opacity=".45"/>
<circle cx="25.8" cy="35" r=".6" fill="#a97c42" opacity=".38"/>
<circle cx="28.6" cy="33.2" r=".55" fill="#a97c42" opacity=".35"/>
`;
  var baton = `
<defs>
  <linearGradient id="g-bt-crust" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f9dda3"/><stop offset=".45" stop-color="#efc079"/><stop offset="1" stop-color="#cf8f3e"/>
  </linearGradient>
  <linearGradient id="g-bt-top" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff1cc"/><stop offset="1" stop-color="#e9b164" stop-opacity="0"/>
  </linearGradient>
</defs>
${shadow}
<g transform="rotate(-17 24 26)">
  <rect x="5.5" y="19.4" width="37" height="13.2" rx="6.6" fill="url(#g-bt-crust)"/>
  <rect x="5.5" y="19.4" width="37" height="6.2" rx="3.1" fill="url(#g-bt-top)" opacity=".9"/>
  <path d="M11.2 25.2l4.6 5.4M17.6 22.8l4.8 6M24.2 21.8l4.6 6.2M30.6 22.4l4.2 5.6M35.8 24.4l3 3.8" fill="none" stroke="#b26f2b" stroke-width="1.7" stroke-linecap="round" opacity=".8"/>
  <path d="M11.2 24.8l4.6 5.4M17.6 22.4l4.8 6M24.2 21.4l4.6 6.2M30.6 22l4.2 5.6M35.8 24l3 3.8" fill="none" stroke="#ffe9bb" stroke-width=".7" stroke-linecap="round" opacity=".65"/>
  <ellipse cx="14.4" cy="21.8" rx="1" ry=".55" fill="#fdf2d6" opacity=".8"/>
  <ellipse cx="22.2" cy="20.9" rx=".9" ry=".5" fill="#fdf2d6" opacity=".7"/>
  <ellipse cx="31.6" cy="21.4" rx=".95" ry=".52" fill="#fdf2d6" opacity=".75"/>
  <path d="M9 21.2c5.2-1.7 20.8-1.9 27 .2" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".38"/>
</g>
<ellipse cx="24" cy="42.2" rx="16" ry="1.6" fill="#2a160c" opacity=".07"/>
`;
  var moloko = `
<defs>
  <linearGradient id="g-ml-carton" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f1f7fc"/><stop offset="1" stop-color="#dbe7f2"/>
  </linearGradient>
  <linearGradient id="g-ml-blue" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#8fc6ec"/><stop offset="1" stop-color="#4e93c8"/>
  </linearGradient>
  <linearGradient id="g-ml-cap" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#6fa9d2"/><stop offset="1" stop-color="#3f7fae"/>
  </linearGradient>
</defs>
${shadow}
<path d="M15.4 18.2h17.2v24.1c0 1.5-1.1 2.6-2.6 2.6H18c-1.5 0-2.6-1.1-2.6-2.6V18.2Z" fill="url(#g-ml-carton)"/>
<path d="M15.4 18.2 24 10.4l8.6 7.8H15.4Z" fill="#e7f0f8"/>
<path d="M15.4 18.2 24 10.4l8.6 7.8" fill="none" stroke="#c9d9e8" stroke-width="1.1" stroke-linejoin="round"/>
<path d="M24 10.4v7.8" stroke="#c9d9e8" stroke-width="1"/>
<rect x="28.4" y="12.6" width="4.4" height="6.2" rx="1.4" fill="url(#g-ml-cap)" transform="rotate(37 30.6 15.7)"/>
<rect x="17.2" y="24.4" width="13.6" height="12.4" rx="3.4" fill="url(#g-ml-blue)"/>
<path d="M20 31.4c0-3.5 3.4-4.6 4.1-1.1 1.2-3.5 4.6-2.4 4.6 1.1" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
<path d="M18.1 35.6h11.8" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".55"/>
<path d="M16.6 18.9v22.4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>
<path d="M31.5 18.9v22.4" stroke="#9db8cf" stroke-width="1" stroke-linecap="round" opacity=".35"/>
`;
  var banany = `
<defs>
  <linearGradient id="g-bn-back" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f7d05a"/><stop offset="1" stop-color="#d9a62c"/>
  </linearGradient>
  <linearGradient id="g-bn-front" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffe680"/><stop offset=".5" stop-color="#f6c93f"/><stop offset="1" stop-color="#d7a124"/>
  </linearGradient>
</defs>
${shadow}
<path d="M12.8 11.8c-3.1 8.5-.7 17.3 6.8 21.9 4.1 2.5 8.4 2.4 11.5.1-6.8-.9-12.7-8.3-13.2-19.9-.1-2.4-2.8-3.8-5.1-2.1Z" fill="url(#g-bn-back)" opacity=".75" transform="translate(3 2)"/>
<path d="M13.8 11.4c-3.4 8.7-.9 17.8 6.9 22.4 4.2 2.5 8.6 2.4 11.7.1-6.9-.9-13-8.4-13.5-20.4-.1-2.5-2.9-3.9-5.1-2.1Z" fill="url(#g-bn-front)"/>
<path d="M19.4 15.2c.9 9 6.4 16 14 18.2" fill="none" stroke="#c1871d" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>
<path d="M22.6 21.8c1.4 5.6 4.6 9.7 8.5 11.5" fill="none" stroke="#fff3b8" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>
<path d="M17.4 11.2c-2.1-.5-3.9.4-4.3 2.3" fill="none" stroke="#7d5a1d" stroke-width="2.3" stroke-linecap="round"/>
<path d="M31.4 34.2c2.9 1 5.6.4 6.9-1.6" fill="none" stroke="#7d5a1d" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>
<ellipse cx="24.2" cy="19.3" rx="3.4" ry="1.2" fill="#fff8d0" opacity=".55" transform="rotate(61 24.2 19.3)"/>
`;
  var tykva = `
<defs>
  <linearGradient id="g-tk-body" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffb35c"/><stop offset=".5" stop-color="#f08a24"/><stop offset="1" stop-color="#c9610f"/>
  </linearGradient>
  <linearGradient id="g-tk-lobe" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ed8620"/><stop offset="1" stop-color="#b9550b"/>
  </linearGradient>
  <linearGradient id="g-tk-stem" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#9c7a3d"/><stop offset="1" stop-color="#5f4420"/>
  </linearGradient>
</defs>
${shadow}
<path d="M24 12.2c-1.3-3.2 1.1-5.4 4.4-5.1-1 2.6-.2 4.4 1 5.6" fill="none" stroke="url(#g-tk-stem)" stroke-width="2.6" stroke-linecap="round"/>
<path d="M23.8 14.6c-8.4-2.4-14.6 3-14.6 12 0 7.7 5.2 12.8 14.8 12.8s14.8-5.1 14.8-12.8c0-9-6.2-14.4-14.6-12Z" fill="url(#g-tk-body)"/>
<path d="M16 15.8c-4.7 2.4-6.8 8-5.4 14 .9 4 3.5 6.8 7.2 7.8-3-3.6-4.4-8.2-3.9-13.4.4-3.6 1.6-6.6 2.1-8.4Z" fill="url(#g-tk-lobe)" opacity=".85"/>
<path d="M32 15.8c4.7 2.4 6.8 8 5.4 14-.9 4-3.5 6.8-7.2 7.8 3-3.6 4.4-8.2 3.9-13.4-.4-3.6-1.6-6.6-2.1-8.4Z" fill="url(#g-tk-lobe)" opacity=".85"/>
<path d="M19.4 19.6c-1.3 5.4-1.1 12.2 1.2 17.6M28.6 19.6c1.3 5.4 1.1 12.2-1.2 17.6" fill="none" stroke="#a94c08" stroke-width="1.2" stroke-linecap="round" opacity=".5"/>
<path d="M24 16.2c-.9 6.2-.9 14.8 0 21.6" fill="none" stroke="#a94c08" stroke-width=".9" stroke-linecap="round" opacity=".32"/>
<path d="M17.2 19.4c1.8-2.1 4.2-3.3 6.8-3.6" fill="none" stroke="#ffd39a" stroke-width="1.7" stroke-linecap="round" opacity=".65"/>
<path d="M35.2 12.4c1.9 1 3.1 2.6 3.5 4.7" fill="none" stroke="#6d8f34" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>
<path d="M35.2 12.4c-2.6-.6-4.7.2-5.9 2.2 2.3 1.5 4.5 1.3 6.4-.4" fill="#7da63a" opacity=".9"/>
`;
  var konfety = `
<defs>
  <linearGradient id="g-kf-body" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ff8f7a"/><stop offset=".45" stop-color="#e2413f"/><stop offset="1" stop-color="#9d0f24"/>
  </linearGradient>
  <linearGradient id="g-kf-wrap" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffc97d"/><stop offset="1" stop-color="#dd6f1c"/>
  </linearGradient>
</defs>
${shadow}
<path d="M5.5 24c2.2-2.6 4.7-4.7 7.6-6.1 1 1.9 1.5 4 1.5 6.1s-.5 4.2-1.5 6.1c-2.9-1.4-5.4-3.5-7.6-6.1Z" fill="url(#g-kf-wrap)"/>
<path d="M42.5 24c-2.2-2.6-4.7-4.7-7.6-6.1-1 1.9-1.5 4-1.5 6.1s.5 4.2 1.5 6.1c2.9-1.4 5.4-3.5 7.6-6.1Z" fill="url(#g-kf-wrap)"/>
<path d="M7.4 24c1.5-1.5 3.2-2.9 5-4M7.4 24c1.5 1.5 3.2 2.9 5 4M40.6 24c-1.5-1.5-3.2-2.9-5-4M40.6 24c-1.5 1.5-3.2 2.9-5 4" fill="none" stroke="#b9560f" stroke-width=".9" stroke-linecap="round" opacity=".55"/>
<path d="M14.8 24c0-5 4.1-8.6 9.2-8.6s9.2 3.6 9.2 8.6-4.1 8.6-9.2 8.6-9.2-3.6-9.2-8.6Z" fill="url(#g-kf-body)"/>
<path d="M17 22.3c1.9-3.2 5.5-5 9-4.6 2.6.3 4.8 1.6 6.2 3.6-3-1.6-6.7-1.8-10-.4-1.9.8-3.7 2.1-5.2 3.8l-.6-1.2.6-1.2Z" fill="#ffd9c2" opacity=".32"/>
<path d="M18.6 27.4c3.3-1.4 6.8-1.4 10.1 0" fill="none" stroke="#ffb09e" stroke-width="1.1" stroke-linecap="round" opacity=".55"/>
<path d="M18.4 20.1c2.7-2 6.7-2.4 9.6-.9" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".45"/>
<ellipse cx="14.9" cy="24" rx="1.3" ry="2.7" fill="#b9560f" opacity=".55"/>
<ellipse cx="33.1" cy="24" rx="1.3" ry="2.7" fill="#b9560f" opacity=".55"/>
<circle cx="21" cy="26.4" r="1" fill="#fff" opacity=".5"/>
<circle cx="26.2" cy="28.2" r=".8" fill="#fff" opacity=".36"/>
`;
  var ART = { grechka, pelmeni, baton, moloko, banany, tykva, konfety };
  var productArt = (id) => `<svg class="x5-art-svg" viewBox="${BOX}" aria-hidden="true" focusable="false">${ART[id]}</svg>`;

  // src/icon.ts
  var heroMark = (size = 20) => `
<svg class="x5-icon" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <path d="M28 4C14.5 4 7.5 10.5 7.5 19.5c0 5 3.4 8 8.2 8C24.3 27.5 28 18.5 28 4Z" fill="currentColor"/>
  <path d="M9.8 28.6C12.8 21.4 18 15.6 24.4 12" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;
  var refreshGlyph = () => `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M19 8.5A7.5 7.5 0 1 0 20.4 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M19.6 3.8v5.1h-5.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  // src/orbital.ts
  var starMark = () => `
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M12 3.5 13.9 10.1 20.5 12 13.9 13.9 12 20.5 10.1 13.9 3.5 12 10.1 10.1Z" fill="currentColor"/>
  <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/>
</svg>`;
  var orbitMark = () => `
<svg viewBox="0 0 160 160" aria-hidden="true" focusable="false">
  <g fill="none" stroke="currentColor">
    <circle cx="96" cy="64" r="24" stroke-width="1.1" opacity=".65"/>
    <circle cx="96" cy="64" r="46" stroke-width="1.1" stroke-dasharray="3 4" opacity=".55"/>
    <circle cx="96" cy="64" r="70" stroke-width="1" opacity=".38"/>
    <circle cx="96" cy="64" r="96" stroke-width=".9" opacity=".24"/>
    <path d="M96 0v136M28 64h136M48 16l96 96M144 16l-96 96" stroke-width=".8" opacity=".28"/>
    <path d="M4 134C48 76 92 48 158 78" stroke-width="1.3" opacity=".48"/>
  </g>
  <g fill="currentColor">
    <path d="M96 55l2.2 6.8 6.8 2.2-6.8 2.2L96 73l-2.2-6.8L87 64l6.8-2.2Z" opacity=".9"/>
    <circle cx="50" cy="64" r="2" opacity=".75"/>
    <circle cx="96" cy="110" r="1.8" opacity=".7"/>
  </g>
</svg>`;
  var nodeMark = () => `
<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
  <path d="M24 8 38 24 24 40 10 24Z" fill="none" stroke="currentColor" stroke-width="1.8" opacity=".7"/>
  <path d="M24 15 31 24 24 33 17 24Z" fill="currentColor" opacity=".35"/>
  <circle cx="24" cy="24" r="2.6" fill="currentColor"/>
</svg>`;

  // src/theme.ts
  var BASE_CSS = `
:root, [data-oc-theme="light"] {
  color-scheme: light;
  --x5-green: #c62828;
  --x5-green-deep: #8e0f24;
  --x5-green-bright: #ff9eaa;
  --x5-orange: #c99a3e;
  --x5-orange-soft: rgba(201, 154, 62, .14);
  --x5-surface: #ffffff;
  --x5-surface-2: #fdf7f8;
  --x5-surface-3: #f5e6e8;
  --x5-line: #e8d2d6;
  --x5-line-strong: #d6b6bc;
  --x5-ink: #240f13;
  --x5-muted: #7c5d63;
  --x5-faint: #a5878d;
  --x5-accent-soft: rgba(198, 40, 40, .1);
  --x5-accent-line: rgba(198, 40, 40, .38);
  --x5-hero: linear-gradient(128deg, #3d0712 0%, #9d1130 46%, #d6a648 100%);
  --x5-hero-ink: #ffffff;
  --x5-hero-muted: rgba(255, 255, 255, .76);
  --x5-paper: #fffafa;
  --x5-paper-line: #e8d4d8;
  --x5-shadow: 0 1px 2px rgba(36, 15, 19, .06), 0 22px 46px -32px rgba(36, 15, 19, .7);
  --x5-glow: rgba(198, 40, 40, .16);
}

[data-oc-theme="dark"] {
  color-scheme: dark;
  --x5-green: #ff6b7f;
  --x5-green-deep: #c62828;
  --x5-green-bright: #ffb3bd;
  --x5-orange: #f0c15a;
  --x5-orange-soft: rgba(240, 193, 90, .16);
  --x5-surface: #180b10;
  --x5-surface-2: #231018;
  --x5-surface-3: #301620;
  --x5-line: #44222c;
  --x5-line-strong: #5c2e3b;
  --x5-ink: #fbf0f2;
  --x5-muted: #c7a7ae;
  --x5-faint: #9e7d85;
  --x5-accent-soft: rgba(240, 193, 90, .14);
  --x5-accent-line: rgba(240, 193, 90, .48);
  --x5-hero: linear-gradient(128deg, #1a0409 0%, #760d24 44%, #d2a34a 100%);
  --x5-hero-ink: #ffffff;
  --x5-hero-muted: rgba(255, 255, 255, .75);
  --x5-paper: #1d0c12;
  --x5-paper-line: #3d2029;
  --x5-shadow: 0 1px 0 rgba(255, 224, 166, .08), 0 26px 52px -28px rgba(0, 0, 0, .9);
  --x5-glow: rgba(255, 92, 118, .15);
}
`;

  // src/card.ts
  var CARD_CSS = `
${BASE_CSS}
[hidden] { display: none !important; }

.x5-card {
  position: relative;
  border: 1px solid color-mix(in srgb, var(--x5-orange) 42%, var(--x5-line));
  border-radius: 20px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--x5-surface-2) 55%, var(--x5-surface)) 0%, var(--x5-surface) 100%);
  color: var(--x5-ink);
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(240, 193, 90, .09), var(--x5-shadow);
  font-family: var(--oc-font, system-ui, sans-serif);
}

.x5-hero {
  position: relative;
  padding: 11px 13px 13px;
  color: var(--x5-hero-ink);
  background: var(--x5-hero);
  border-bottom: 1px solid rgba(240, 193, 90, .42);
  overflow: hidden;
}
.x5-hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 1.5px 1.5px, rgba(255, 255, 255, .2) 1px, transparent 0),
    repeating-linear-gradient(125deg, rgba(240, 193, 90, .14) 0 1px, transparent 1px 18px);
  background-size: 13px 13px, auto;
  opacity: .58;
  pointer-events: none;
}
.x5-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(95% 95% at 88% 28%, rgba(255, 219, 138, .3), transparent 62%);
  pointer-events: none;
}
.x5-hero-leaf {
  position: absolute;
  top: -30px;
  right: -26px;
  width: 118px;
  height: 118px;
  color: #fff;
  opacity: .1;
  transform: rotate(10deg);
  pointer-events: none;
}
.x5-hero-leaf svg { display: block; width: 100%; height: 100%; }
.x5-hero-orbit {
  position: absolute;
  top: -18px;
  right: -12px;
  width: 152px;
  height: 152px;
  color: #ffe39f;
  opacity: .38;
  pointer-events: none;
}
.x5-hero-orbit svg { display: block; width: 100%; height: 100%; }
.x5-hero-star {
  position: absolute;
  color: rgba(255, 234, 179, .62);
  pointer-events: none;
}
.x5-hero-star svg { display: block; width: 100%; height: 100%; }
.x5-star-1 { top: 20px; right: 108px; width: 15px; height: 15px; }
.x5-star-2 { top: 68px; right: 34px; width: 11px; height: 11px; opacity: .72; }
.x5-star-3 { bottom: 14px; right: 138px; width: 9px; height: 9px; opacity: .52; }
.x5-hero-node {
  position: absolute;
  right: 22px;
  bottom: 10px;
  width: 32px;
  height: 32px;
  color: rgba(255, 224, 150, .34);
  pointer-events: none;
}
.x5-hero-node svg { display: block; width: 100%; height: 100%; }
.x5-hero-top { position: relative; z-index: 1; display: flex; align-items: center; gap: 6px; min-height: 24px; }
.x5-hero-top .x5-icon { display: block; }
.x5-word { font-size: 8.5px; font-weight: 800; letter-spacing: .17em; color: #fff; }
.x5-refresh {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, .16);
  color: #fff;
  cursor: pointer;
  transition: background .15s ease, transform .15s ease;
}
.x5-refresh:hover { background: rgba(255, 255, 255, .27); }
.x5-refresh:active { transform: scale(.94); }
.x5-refresh:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.x5-refresh svg { width: 14px; height: 14px; }
.x5-refresh[data-spin="1"] svg { animation: x5spin .9s linear infinite; }
@keyframes x5spin { to { transform: rotate(360deg); } }

.x5-hero-title {
  position: relative;
  z-index: 1;
  margin-top: 7px;
  color: var(--x5-hero-muted);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: -.005em;
}
.x5-hero-tokens {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0 7px;
  margin-top: 1px;
}
.x5-num {
  color: #fff;
  font-size: 33px;
  font-weight: 750;
  line-height: 1.04;
  letter-spacing: -.045em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.x5-num[data-long="1"] { font-size: 26px; }
.x5-hero-unit { color: var(--x5-hero-muted); font-size: 10px; font-weight: 600; letter-spacing: .01em; }
.x5-busy {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 9px;
  font-weight: 650;
}
.x5-busy::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  animation: x5pulse 1.2s ease-in-out infinite;
}
@keyframes x5pulse { 0%, 100% { opacity: .3; } 50% { opacity: 1; } }

.x5-hero-split {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 3px 12px;
  margin-top: 5px;
  color: var(--x5-hero-muted);
  font-size: 9px;
  font-weight: 650;
  letter-spacing: .06em;
  text-transform: uppercase;
}
.x5-hero-split span + span {
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, .22);
}
.x5-hero-split b {
  color: #fff;
  font-size: 10px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  letter-spacing: -.01em;
}
.x5-hero-split b[data-long="1"] { font-size: 9px; }

.x5-body { display: flex; flex-direction: column; gap: 12px; padding: 12px 13px 13px; }
.x5-label {
  font-size: 9px;
  font-weight: 750;
  line-height: 1.2;
  letter-spacing: .11em;
  text-transform: uppercase;
  color: var(--x5-muted);
}
.x5-conv-line { display: flex; align-items: baseline; flex-wrap: wrap; gap: 0 6px; margin-top: 1px; }
.x5-count {
  font-size: 27px;
  font-weight: 750;
  line-height: 1.08;
  letter-spacing: -.04em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.x5-count[data-long="1"] { font-size: 22px; }
.x5-units { color: var(--x5-muted); font-size: 11px; font-weight: 500; }

.x5-shelf {
  display: flex;
  align-items: center;
  gap: 3px;
  min-height: 40px;
  margin-top: 6px;
  padding: 6px 8px;
  border: 1px solid color-mix(in srgb, var(--x5-orange) 24%, var(--x5-line));
  border-radius: 12px;
  background: linear-gradient(180deg, var(--x5-surface-2) 0%, color-mix(in srgb, var(--x5-surface-3) 45%, var(--x5-surface)) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 224, 166, .08);
}
.x5-art { display: flex; align-items: center; gap: 3px; }
.x5-art-svg { display: block; width: 26px; height: 26px; filter: drop-shadow(0 1px 1px rgba(0, 0, 0, .2)); }
.x5-slot[data-faded="1"] { opacity: .24; filter: grayscale(.45); }
.x5-badge {
  margin-left: auto;
  padding: 2px 6px;
  border-radius: 7px;
  background: var(--x5-orange);
  color: #2b0610;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: -.01em;
  white-space: nowrap;
}

.x5-supply-head { display: flex; align-items: baseline; gap: 6px; min-width: 0; }
.x5-mood {
  font-size: 10.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.x5-percent { margin-left: auto; font-size: 12px; font-weight: 750; font-variant-numeric: tabular-nums; }
.x5-track {
  height: 8px;
  margin: 6px 0 4px;
  border-radius: 999px;
  background: var(--x5-surface-3);
  overflow: hidden;
}
.x5-bar {
  display: block;
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--x5-green-deep), var(--x5-green-bright));
  transition: width .4s cubic-bezier(.2, .8, .2, 1);
}
.x5-card[data-tone="high"] .x5-bar { background: linear-gradient(90deg, #ef8a2f, var(--x5-orange)); }
.x5-budget-note { font-size: 9px; letter-spacing: .01em; color: var(--x5-faint); }

/* The rail panel has room: bigger hero, larger food, quieter labels. */
.x5-card[data-variant="panel"] { border-radius: 22px; }
.x5-card[data-variant="panel"] .x5-hero { padding: 13px 15px 15px; }
.x5-card[data-variant="panel"] .x5-hero-title { margin-top: 9px; font-size: 12.5px; }
.x5-card[data-variant="panel"] .x5-num { font-size: 38px; }
.x5-card[data-variant="panel"] .x5-num[data-long="1"] { font-size: 30px; }
.x5-card[data-variant="panel"] .x5-hero-unit { font-size: 10.5px; }
.x5-card[data-variant="panel"] .x5-body { gap: 14px; padding: 14px 15px 15px; }
.x5-card[data-variant="panel"] .x5-count { font-size: 31px; }
.x5-card[data-variant="panel"] .x5-count[data-long="1"] { font-size: 25px; }
.x5-card[data-variant="panel"] .x5-units { font-size: 11.5px; }
.x5-card[data-variant="panel"] .x5-shelf { min-height: 46px; padding: 7px 9px; }
.x5-card[data-variant="panel"] .x5-art-svg { width: 30px; height: 30px; }
.x5-card[data-variant="panel"] .x5-track { height: 9px; }
.x5-card[data-variant="panel"] .x5-mood { font-size: 11px; }

@media (prefers-reduced-motion: reduce) {
  .x5-refresh[data-spin="1"] svg, .x5-busy::before { animation: none; }
  .x5-bar { transition: none; }
}
`;
  var slotsMarkup = (productId, count) => {
    const { full, partial } = slotsFor(count);
    const visible = Math.min(SLOTS, Math.max(full + (partial ? 1 : 0), 1));
    let out = "";
    for (let index = 0; index < visible; index += 1) {
      out += `<span class="x5-slot" data-faded="${index >= full ? "1" : "0"}">${productArt(productId)}</span>`;
    }
    return out;
  };
  var escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char] ?? char);
  var TEMPLATE = (variant, refresh) => `
<div class="x5-card" data-variant="${variant}" role="group">
  <div class="x5-hero">
    <span class="x5-hero-orbit">${orbitMark()}</span>
    <span class="x5-hero-star x5-star-1">${starMark()}</span>
    <span class="x5-hero-star x5-star-2">${starMark()}</span>
    <span class="x5-hero-star x5-star-3">${starMark()}</span>
    <span class="x5-hero-node">${nodeMark()}</span>
    <div class="x5-hero-top">
      <span class="x5-hero-mark">${heroMark(19)}</span>
      <span class="x5-word">${escapeHtml(brand().upper)}</span>
      ${refresh ? `<button class="x5-refresh" type="button" title="${t("refresh")}" aria-label="${t("refreshAria")}">${refreshGlyph()}</button>` : ""}
    </div>
    <div class="x5-hero-title">${t("title")}</div>
    <div class="x5-hero-tokens">
      <span class="x5-num">0</span>
      <span class="x5-hero-unit">${t("tokensToday")}</span>
      <span class="x5-busy" hidden>${t("busy")}\u2026</span>
    </div>
    <div class="x5-hero-split">
      <span>${t("input")} <b class="x5-in">0</b></span>
      <span>${t("output")} <b class="x5-out">0</b></span>
    </div>
  </div>
  <div class="x5-body">
    <div class="x5-metric">
      <div class="x5-label">${t("thisIs")}</div>
      <div class="x5-conv-line">
        <span class="x5-count">0</span>
        <span class="x5-units">${unitsLabel(0, productById("grechka"))}</span>
      </div>
      <div class="x5-shelf">
        <span class="x5-art"></span>
        <span class="x5-badge" hidden></span>
      </div>
    </div>
    <div class="x5-supply">
      <div class="x5-supply-head">
        <span class="x5-label">${t("supply")}</span>
        <span class="x5-mood">${mood(0)}</span>
        <span class="x5-percent">0%</span>
      </div>
      <div class="x5-track"><i class="x5-bar"></i></div>
      <div class="x5-budget-note"></div>
    </div>
  </div>
</div>`;
  var mountCard = (root2, options) => {
    root2.innerHTML = TEMPLATE(options.variant, Boolean(options.onRefresh));
    const card = root2.querySelector(".x5-card");
    if (!card) throw new Error("x5: card markup missing");
    const num = card.querySelector(".x5-num");
    const unitEl = card.querySelector(".x5-hero-unit");
    const inEl = card.querySelector(".x5-in");
    const outEl = card.querySelector(".x5-out");
    const count = card.querySelector(".x5-count");
    const art = card.querySelector(".x5-art");
    const badge = card.querySelector(".x5-badge");
    const units = card.querySelector(".x5-units");
    const moodEl = card.querySelector(".x5-mood");
    const percentEl = card.querySelector(".x5-percent");
    const bar = card.querySelector(".x5-bar");
    const budgetEl = card.querySelector(".x5-budget-note");
    const busy = card.querySelector(".x5-busy");
    const refresh = card.querySelector(".x5-refresh");
    const onRefresh = () => options.onRefresh?.();
    refresh?.addEventListener("click", onRefresh);
    const update = (model) => {
      const product = productById(model.productId);
      const unitsCount = Math.floor(model.tokens / product.per);
      const percent = model.budget > 0 ? Math.round(model.tokens / model.budget * 100) : 0;
      const clamped = Math.max(0, Math.min(100, percent));
      const tokensText = fmt(model.tokens);
      const countText = fmt(unitsCount);
      num.textContent = tokensText;
      num.dataset.long = tokensText.length >= 10 ? "1" : "0";
      unitEl.textContent = model.unit;
      const inputText = fmt(model.input);
      const outputText = fmt(model.output);
      inEl.textContent = inputText;
      inEl.dataset.long = inputText.length >= 9 ? "1" : "0";
      outEl.textContent = outputText;
      outEl.dataset.long = outputText.length >= 9 ? "1" : "0";
      count.textContent = countText;
      count.dataset.long = countText.length >= 10 ? "1" : "0";
      units.textContent = unitsLabel(unitsCount, product);
      art.innerHTML = slotsMarkup(product.id, unitsCount);
      const extra = Math.max(0, unitsCount - SLOTS);
      badge.hidden = extra === 0;
      badge.textContent = `+${fmt(extra)}`;
      moodEl.textContent = mood(percent);
      percentEl.textContent = `${percent}%`;
      bar.style.width = `${clamped}%`;
      card.dataset.tone = percent >= 75 ? "high" : "normal";
      budgetEl.textContent = model.days > 1 ? `${t("supplyForDays", { days: model.days })} \xB7 ${fmt(model.budget)} ${t("tokens")}` : `${t("dailySupply")} \xB7 ${fmt(model.budget)} ${t("tokens")}`;
      busy.hidden = !model.busy;
      const supplies = percent >= 100 ? t("supplyGone") : t("supplyStatus", { percent });
      card.setAttribute(
        "aria-label",
        `${model.unit}: ${tokensText} ${t("tokens")}, ${t("input")} ${inputText}, ${t("output")} ${outputText} \u2014 ${t("thisIs")} ${countText} ${unitsLabel(unitsCount, product)}. ${supplies}.`
      );
    };
    const spin = (on) => {
      if (refresh) refresh.dataset.spin = on ? "1" : "0";
    };
    return {
      element: card,
      update,
      spin,
      dispose: () => {
        refresh?.removeEventListener("click", onRefresh);
        root2.replaceChildren();
      }
    };
  };

  // dev/preview.ts
  var CHANNEL = "openchamber.sdk";
  var VERSION = 1;
  var cardStyle = document.createElement("style");
  cardStyle.textContent = CARD_CSS;
  document.head.append(cardStyle);
  var LIGHT = {
    background: "#ffffff",
    elevated: "#ffffff",
    foreground: "#171717",
    muted: "#737373",
    subtle: "#f5f5f5",
    border: "#e5e5e5",
    hover: "#f5f5f5",
    selection: "#dbeafe",
    focus: "#3b82f6",
    primary: "#171717",
    mutedSurface: "#f5f5f5",
    elevatedForeground: "#171717",
    active: "#e5e5e5",
    selectionForeground: "#171717",
    primaryForeground: "#fafafa",
    primaryText: "#171717",
    successText: "#15803d",
    warningText: "#b45309",
    errorText: "#b91c1c",
    infoText: "#1d4ed8",
    success: "#16a34a",
    warning: "#d97706",
    error: "#dc2626",
    info: "#2563eb",
    font: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: 'ui-monospace, "Cascadia Code", Consolas, monospace',
    radius: "10px"
  };
  var DARK = {
    background: "#1a1a1a",
    elevated: "#242424",
    foreground: "#f5f5f5",
    muted: "#a3a3a3",
    subtle: "#2e2e2e",
    border: "#383838",
    hover: "#303030",
    selection: "#1e3a5f",
    focus: "#60a5fa",
    primary: "#fafafa",
    mutedSurface: "#2e2e2e",
    elevatedForeground: "#f5f5f5",
    active: "#3a3a3a",
    selectionForeground: "#f5f5f5",
    primaryForeground: "#171717",
    primaryText: "#f5f5f5",
    successText: "#4ade80",
    warningText: "#fbbf24",
    errorText: "#f87171",
    infoText: "#60a5fa",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    font: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    mono: 'ui-monospace, "Cascadia Code", Consolas, monospace',
    radius: "10px"
  };
  var registry = [];
  var params = new URLSearchParams(location.search);
  var requestedTheme = params.get("theme");
  var requestedSurface = params.get("surface");
  var tokensParam = params.get("tokens");
  var tokensOverride = tokensParam === null ? Number.NaN : Number(tokensParam);
  var langParam = params.get("lang");
  var previewLang = langParam === "en" ? "en" : "ru";
  var usage = fixtureUsage(previewLang);
  if (Number.isFinite(tokensOverride) && tokensOverride >= 0) usage.totals.eaten = tokensOverride;
  var productParam = params.get("product");
  var budgetParam = Number(params.get("budget"));
  var periodParam = params.get("period");
  var nameParam = params.get("name");
  setLang(previewLang);
  var seededPrefs = {
    productId: isProductId(productParam) ? productParam : "grechka",
    budget: Number.isFinite(budgetParam) && budgetParam > 0 ? budgetParam : 2e6,
    period: periodParam === "week" || periodParam === "month" ? periodParam : "day",
    lang: previewLang,
    customName: nameParam ? nameParam.slice(0, 28) : ""
  };
  var post = (entry, message) => {
    entry.frame.contentWindow?.postMessage(message, "*");
  };
  var forwardClipboard = async (payload) => {
    const response = await fetch(`/dev${payload.path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload.body ?? "{}"
    });
    return { status: response.status, body: await response.text() };
  };
  var reply = (entry, id, payload) => {
    if (!id) return;
    post(entry, { channel: CHANNEL, v: VERSION, type: "result", id, ok: true, payload });
  };
  var showToast = (message, kind = "info") => {
    const host = document.querySelector("#toasts");
    if (!host) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.dataset.tone = kind;
    toast.textContent = message;
    host.append(toast);
    setTimeout(() => toast.remove(), 3200);
  };
  var showCompose = (text) => {
    const box = document.querySelector("#composer");
    if (!box) return;
    box.textContent = text;
    box.hidden = false;
  };
  var renderControls = (entry, controls) => {
    const bar = entry.controls;
    if (!bar) return;
    bar.replaceChildren();
    for (const control of controls) {
      if (control.kind === "select") {
        const select = document.createElement("select");
        select.className = "ctl";
        select.setAttribute("aria-label", String(control.label));
        for (const option of control.options) {
          const el = document.createElement("option");
          el.value = option.value;
          el.textContent = option.label;
          select.append(el);
        }
        select.value = String(control.value);
        select.addEventListener("change", () => post(entry, {
          channel: CHANNEL,
          v: VERSION,
          type: "status-control-event",
          payload: { id: control.id, value: select.value }
        }));
        bar.append(select);
      } else {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "ctl";
        button.textContent = String(control.label);
        button.disabled = Boolean(control.disabled);
        button.addEventListener("click", () => post(entry, {
          channel: CHANNEL,
          v: VERSION,
          type: "status-control-event",
          payload: { id: control.id }
        }));
        bar.append(button);
      }
    }
  };
  var readyPayload = (entry) => ({
    theme: { mode: entry.theme, tokens: entry.theme === "dark" ? DARK : LIGHT },
    locale: "ru-RU",
    directory: "C:\\workspace\\openchamber",
    session: {
      id: "ses_fixture_3",
      title: "OpenChamber widget \u043F\u043E \u043E\u0431\u0440\u0430\u0437\u0446\u0443 x5-club-widget",
      busy: false,
      model: "deepseek-v4.1-flash",
      agent: "build"
    },
    surface: entry.surface,
    connection: { connected: false, account: "" },
    settings: {},
    item: null,
    features: { deviceStorage: true, statusControls: true, popovers: true }
  });
  var log = (line) => {
    const host = document.querySelector("#log");
    if (!host) return;
    const entry = document.createElement("div");
    entry.textContent = line;
    host.append(entry);
    if (host.childElementCount > 40) host.firstElementChild?.remove();
  };
  var scopedUsage = (usage2, query) => {
    const from = Number(query?.from);
    const to = Number(query?.to);
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return usage2;
    const days2 = usage2.days ?? [];
    const span = Math.max(1, Math.round((to - from) / 864e5));
    const slice = days2.slice(-span);
    if (slice.length === 0) return usage2;
    const sum = (key) => slice.reduce((total, day) => total + day[key], 0);
    const eaten = sum("tokens");
    const input = sum("input");
    const output = sum("output");
    const turns = sum("turns");
    const scale = (target, base) => base > 0 ? target / base : 1;
    const byTokens = scale(eaten, usage2.totals.eaten);
    const byInput = scale(input, usage2.totals.input);
    const byOutput = scale(output, usage2.totals.output);
    const byTurns = scale(turns, usage2.totals.turns);
    return {
      ...usage2,
      days: slice,
      sessions: usage2.sessions.map((session) => ({
        ...session,
        tokens: Math.round(session.tokens * byTokens),
        input: Math.round((session.input ?? 0) * byInput),
        output: Math.round((session.output ?? 0) * byOutput),
        turns: Math.max(1, Math.round(session.turns * byTurns))
      })),
      totals: {
        ...usage2.totals,
        eaten,
        input,
        output,
        reasoning: 0,
        cacheRead: 0,
        cacheWrite: 0,
        turns
      }
    };
  };
  window.addEventListener("message", (event) => {
    const entry = registry.find((item) => item.frame.contentWindow === event.source);
    if (!entry) return;
    const message = event.data;
    if (!message || message.channel !== CHANNEL) return;
    const id = typeof message.id === "string" ? message.id : void 0;
    log(`${entry.surface}/${entry.theme}: ${String(message.type)}`);
    switch (message.type) {
      case "hello":
        post(entry, { channel: CHANNEL, v: VERSION, type: "ready", payload: readyPayload(entry) });
        return;
      case "service-request": {
        const payload = message.payload;
        if (payload.path?.startsWith("/clipboard/")) {
          void forwardClipboard(payload).then((answer) => reply(entry, id, answer), () => reply(entry, id, { status: 500, body: '{"error":"dev-failed"}' }));
          return;
        }
        reply(entry, id, { status: 200, body: JSON.stringify(scopedUsage(entry.usage, payload.query)) });
        return;
      }
      case "storage": {
        const payload = message.payload;
        if (payload.op === "get") {
          reply(entry, id, entry.storage.has(payload.key) ? { storage: true, op: "get", found: true, value: entry.storage.get(payload.key) } : { storage: true, op: "get", found: false });
        } else if (payload.op === "set") {
          entry.storage.set(payload.key, payload.value);
          reply(entry, id, { storage: true, op: "set" });
        } else if (payload.op === "delete") {
          entry.storage.delete(payload.key);
          reply(entry, id, { storage: true, op: "delete" });
        } else {
          reply(entry, id, { storage: true, op: "keys", keys: [...entry.storage.keys()] });
        }
        return;
      }
      case "status-controls":
        renderControls(entry, message.payload.controls);
        reply(entry, id);
        return;
      case "resize": {
        const height = Number(message.payload.height);
        entry.frame.style.height = `${Math.min(Math.max(height, 40), 760)}px`;
        reply(entry, id);
        return;
      }
      case "toast": {
        const payload = message.payload;
        log(`toast ${payload.kind ?? "info"}: ${payload.message}`);
        showToast(payload.message, payload.kind ?? "info");
        reply(entry, id);
        return;
      }
      case "compose":
        showCompose(String(message.payload.text));
        reply(entry, id, { sent: "skipped" });
        return;
      case "clipboard-write":
        showToast("\u0427\u0435\u043A \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D", "success");
        reply(entry, id);
        return;
      case "open-url":
        showToast(`\u041E\u0442\u043A\u0440\u044B\u0442\u044C: ${message.payload.url}`);
        reply(entry, id);
        return;
      default:
        reply(entry, id);
    }
  });
  var mountBare = (root2, theme) => {
    const column = document.createElement("section");
    column.className = "column";
    column.dataset.theme = theme;
    const label = document.createElement("div");
    label.className = "column-label";
    label.textContent = `\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u0431\u0435\u0437 iframe \xB7 ${theme === "light" ? "\u0441\u0432\u0435\u0442\u043B\u0430\u044F" : "\u0442\u0451\u043C\u043D\u0430\u044F"}`;
    const host = document.createElement("div");
    host.className = "bare-card";
    host.dataset.ocTheme = theme;
    const card = mountCard(host, { variant: "status" });
    card.update({
      tokens: usage.totals.eaten,
      input: usage.totals.input,
      output: usage.totals.output + usage.totals.reasoning,
      productId: seededPrefs.productId,
      budget: seededPrefs.budget,
      days: 1,
      unit: periodUnit("day"),
      busy: false
    });
    column.append(label, host);
    root2.append(column);
  };
  window.addEventListener("error", (event) => log(`window error: ${event.message}`));
  window.addEventListener("unhandledrejection", (event) => log(`rejection: ${String(event.reason)}`));
  var mount = (root2, surface, theme) => {
    const column = document.createElement("section");
    column.className = "column";
    column.dataset.theme = theme;
    const label = document.createElement("div");
    label.className = "column-label";
    label.textContent = `${surface === "status" ? "Work Status" : "\u041F\u0430\u043D\u0435\u043B\u044C"} \xB7 ${theme === "light" ? "\u0441\u0432\u0435\u0442\u043B\u0430\u044F" : "\u0442\u0451\u043C\u043D\u0430\u044F"}`;
    const frame = document.createElement("iframe");
    frame.className = `frame frame-${surface}`;
    frame.title = label.textContent;
    if (params.get("sandbox") !== "0") frame.setAttribute("sandbox", "allow-scripts");
    const anchor = params.get("scroll");
    frame.src = (surface === "status" ? "../status/index.html" : "../panel/index.html") + (anchor ? `#${anchor}` : "");
    if (params.get("sandbox") === "0" && params.get("scrollY")) {
      const offset = Number(params.get("scrollY"));
      frame.addEventListener("load", () => {
        setTimeout(() => frame.contentWindow?.scrollTo(0, offset), 700);
      });
    }
    const autoClick = (selector, delay) => {
      let fired = false;
      const click = () => {
        if (fired) return;
        const button = frame.contentDocument?.querySelector(selector);
        if (!button || button.disabled) {
          setTimeout(click, 300);
          return;
        }
        fired = true;
        button.click();
      };
      frame.addEventListener("load", () => setTimeout(click, delay));
      setTimeout(click, delay + 400);
    };
    const copyDelay = Number(params.get("copyDelay"));
    if (params.get("sandbox") === "0" && params.get("autoCopy") === "1") {
      autoClick('[data-slot="copy-image"]', Number.isFinite(copyDelay) && copyDelay > 0 ? copyDelay : 1400);
    }
    if (params.get("sandbox") === "0" && params.get("autoGif") === "1") {
      autoClick('[data-slot="copy-gif"]', 1600);
    }
    if (params.get("sandbox") === "0" && params.get("settings") === "1") {
      autoClick('[data-slot="settings-open"]', 900);
    }
    const switchLang = params.get("switchLang");
    if (params.get("sandbox") === "0" && (switchLang === "ru" || switchLang === "en")) {
      autoClick('[data-slot="settings-open"]', 900);
      autoClick(`[data-lang="${switchLang}"]`, 1500);
    }
    frame.style.height = surface === "status" ? "200px" : "1360px";
    const entry = { frame, theme, surface, usage, storage: /* @__PURE__ */ new Map([["prefs", seededPrefs]]) };
    registry.push(entry);
    if (surface === "status") {
      const chrome = document.createElement("div");
      chrome.className = "panel-chrome";
      const head = document.createElement("div");
      head.className = "panel-head";
      head.innerHTML = '<span class="panel-title">Work Status</span><span class="panel-dots">\xB7\xB7\xB7</span>';
      const controls = document.createElement("div");
      controls.className = "controls";
      head.append(controls);
      entry.controls = controls;
      chrome.append(head, frame);
      column.append(label, chrome);
    } else {
      column.append(label, frame);
    }
    root2.append(column);
  };
  var root = document.querySelector("#canvas");
  var logHost = document.querySelector("#log");
  if (logHost && params.get("debug") === "1") logHost.hidden = false;
  if (params.get("poster") === "1") document.body.classList.add("poster");
  var zoom = Number(params.get("zoom"));
  if (Number.isFinite(zoom) && zoom > 0 && zoom < 2) {
    const canvas = document.querySelector("#canvas");
    if (canvas) {
      canvas.style.transform = `scale(${zoom})`;
      canvas.style.transformOrigin = "top left";
    }
  }
  if (root) {
    const surfaces = params.get("surface") === "none" ? [] : requestedSurface === "panel" || requestedSurface === "status" ? [requestedSurface] : ["status", "panel"];
    const themes = requestedTheme === "light" || requestedTheme === "dark" ? [requestedTheme] : ["light", "dark"];
    for (const surface of surfaces) {
      for (const theme of themes) mount(root, surface, theme);
    }
    if (params.get("bare") === "1") {
      for (const theme of themes) mountBare(root, theme);
    }
  }
})();
