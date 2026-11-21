// Small, dependency-free UI dictionary. Products live in core; this module is
// only about the brand and the interface copy.
import { getLang, type Lang } from './lang';

export type Brand = {
  name: string;
  upper: string;
  short: string;
  footer: string;
};

const BRANDS: Record<Lang, Brand> = {
  ru: {
    name: 'X5 Клуб',
    upper: 'X5 КЛУБ',
    short: 'X5',
    footer: 'OpenChamber · X5 Клуб',
  },
  en: {
    name: '7-Eleven Club',
    upper: '7-ELEVEN CLUB',
    short: '7-Eleven',
    footer: 'OpenChamber · 7-Eleven Club',
  },
};


let customBrandName = '';

export const setCustomBrandName = (name: string): void => {
  customBrandName = name.replace(/\s+/g, ' ').trim();
};


export const defaultBrandName = (lang: Lang = getLang()): string => BRANDS[lang].name;

export const brand = (): Brand => {
  const base = BRANDS[getLang()];
  if (!customBrandName) return base;
  return {
    name: customBrandName,
    upper: customBrandName.toUpperCase(),
    short: customBrandName,
    footer: `OpenChamber · ${customBrandName}`,
  };
};

const RU = {
  title: 'Сколько съел мой Агент?',
  thisIs: 'ЭТО КАК',
  supply: 'ЗАПАСЫ',
  dailySupply: 'дневной запас',
  supplyForDays: 'запас на {days} дн.',
  input: 'вход',
  output: 'выход',
  inputUpper: 'ВХОД',
  outputUpper: 'ВЫХОД',
  tokens: 'токенов',
  total: 'итого',
  tokensToday: 'токенов за сегодня',
  tokensWeek: 'токенов за 7 дней',
  tokensMonth: 'токенов за 30 дней',
  tabDay: 'Сегодня',
  tabWeek: 'Неделя',
  tabMonth: 'Месяц',
  periodDay: 'Сегодня',
  periodWeek: 'За 7 дней',
  periodMonth: 'За 30 дней',
  dynamics: 'Динамика',
  whoAte: 'Кто съел',
  settings: 'Настройки',
  done: 'Готово',
  language: 'Язык',
  storeName: 'Название клуба',
  storeNameMeta: 'по умолчанию {default}',
  storeNamePlaceholder: 'Своё название (например, {default})',
  storeNameAria: 'Название клуба или магазина',
  storeNameReset: 'По умолчанию',
  countIn: 'Считаю в',
  dailySupplyTitle: 'Дневной запас',
  tokensToProduct: 'токены → продукт',
  upToBillion: 'до 1 млрд',
  productAria: 'Продукт для пересчёта',
  periodAria: 'Период',
  settingsAria: 'Настройки',
  refresh: 'Обновить',
  refreshAria: 'Обновить данные',
  copyImage: 'Скопировать картинку',
  copyGif: 'Скопировать GIF',
  copyingImage: 'Рисую картинку…',
  copyingGif: 'Рисую GIF…',
  copyImageToast: 'Картинка в буфере обмена',
  copyGifToast: 'GIF в буфере обмена',
  calculating: 'Считаю токены…',
  firstResponseHint: 'Первый ответ может занять пару секунд.',
  noData: 'Нет данных.',
  nothingToday: 'Сегодня ещё ничего не съедено.',
  nothingPeriod: 'За этот период ещё ничего не съедено.',
  retry: 'Повторить',
  budgetAria: 'Дневной запас токенов',
  budgetMin: 'Минимум {value} токенов',
  budgetMax: 'Максимум {value} токенов',
  sessionIn: 'вход',
  sessionOut: 'выход',
  unknownModel: 'модель неизвестна',
  steps: 'шаг',
  stepsMany: 'шагов',
  busy: 'агент ест',
  left: 'ОСТАЛОСЬ',
  bestDay: 'ЛУЧШИЙ ДЕНЬ',
  averagePerDay: 'в среднем {value} в день',
  shareOfWeek: '{share}% недели',
  thanks: 'Спасибо, что кормите моего агента!',
  footerStats: 'считаем вход, выход и запись в кэш',
  imageControl: 'Картинка',
  supplyStatus: 'запасы {percent}%',
  supplyGone: 'запасы кончились',
  copyNoService: 'Разреши локальный сервис: Настройки → Расширения → Agent Groceries.',
  copyDisabled: 'Расширение на паузе: включи его в Настройки → Расширения.',
  copyTimeout: 'Сервис виджета не ответил.',
  copyGeneric: 'Не получилось скопировать картинку.',
  copyPrepare: 'Не получилось подготовить файл.',
  copyOldService: 'Сервис виджета старой версии — перезапусти OpenChamber.',
  copyTooLarge: 'Файл получился слишком большим.',
  copyServiceRejected: 'Сервис виджета не принял файл. Перезапусти OpenChamber.',
  copyBusy: 'Слишком много попыток подряд — подожди пару секунд.',
  copyNoPowerShell: 'Windows не нашёл PowerShell — без него файл в буфер не положить.',
  copySystem: 'Система не отдала буфер обмена. Попробуй ещё раз.',
  copyLost: 'Сервис потерял файл — попробуй ещё раз.',
  copyRecognize: 'Сервис не распознал файл.',
  copyCouldNot: 'Сервис не смог положить файл в буфер.',
  copyImageError: 'Не получилось нарисовать картинку.',
  copyGifError: 'Не получилось нарисовать GIF.',
  copyImageFileError: 'Не удалось передать файл в сервис. Попробуй ещё раз.',
  copyClipboardOccupied: 'Буфер обмена занят. Подожди секунду и попробуй ещё раз.',
  usageNoServiceTitle: 'Локальный сервис не разрешён',
  usageNoServiceBody: 'Настройки → Расширения → Agent Groceries: разреши локальный сервис и открой раздел заново.',
  usageServiceFailedTitle: 'Сервис виджета не запустился',
  usageServiceFailedBody: 'Проверь Настройки → Расширения или перезапусти OpenChamber.',
  usageBadRequestTitle: 'Сервис не понял запрос',
  usageDbFailedTitle: 'Не получилось прочитать базу',
  usageHostDeniedTitle: 'OpenChamber не пустил к сервису',
  usageNoDbTitle: 'Нет базы OpenCode',
  usageNoDbBody: 'Ещё не появлялась после первого запуска сессии. Проверь, что OpenChamber работает с OpenCode, и обнови.',
  usageNoTableTitle: 'Незнакомый формат базы OpenCode',
  usageNoTableBody: 'Нужна свежая база OpenCode 2.x. Обнови OpenCode и попробуй снова.',
  usageDisabledTitle: 'Расширение на паузе',
  usageDisabledBody: 'Включи Agent Groceries в Настройки → Расширения.',
  usageTimeoutTitle: 'Сервис не ответил вовремя',
  usageHostTitle: 'Не получилось вызвать сервис',
  usageBadJsonTitle: 'Сервис ответил не JSON',
  usageBadShapeTitle: 'Сервис ответил не тем, что ожидали',
  presetMillion: '{value} млн',
  budgetUnit: 'токенов',
  settingsError: 'Не получилось сохранить настройки',
} as const;

type Dict = Record<keyof typeof RU, string>;

const EN: Dict = {
  title: 'How much did my Agent eat?',
  thisIs: 'THIS IS',
  supply: 'SUPPLY',
  dailySupply: 'daily supply',
  supplyForDays: 'supply for {days} days',
  input: 'input',
  output: 'output',
  inputUpper: 'INPUT',
  outputUpper: 'OUTPUT',
  tokens: 'tokens',
  total: 'total',
  tokensToday: 'tokens today',
  tokensWeek: 'tokens in 7 days',
  tokensMonth: 'tokens in 30 days',
  tabDay: 'Today',
  tabWeek: 'Week',
  tabMonth: 'Month',
  periodDay: 'Today',
  periodWeek: 'Last 7 days',
  periodMonth: 'Last 30 days',
  dynamics: 'Activity',
  whoAte: 'Who ate',
  settings: 'Settings',
  done: 'Done',
  language: 'Language',
  storeName: 'Store / club name',
  storeNameMeta: 'default: {default}',
  storeNamePlaceholder: 'Custom name (e.g. {default})',
  storeNameAria: 'Store or club name',
  storeNameReset: 'Default',
  countIn: 'Count in',
  dailySupplyTitle: 'Daily supply',
  tokensToProduct: 'tokens → product',
  upToBillion: 'up to 1B',
  productAria: 'Product for conversion',
  periodAria: 'Period',
  settingsAria: 'Settings',
  refresh: 'Refresh',
  refreshAria: 'Refresh data',
  copyImage: 'Copy image',
  copyGif: 'Copy GIF',
  copyingImage: 'Drawing image…',
  copyingGif: 'Drawing GIF…',
  copyImageToast: 'Image is on the clipboard',
  copyGifToast: 'GIF is on the clipboard',
  calculating: 'Counting tokens…',
  firstResponseHint: 'The first reply may take a couple of seconds.',
  noData: 'No data.',
  nothingToday: 'Nothing has been eaten today yet.',
  nothingPeriod: 'Nothing has been eaten in this period yet.',
  retry: 'Retry',
  budgetAria: 'Daily token supply',
  budgetMin: 'Minimum {value} tokens',
  budgetMax: 'Maximum {value} tokens',
  sessionIn: 'in',
  sessionOut: 'out',
  unknownModel: 'unknown model',
  steps: 'step',
  stepsMany: 'steps',
  busy: 'agent is eating',
  left: 'LEFT',
  bestDay: 'BEST DAY',
  averagePerDay: 'average {value} per day',
  shareOfWeek: '{share}% of the week',
  thanks: 'Thank you for feeding my agent!',
  footerStats: 'counts input, output and cache writes',
  imageControl: 'Image',
  supplyStatus: 'supply {percent}%',
  supplyGone: 'supply is gone',
  copyNoService: 'Allow the local service: Settings → Extensions → Agent Groceries.',
  copyDisabled: 'The extension is paused: enable it in Settings → Extensions.',
  copyTimeout: 'The widget service did not respond.',
  copyGeneric: 'Could not copy the image.',
  copyPrepare: 'Could not prepare the file.',
  copyOldService: 'The widget service is out of date — restart OpenChamber.',
  copyTooLarge: 'The file turned out too large.',
  copyServiceRejected: 'The widget service rejected the file. Restart OpenChamber.',
  copyBusy: 'Too many attempts in a row — wait a couple of seconds.',
  copyNoPowerShell: 'Windows could not find PowerShell; it is needed to put the file on the clipboard.',
  copySystem: 'The system refused the clipboard. Try again.',
  copyLost: 'The service lost the file — try again.',
  copyRecognize: 'The service did not recognize the file.',
  copyCouldNot: 'The service could not put the file on the clipboard.',
  copyImageError: 'Could not draw the image.',
  copyGifError: 'Could not draw the GIF.',
  copyImageFileError: 'Could not send the file to the service. Try again.',
  copyClipboardOccupied: 'The clipboard is busy. Wait a second and try again.',
  usageNoServiceTitle: 'Local service is not allowed',
  usageNoServiceBody: 'Settings → Extensions → Agent Groceries: allow the local service and open the section again.',
  usageServiceFailedTitle: 'The widget service did not start',
  usageServiceFailedBody: 'Check Settings → Extensions or restart OpenChamber.',
  usageBadRequestTitle: 'The service did not understand the request',
  usageDbFailedTitle: 'Could not read the database',
  usageHostDeniedTitle: 'OpenChamber refused the service call',
  usageNoDbTitle: 'No OpenCode database',
  usageNoDbBody: 'It has not appeared after the first session yet. Check that OpenChamber works with OpenCode and refresh.',
  usageNoTableTitle: 'Unknown OpenCode database format',
  usageNoTableBody: 'A recent OpenCode 2.x database is required. Update OpenCode and try again.',
  usageDisabledTitle: 'The extension is paused',
  usageDisabledBody: 'Enable Agent Groceries in Settings → Extensions.',
  usageTimeoutTitle: 'The service did not answer in time',
  usageHostTitle: 'Could not call the service',
  usageBadJsonTitle: 'The service answered with invalid JSON',
  usageBadShapeTitle: 'The service answered with an unexpected shape',
  presetMillion: '{value}M',
  budgetUnit: 'tokens',
  settingsError: 'Could not save the settings',
};

const DICTS: Record<Lang, Dict> = { ru: RU, en: EN };

export type I18nKey = keyof typeof RU;

const fill = (template: string, vars?: Record<string, string | number>): string => {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  ));
};

export const t = (key: I18nKey, vars?: Record<string, string | number>): string =>
  fill(DICTS[getLang()][key], vars);

export const presetLabel = (value: number): string => {
  const millions = value / 1_000_000;
  return t('presetMillion', { value: Number.isInteger(millions) ? millions : millions.toFixed(0) });
};
