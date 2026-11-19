import { useEffect, useState, type ReactNode } from 'react';
import Layout from '../components/Layout';
import { ErrorText } from '../components/ui';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import type { CallStats } from '../lib/types';
import { fmtDuration, OUTCOME_KEY } from './CallsPage';

function Kpi({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="truncate text-xs text-slate-500 sm:text-sm">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Bars({ rows, empty }: { rows: { label: string; n: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  if (rows.length === 0) return <p className="text-sm text-slate-400">{empty}</p>;
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[minmax(0,8rem)_1fr_2rem] items-center gap-2 text-sm">
          <span className="truncate text-slate-600">{r.label}</span>
          <span className="h-2.5 rounded-full bg-slate-100">
            <span className="block h-full rounded-full bg-brand-600" style={{ width: `${(r.n / max) * 100}%` }} />
          </span>
          <span className="text-right tabular-nums">{r.n}</span>
        </div>
      ))}
    </div>
  );
}

export default function StatsPage() {
  const { t, lang, errorText } = useLang();
  const [stats, setStats] = useState<CallStats | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    api.callStats().then(setStats).catch(setError);
  }, []);

  const tt = (k: 'min' | 'sec') => t(k);
  const fmtDay = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { day: '2-digit', month: '2-digit' });

  return (
    <Layout>
      <ErrorText>{error ? errorText(error) : null}</ErrorText>
      {!stats ? (
        !error && <p className="py-16 text-center text-slate-400">{t('loading')}</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            <Kpi label={t('statsToday')} value={stats.totals.today} />
            <Kpi label={t('statsWeek')} value={stats.totals.week} />
            <Kpi label={t('statsTotal')} value={stats.totals.total} />
            <Kpi label={t('statsAvg')} value={fmtDuration(stats.totals.avg_sec, tt)} />
            <Kpi label={t('dirIn')} value={stats.totals.incoming} />
            <Kpi label={t('dirOut')} value={stats.totals.outgoing} />
            <Kpi
              label={t('statsAnswerRate')}
              value={stats.totals.total ? `${Math.round((stats.totals.answered / stats.totals.total) * 100)}%` : '—'}
            />
            <Kpi label={t('outCallback')} value={stats.totals.callback} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 font-semibold">{t('statsByOperator')}</h2>
              <Bars rows={stats.operators.map((o) => ({ label: o.name, n: o.n }))} empty={t('noData')} />
            </section>
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
              <h2 className="mb-3 font-semibold">{t('statsOutcomes')}</h2>
              <Bars
                rows={(Object.keys(OUTCOME_KEY) as (keyof typeof OUTCOME_KEY)[]).map((o) => ({
                  label: t(OUTCOME_KEY[o]),
                  n: stats.totals[o],
                }))}
                empty={t('noData')}
              />
              <h2 className="mt-5 mb-3 font-semibold">{t('statsClients')}</h2>
              <Bars rows={stats.clients.map((c) => ({ label: t(c.status), n: c.n }))} empty={t('noData')} />
            </section>
            <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 md:col-span-2">
              <h2 className="mb-3 font-semibold">{t('statsLast14')}</h2>
              <div className="flex h-36 items-end gap-1">
                {(() => {
                  const max = Math.max(1, ...stats.days.map((d) => d.n));
                  return stats.days.map((d) => (
                    <div key={d.day} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${d.day}: ${d.n}`}>
                      <span className="text-[10px] text-slate-500 tabular-nums">{d.n || ''}</span>
                      <span className="w-full rounded-t bg-brand-600" style={{ height: `${Math.max(2, (d.n / max) * 100)}px` }} />
                      <span className="text-[10px] text-slate-400">{fmtDay(d.day)}</span>
                    </div>
                  ));
                })()}
              </div>
            </section>
          </div>
        </>
      )}
    </Layout>
  );
}
