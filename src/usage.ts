// Talking to the local service, and turning every way it can fail into one
// short sentence the card can show.
import { HostRequestError, type HostClient } from '@openchamber/sdk';
import { t } from './i18n';

export type UsageTotals = {
  eaten: number;
  input: number;
  output: number;
  reasoning: number;
  cacheRead: number;
  cacheWrite: number;
  cost: number;
  turns: number;
};

export type UsageSession = {
  id: string;
  title: string;
  model: string | null;
  tokens: number;
  input?: number;
  output?: number;
  turns: number;
  updated: number;
};

export type UsageDay = {
  date: string;
  tokens: number;
  input: number;
  output: number;
  turns: number;
};

export type Usage = {
  date: string;
  /** The database the numbers came from, as reported by the service. */
  source: string;
  totals: UsageTotals;
  sessions: UsageSession[];
  days?: UsageDay[];
  lastAt: number | null;
};

export type UsageProblem = {
  code:
    | 'no-service'
    | 'disabled'
    | 'service-failed'
    | 'timeout'
    | 'no-db'
    | 'unsupported-storage'
    | 'db-failed'
    | 'bad-answer'
    | 'host';
  title: string;
  body?: string;
};

export type UsageResult = { ok: true; usage: Usage } | { ok: false; problem: UsageProblem };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const isUsage = (value: unknown): value is Usage => {
  if (!isRecord(value) || !isRecord(value.totals) || !Array.isArray(value.sessions)) return false;
  const totals = value.totals;
  for (const key of ['eaten', 'input', 'output', 'reasoning', 'cacheRead', 'cacheWrite', 'cost', 'turns']) {
    if (!isNumber(totals[key])) return false;
  }
  if (typeof value.date !== 'string' || typeof value.source !== 'string') return false;
  return value.sessions.every((session) =>
    isRecord(session)
    && typeof session.id === 'string'
    && typeof session.title === 'string'
    && isNumber(session.tokens)
    && isNumber(session.turns),
  );
};

const failureCode = (value: unknown): string | null => {
  if (!isRecord(value)) return null;
  return typeof value.error === 'string' ? value.error : null;
};

const describe = (code: string, detail: string | null): UsageProblem => {
  switch (code) {
    case 'no-db':
      return {
        code: 'no-db',
        title: t('usageNoDbTitle'),
        body: t('usageNoDbBody'),
      };
    case 'unsupported-storage':
      return {
        code: 'unsupported-storage',
        title: t('usageNoTableTitle'),
        body: t('usageNoTableBody'),
      };
    case 'bad-request':
      return { code: 'bad-answer', title: t('usageBadRequestTitle') };
    default:
      return {
        code: 'db-failed',
        title: t('usageDbFailedTitle'),
        body: detail ? detail.slice(0, 200) : undefined,
      };
  }
};

const describeHost = (error: HostRequestError): UsageProblem => {
  switch (error.code) {
    case 'NO_SERVICE':
      return {
        code: 'no-service',
        title: t('usageNoServiceTitle'),
        body: t('usageNoServiceBody'),
      };
    case 'DISABLED':
      return {
        code: 'disabled',
        title: t('usageDisabledTitle'),
        body: t('usageDisabledBody'),
      };
    case 'SERVICE_FAILED':
      return {
        code: 'service-failed',
        title: t('usageServiceFailedTitle'),
        body: t('usageServiceFailedBody'),
      };
    case 'HOST_TIMEOUT':
      return { code: 'timeout', title: t('usageTimeoutTitle') };
    default:
      return {
        code: 'host',
        title: t('usageHostDeniedTitle'),
        body: `${error.code}: ${error.message}`.slice(0, 200),
      };
  }
};

export type UsageRange = { from: number; to: number; day: string; tzOffset: number };

/** The requested range, from the extension's local service. */
export const loadUsage = async (host: HostClient, range: UsageRange): Promise<UsageResult> => {
  let answer;
  try {
    answer = await host.serviceRequest({
      method: 'GET',
      path: '/usage',
      query: {
        from: String(range.from),
        to: String(range.to),
        day: range.day,
        tzOffset: String(range.tzOffset),
      },
    });
  } catch (error) {
    if (error instanceof HostRequestError) return { ok: false, problem: describeHost(error) };
    return {
      ok: false,
      problem: { code: 'host', title: t('usageHostTitle'), body: String(error).slice(0, 200) },
    };
  }

  let body: unknown;
  try {
    body = JSON.parse(answer.body);
  } catch {
    return { ok: false, problem: { code: 'bad-answer', title: t('usageBadJsonTitle') } };
  }

  const code = failureCode(body);
  if (code) {
    const detail = isRecord(body) && typeof body.detail === 'string' ? body.detail : null;
    return { ok: false, problem: describe(code, detail) };
  }
  if (!isUsage(body)) {
    return { ok: false, problem: { code: 'bad-answer', title: t('usageBadShapeTitle') } };
  }
  return { ok: true, usage: body };
};
