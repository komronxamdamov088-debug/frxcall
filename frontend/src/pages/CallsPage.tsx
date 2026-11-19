import { PhoneCall, PhoneIncoming, PhoneOutgoing, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Button, ErrorText, Modal, ModalActions } from '../components/ui';
import { CallFormModal } from '../components/CallForm';
import { OUTCOME_KEY, STATUS_KEY, STATUS_STYLE, TYPE_KEY, fmtDuration, selectCls } from '../lib/callMeta';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import type { Call, CallDirection, CallOutcome, CallStatus, CallType } from '../lib/types';

const OUTCOME_STYLE: Record<CallOutcome, string> = {
  answered: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  no_answer: 'bg-slate-100 text-slate-600 ring-slate-200',
  busy: 'bg-amber-50 text-amber-700 ring-amber-200',
  callback: 'bg-blue-50 text-blue-700 ring-blue-200',
};

export default function CallsPage() {
  const { t, lang, errorText } = useLang();
  const [direction, setDirection] = useState<CallDirection | ''>('');
  const [outcome, setOutcome] = useState<CallOutcome | ''>('');
  const [status, setStatus] = useState<CallStatus | ''>('');
  const [ctype, setCtype] = useState<CallType | ''>('');
  const [q, setQ] = useState('');
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Call | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await api.calls({ direction: direction || undefined, outcome: outcome || undefined, status: status || undefined, call_type: ctype || undefined, q });
      setCalls(r.calls);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [direction, outcome, status, ctype, q]);

  useEffect(() => {
    const id = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(id);
  }, [load, q]);

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-60">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('searchCalls')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3 pl-9 text-base outline-none sm:py-2 sm:text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <select className={selectCls} value={direction} onChange={(e) => setDirection(e.target.value as CallDirection | '')}>
          <option value="">{t('dirAll')}</option>
          <option value="in">{t('dirIn')}</option>
          <option value="out">{t('dirOut')}</option>
        </select>
        <select className={selectCls} value={outcome} onChange={(e) => setOutcome(e.target.value as CallOutcome | '')}>
          <option value="">{t('outAll')}</option>
          {(Object.keys(OUTCOME_KEY) as CallOutcome[]).map((o) => (
            <option key={o} value={o}>
              {t(OUTCOME_KEY[o])}
            </option>
          ))}
        </select>
        <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value as CallStatus | '')}>
          <option value="">{t('stAll')}</option>
          {(Object.keys(STATUS_KEY) as CallStatus[]).map((k) => (
            <option key={k} value={k}>
              {t(STATUS_KEY[k])}
            </option>
          ))}
        </select>
        <select className={selectCls} value={ctype} onChange={(e) => setCtype(e.target.value as CallType | '')}>
          <option value="">{t('typeAll')}</option>
          {(Object.keys(TYPE_KEY) as CallType[]).map((k) => (
            <option key={k} value={k}>
              {t(TYPE_KEY[k])}
            </option>
          ))}
        </select>
        <Button className="hidden sm:inline-flex" onClick={() => setAdding(true)}>
          <Plus size={16} />
          {t('addCall')}
        </Button>
      </div>
      <button
        onClick={() => setAdding(true)}
        title={t('addCall')}
        className="fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-500/40 transition active:scale-95 sm:hidden"
      >
        <Plus size={26} />
      </button>

      <ErrorText>{error ? errorText(error) : null}</ErrorText>

      {loading ? (
        <p className="py-16 text-center text-slate-400">{t('loading')}</p>
      ) : calls.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <PhoneCall className="mx-auto mb-3 text-slate-300" size={40} />
          <p className="font-medium">{t('callsEmpty')}</p>
          <p className="mt-1 text-sm text-slate-500">{t('callsEmptyHint')}</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {calls.map((c) => (
            <div key={c.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      c.direction === 'in' ? 'bg-brand-50 text-brand-700' : 'bg-violet-50 text-violet-700'
                    }`}
                    title={c.direction === 'in' ? t('dirIn') : t('dirOut')}
                  >
                    {c.direction === 'in' ? <PhoneIncoming size={16} /> : <PhoneOutgoing size={16} />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{c.caller_name || c.phone}</h3>
                    <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="text-sm text-brand-600 hover:underline">
                      {c.phone}
                    </a>
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${OUTCOME_STYLE[c.outcome]}`}>
                  {t(OUTCOME_KEY[c.outcome])}
                </span>
              </div>
              {c.topic && (
                <p className="mt-2 text-sm break-words">
                  <span className="text-slate-500">{t('topic')}:</span> {c.topic}
                </p>
              )}
              {c.note && <p className="mt-1 text-sm break-words whitespace-pre-line text-slate-700">{c.note}</p>}
              <p className="mt-2 text-xs text-slate-500">
                {t(TYPE_KEY[c.call_type])}
                {c.biz_type ? ` · ${c.biz_type}` : ''} · {c.lang}
              </p>
              {c.next_step && (
                <p className="mt-1 text-sm break-words">
                  <span className="text-slate-500">{t('nextLabel')}:</span> {c.next_step}
                </p>
              )}
              <div className="mt-3">
                <select
                  value={c.status}
                  onChange={async (e) => {
                    try {
                      await api.setCallStatus(c.id, e.target.value as CallStatus);
                      load();
                    } catch (err) {
                      setError(err);
                    }
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium ring-1 outline-none ${STATUS_STYLE[c.status]}`}
                  aria-label={t('callStatus')}
                >
                  {(Object.keys(STATUS_KEY) as CallStatus[]).map((k) => (
                    <option key={k} value={k}>
                      {t(STATUS_KEY[k])}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-400">
                <span className="min-w-0 truncate">
                  {c.operator_name ?? '—'} · {formatDate(c.created_at, lang)} · {fmtDuration(c.duration_sec, t)}
                </span>
                <button
                  onClick={() => setDeleting(c)}
                  title={t('delete')}
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 sm:p-1.5"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && calls.length > 0 && (
        <p className="mt-4 text-center text-xs text-slate-400">
          {t('callsShown')}: {calls.length}
        </p>
      )}

      {adding && (
        <CallFormModal
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            load();
          }}
        />
      )}
      {deleting && (
        <Modal title={t('delete')} onClose={() => setDeleting(null)}>
          <p className="mb-5 text-sm text-slate-600">
            {t('confirmDelete')} <b className="text-slate-900">{deleting.caller_name || deleting.phone}</b>
          </p>
          <ModalActions>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await api.deleteCall(deleting.id);
                } catch (err) {
                  setError(err);
                }
                setDeleting(null);
                load();
              }}
            >
              <Trash2 size={16} />
              {t('delete')}
            </Button>
          </ModalActions>
        </Modal>
      )}
    </Layout>
  );
}
