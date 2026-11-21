// A realistic day of OpenChamber use, for the preview harness.
import type { Usage } from '../src/usage';

const now = Date.now();

const dayKey = (date: Date): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const days = Array.from({ length: 30 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - index));
  const wave = Math.abs(Math.sin(index * 1.7));
  const tokens = index === 29 ? 1_275_853 : Math.round(180_000 + wave * 620_000);
  const input = Math.round(tokens * 0.91);
  return {
    date: dayKey(date),
    tokens,
    input,
    output: tokens - input,
    turns: 20 + Math.round(wave * 40),
  };
});

const sessionTitles = {
  ru: [
    'Рейтинг, медали, сортировка и лента комментариев',
    'Проверка разрешений расширения',
    'OpenChamber widget по образцу x5-club-widget',
  ],
  en: [
    'Ratings, medals, sorting and the comment feed',
    'Checking the extension permission flow',
    'OpenChamber widget modelled on x5-club-widget',
  ],
} as const;

export const fixtureUsage = (lang: 'ru' | 'en' = 'ru'): Usage => ({
  date: new Date().toISOString().slice(0, 10),
  source: '~/.local/share/opencode/opencode.db',
  totals: {
    eaten: 1_275_853,
    input: 1_161_026,
    output: 114_827,
    reasoning: 0,
    cacheRead: 26_335_104,
    cacheWrite: 0,
    cost: 0,
    turns: 53,
  },
  sessions: [
    {
      id: 'ses_fixture_1',
      title: sessionTitles[lang][0],
      model: 'deepseek-v4.1-flash',
      tokens: 721_935,
      input: 640_000,
      output: 81_935,
      turns: 30,
      updated: now - 4 * 60_000,
    },
    {
      id: 'ses_fixture_2',
      title: sessionTitles[lang][1],
      model: 'claude-sonnet-4-5',
      tokens: 446_961,
      input: 424_026,
      output: 22_935,
      turns: 15,
      updated: now - 52 * 60_000,
    },
    {
      id: 'ses_fixture_3',
      title: sessionTitles[lang][2],
      model: 'deepseek-v4.1-flash',
      tokens: 106_957,
      input: 97_000,
      output: 9_957,
      turns: 8,
      updated: now - 2 * 60_000,
    },
  ],
  lastAt: now - 4 * 60_000,
  days,
});
