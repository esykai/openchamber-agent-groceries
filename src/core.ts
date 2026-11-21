// The arithmetic and the words of the widget. Shared by every page, by the
// service and by the preview harness, so the poster and GIF always match the card.
import { getLang } from './lang';
import { t } from './i18n';

export type ProductId = 'grechka' | 'pelmeni' | 'baton' | 'moloko' | 'banany' | 'tykva' | 'konfety';

export type Product = {
  id: ProductId;
  /** Name as it reads on its own: «Гречка», or «Buckwheat» in English. */
  label: string;
  /** Singular, few, many: «пачка», «пачки», «пачек». */
  forms: readonly [string, string, string];
  /** What follows the count: « гречки», « молока». */
  of: string;
  /** Tokens per one product. Deliberately silly. */
  per: number;
};

type ProductCopy = {
  label: string;
  forms: readonly [string, string, string];
  of: string;
};

const PRODUCT_COPY: Record<ProductId, { ru: ProductCopy; en: ProductCopy; per: number }> = {
  grechka: {
    per: 1_000,
    ru: { label: 'Гречка', forms: ['пачка', 'пачки', 'пачек'], of: ' гречки' },
    en: { label: 'Buckwheat', forms: ['pack', 'packs', 'packs'], of: ' of buckwheat' },
  },
  pelmeni: {
    per: 100,
    ru: { label: 'Пельмени', forms: ['пельмень', 'пельменя', 'пельменей'], of: '' },
    en: { label: 'Pelmeni', forms: ['pelmeni', 'pelmeni', 'pelmeni'], of: '' },
  },
  baton: {
    per: 2_000,
    ru: { label: 'Батон', forms: ['батон', 'батона', 'батонов'], of: '' },
    en: { label: 'Baguette', forms: ['baguette', 'baguettes', 'baguettes'], of: '' },
  },
  moloko: {
    per: 1_500,
    ru: { label: 'Молоко', forms: ['пакет', 'пакета', 'пакетов'], of: ' молока' },
    en: { label: 'Milk', forms: ['carton', 'cartons', 'cartons'], of: ' of milk' },
  },
  banany: {
    per: 300,
    ru: { label: 'Бананы', forms: ['банан', 'банана', 'бананов'], of: '' },
    en: { label: 'Bananas', forms: ['banana', 'bananas', 'bananas'], of: '' },
  },
  tykva: {
    per: 5_000,
    ru: { label: 'Тыква', forms: ['тыква', 'тыквы', 'тыкв'], of: '' },
    en: { label: 'Pumpkin', forms: ['pumpkin', 'pumpkins', 'pumpkins'], of: '' },
  },
  konfety: {
    per: 250,
    ru: { label: 'Конфеты', forms: ['конфета', 'конфеты', 'конфет'], of: '' },
    en: { label: 'Candies', forms: ['candy', 'candies', 'candies'], of: '' },
  },
};

const makeProduct = (id: ProductId): Product => {
  const copy = PRODUCT_COPY[id];
  const pick = (): ProductCopy => (getLang() === 'en' ? copy.en : copy.ru);
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
    },
  };
};

export const PRODUCTS: readonly Product[] = (Object.keys(PRODUCT_COPY) as ProductId[]).map(makeProduct);

export const DEFAULT_PRODUCT: ProductId = 'grechka';
export const DEFAULT_BUDGET = 10_000_000;
export const BUDGET_MIN = 10_000;
export const BUDGET_MAX = 1_000_000_000;
/** Quick picks for the daily supply. */
export const BUDGET_PRESETS = [1_000_000, 10_000_000, 50_000_000, 100_000_000, 200_000_000, 300_000_000, 500_000_000] as const;
export const SLOTS = 5;

export type Period = 'day' | 'week' | 'month';

export const PERIOD_DAYS: Record<Period, number> = { day: 1, week: 7, month: 30 };

export const isPeriod = (value: unknown): value is Period =>
  value === 'day' || value === 'week' || value === 'month';

export const periodTitle = (period: Period): string =>
  period === 'day' ? t('periodDay') : period === 'week' ? t('periodWeek') : t('periodMonth');

export const periodUnit = (period: Period): string =>
  period === 'day' ? t('tokensToday') : period === 'week' ? t('tokensWeek') : t('tokensMonth');

export type PeriodRange = {
  from: number;
  to: number;
  days: number;
  start: Date;
  end: Date;
  /** The first day key, for the service's `day` parameter. */
  dayKey: string;
};

/** Local midnight-to-midnight range: today, the last 7 days or the last 30. */
export const periodRange = (period: Period, now: Date = new Date()): PeriodRange => {
  const days = PERIOD_DAYS[period];
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  return { from: start.getTime(), to, days, start, end, dayKey: dayKey(start) };
};

const monthName = (date: Date, locale: string): string => {
  try {
    // With a day present, Russian returns the genitive form ("ноября"),
    // which is what a date range needs.
    const parts = new Intl.DateTimeFormat(locale || 'ru-RU', { day: 'numeric', month: 'long' }).formatToParts(date);
    return parts.find((part) => part.type === 'month')?.value
      ?? new Intl.DateTimeFormat(locale || 'ru-RU', { month: 'long' }).format(date);
  } catch {
    return String(date.getMonth() + 1);
  }
};

/** "22 октября 2026" or "16–22 октября 2026" or "23 сентября — 22 октября 2026". */
export const rangeDateLabel = (start: Date, end: Date, locale: string): string => {
  const year = end.getFullYear();
  if (start.getFullYear() === year && start.getMonth() === end.getMonth() && start.getDate() === end.getDate()) {
    return dateLabel(end, locale);
  }
  const startMonth = monthName(start, locale);
  const endMonth = monthName(end, locale);
  if (start.getFullYear() === year && startMonth === endMonth) {
    return `${start.getDate()}–${end.getDate()} ${endMonth} ${year}`;
  }
  if (start.getFullYear() === year) {
    return `${start.getDate()} ${startMonth} — ${end.getDate()} ${endMonth} ${year}`;
  }
  return `${start.getDate()} ${startMonth} ${start.getFullYear()} — ${end.getDate()} ${endMonth} ${year}`;
};

export const isProductId = (value: unknown): value is ProductId =>
  typeof value === 'string' && PRODUCTS.some((product) => product.id === value);

export const productById = (id: ProductId): Product => PRODUCTS.find((product) => product.id === id) ?? PRODUCTS[0]!;

/** Monday — grechka, Tuesday — pelmeni, … Sunday — candy. */
export const productForDay = (date: Date): Product => PRODUCTS[(date.getDay() + 6) % 7] ?? PRODUCTS[0]!;

/** 1275853 -> «1,3м» / «1.3M», 126717 -> «127к» / «127K». */
export const compactShort = (value: number): string => {
  const en = getLang() === 'en';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', en ? '.' : ',')}${en ? 'M' : 'м'}`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}${en ? 'K' : 'к'}`;
  return String(Math.round(value));
};

/** 1275853 -> «1,28 млн» / «1.28M», 126717 -> «127к» / «127K». */
export const compact = (value: number): string => {
  const en = getLang() === 'en';
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const text = millions >= 10 ? millions.toFixed(1) : millions.toFixed(2);
    return `${text.replace('.', en ? '.' : ',')}${en ? 'M' : ' млн'}`;
  }
  if (value >= 1_000) return `${Math.round(value / 1_000)}${en ? 'K' : 'к'}`;
  return String(Math.round(value));
};

/** 1275853 -> «1 275 853». */
export const fmt = (value: number): string => String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Russian plural for a count: 1 пачка, 2 пачки, 5 пачек. */
export const plural = (count: number, forms: readonly [string, string, string]): string => {
  const last = Math.abs(count) % 10;
  const lastTwo = Math.abs(count) % 100;
  if (last === 1 && lastTwo !== 11) return forms[0];
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return forms[1];
  return forms[2];
};

/** «1 275 пачек гречки» / «1,275 packs of buckwheat». */
export const unitsLabel = (count: number, product: Product): string =>
  getLang() === 'en'
    ? `${count === 1 ? product.forms[0] : product.forms[1]}${product.of}`
    : `${plural(count, product.forms)}${product.of}`;

/** How the supplies read at a given fill. */
export const mood = (percent: number): string => {
  const en = getLang() === 'en';
  if (percent >= 100) return en ? 'ate everything' : 'всё съел';
  if (percent >= 75) return en ? 'almost everything' : 'почти всё съел';
  if (percent >= 50) return en ? 'a hearty lunch' : 'плотный обед';
  if (percent >= 25) return en ? 'half a basket' : 'полкорзины';
  if (percent > 0) return en ? 'a light snack' : 'лёгкий перекус';
  return en ? 'waiting for the first reply' : 'ждём первый ответ';
};

export const clampBudget = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_BUDGET;
  return Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, Math.round(value)));
};

/** Local midnight to local midnight, as epoch milliseconds. */
export const todayRange = (now: Date = new Date()): { from: number; to: number; date: Date } => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return { from: start.getTime(), to: end.getTime(), date: start };
};

export const dayKey = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const dateLabel = (date: Date, locale: string): string => {
  try {
    return new Intl.DateTimeFormat(locale || 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  } catch {
    return dayKey(date);
  }
};

export const timeLabel = (value: number, locale: string): string => {
  try {
    return new Intl.DateTimeFormat(locale || 'ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleTimeString();
  }
};

/** The five slots plus the leftover badge, mirroring the original card. */
export const slotsFor = (count: number): { full: number; partial: boolean; extra: number } => {
  const full = Math.min(SLOTS, count);
  return { full, partial: full < SLOTS && count > full, extra: Math.max(0, count - SLOTS) };
};
