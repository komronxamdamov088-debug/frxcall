import type { CallOutcome, CallStatus, CallType } from './types';

export const OUTCOME_KEY = {
  answered: 'outAnswered',
  no_answer: 'outNoAnswer',
  busy: 'outBusy',
  callback: 'outCallback',
} as const satisfies Record<CallOutcome, string>;

export const TYPE_KEY = {
  lead: 'typeLead',
  support: 'typeSupport',
  complaint: 'typeComplaint',
  partnership: 'typePartnership',
  other: 'typeOther',
} as const satisfies Record<CallType, string>;

export const STATUS_KEY = {
  new: 'stNew',
  handed_off: 'stHandedOff',
  closed: 'stClosed',
} as const satisfies Record<CallStatus, string>;

export const STATUS_STYLE: Record<CallStatus, string> = {
  new: 'bg-blue-50 text-blue-700 ring-blue-200',
  handed_off: 'bg-amber-50 text-amber-700 ring-amber-200',
  closed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export const selectCls =
  'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base outline-none sm:py-2 sm:text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export function fmtDuration(sec: number, t: (k: 'min' | 'sec') => string) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m} ${t('min')}${s ? ` ${s} ${t('sec')}` : ''}` : `${s} ${t('sec')}`;
}
