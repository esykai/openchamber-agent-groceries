// The widget preferences: which product to count in, the daily supply it
// measures «Запасы» against, the UI language, and an optional custom store name.
// Device scope keeps each machine's taste of its own when one server is open
// from several devices.
import type { HostClient } from '@openchamber/sdk';
import { clampBudget, DEFAULT_BUDGET, DEFAULT_PRODUCT, isPeriod, isProductId, type Period, type ProductId } from './core';
import { isLang, type Lang } from './lang';

export type Prefs = {
  productId: ProductId;
  budget: number;
  period: Period;
  lang: Lang;
  customName: string;
};

export const CUSTOM_NAME_MAX = 28;

export const clampCustomName = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, CUSTOM_NAME_MAX);
};

export const DEFAULT_PREFS: Prefs = {
  productId: DEFAULT_PRODUCT,
  budget: DEFAULT_BUDGET,
  period: 'day',
  lang: 'ru',
  customName: '',
};

const KEY = 'prefs';

const parse = (value: unknown): Prefs => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return DEFAULT_PREFS;
  const record = value as Record<string, unknown>;
  return {
    productId: isProductId(record.productId) ? record.productId : DEFAULT_PREFS.productId,
    budget: typeof record.budget === 'number' ? clampBudget(record.budget) : DEFAULT_PREFS.budget,
    period: isPeriod(record.period) ? record.period : DEFAULT_PREFS.period,
    lang: isLang(record.lang) ? record.lang : DEFAULT_PREFS.lang,
    customName: clampCustomName(record.customName),
  };
};

const deviceOptions = (device: boolean) => (device ? { scope: 'device' as const } : undefined);

export const readPrefsOrNull = async (host: HostClient, device = false): Promise<Prefs | null> => {
  try {
    return parse(await host.storage.get(KEY, deviceOptions(device)));
  } catch {
    if (!device) return null;
    // A host without device storage still has an instance-wide value.
    try {
      return parse(await host.storage.get(KEY));
    } catch {
      return null;
    }
  }
};

export const readPrefs = async (host: HostClient, device = false): Promise<Prefs> =>
  (await readPrefsOrNull(host, device)) ?? DEFAULT_PREFS;

export const writePrefs = async (host: HostClient, prefs: Prefs, device = false): Promise<void> => {
  const value = {
    productId: prefs.productId,
    budget: clampBudget(prefs.budget),
    period: prefs.period,
    lang: prefs.lang,
    customName: clampCustomName(prefs.customName),
  };
  try {
    await host.storage.set(KEY, value, deviceOptions(device));
  } catch (error) {
    if (!device) throw error;
    await host.storage.set(KEY, value);
  }
};
