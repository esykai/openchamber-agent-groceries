// Assertions for the arithmetic, the words and the boundaries. Run: npm run check
import fs from 'node:fs';
import { dayKey, fmt, mood, plural, productById, rangeDateLabel, slotsFor, todayRange, unitsLabel, PRODUCTS } from '../src/core';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')) as { version: string };
const serviceSource = fs.readFileSync('service/main.ts', 'utf8');

let failures = 0;
const check = (name: string, condition: boolean, detail?: unknown): void => {
  if (condition) {
    console.log(`ok   ${name}`);
    return;
  }
  failures += 1;
  console.log(`FAIL ${name}`, detail ?? '');
};
const equal = (name: string, actual: unknown, expected: unknown): void =>
  check(name, JSON.stringify(actual) === JSON.stringify(expected), { actual, expected });

equal('plural 1', plural(1, ['пачка', 'пачки', 'пачек']), 'пачка');
equal('plural 2', plural(2, ['пачка', 'пачки', 'пачек']), 'пачки');
equal('plural 5', plural(5, ['пачка', 'пачки', 'пачек']), 'пачек');
equal('plural 11', plural(11, ['пачка', 'пачки', 'пачек']), 'пачек');
equal('plural 21', plural(21, ['пачка', 'пачки', 'пачек']), 'пачка');
equal('plural 111', plural(111, ['пачка', 'пачки', 'пачек']), 'пачек');
equal('fmt', fmt(1_275_853), '1 275 853');
equal('fmt small', fmt(999), '999');

equal('mood 0', mood(0), 'ждём первый ответ');
equal('mood 25', mood(25), 'полкорзины');
equal('mood 64', mood(64), 'плотный обед');
equal('mood 100', mood(100), 'всё съел');

const grechka = productById('grechka');
equal('units', unitsLabel(32, grechka), 'пачки гречки');
equal('units 1', unitsLabel(1, grechka), 'пачка гречки');
equal('units 2', unitsLabel(2, grechka), 'пачки гречки');
equal('baton units', unitsLabel(1, productById('baton')), 'батон');

equal('slots 0', slotsFor(0), { full: 0, partial: false, extra: 0 });
equal('slots 3', slotsFor(3), { full: 3, partial: false, extra: 0 });
equal('slots 1275', slotsFor(1275), { full: 5, partial: false, extra: 1270 });

equal('coefficients', PRODUCTS.map((item) => item.per), [1_000, 100, 2_000, 1_500, 300, 5_000, 250]);

const range = todayRange(new Date(2026, 9, 22, 15, 30));
equal('range length', range.to - range.from, 86_400_000);
equal('range start', new Date(range.from).getHours(), 0);
equal('range key', dayKey(range.date), '2026-10-22');
equal(
  'range label same month',
  rangeDateLabel(new Date(2026, 10, 4), new Date(2026, 10, 10), 'ru-RU'),
  '4–10 ноября 2026',
);
equal(
  'range label cross month',
  rangeDateLabel(new Date(2026, 9, 12), new Date(2026, 10, 10), 'ru-RU'),
  '12 октября — 10 ноября 2026',
);

check(
  'service version matches package.json',
  serviceSource.includes(`SERVICE_VERSION = '${pkg.version}'`),
  { packageVersion: pkg.version },
);

if (failures > 0) {
  console.error(`\n${failures} failed`);
  process.exit(1);
}
console.log('\nall checks passed');
