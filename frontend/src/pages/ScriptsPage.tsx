import { Copy, Search, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import Layout from '../components/Layout';
import { CallFormBody } from '../components/CallForm';
import { useLang } from '../context/LangContext';
import { scripts } from '../lib/scripts';

export default function ScriptsPage() {
  const { t, lang } = useLang();
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [saved, setSaved] = useState(0);
  const k = q.trim().toLowerCase();
  const list = scripts[lang].filter((s) => !k || `${s.title} ${s.body}`.toLowerCase().includes(k));

  const copy = async (i: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard bloklangan bo'lishi mumkin */
    }
  };

  return (
    <Layout>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="min-w-0">
      <h1 className="text-xl font-bold">{t('scriptsTitle')}</h1>
      <p className="mt-1 mb-4 text-sm text-slate-500">{t('scriptsHint')}</p>
      <div className="relative mb-4 max-w-md">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('scriptsSearch')}
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3 pl-9 text-base outline-none sm:py-2 sm:text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      {list.length === 0 ? (
        <p className="py-12 text-center text-slate-400">{t('noData')}</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {list.map((s, i) => (
            <div
              key={s.title}
              className={`min-w-0 rounded-2xl border p-4 ${s.danger ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}
            >
              <h3 className={`flex items-center gap-1.5 font-semibold ${s.danger ? 'text-red-700' : ''}`}>
                {s.danger && <ShieldAlert size={16} />}
                {s.title}
              </h3>
              <p className="mt-2 text-sm break-words whitespace-pre-line text-slate-700">{s.body}</p>
              <button
                onClick={() => copy(i, s.body)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
              >
                <Copy size={14} />
                {copied === i ? t('copied') : t('copy')}
              </button>
            </div>
          ))}
        </div>
      )}
      </div>
      <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-32">
        <h2 className="mb-3 font-semibold">{t('formInline')}</h2>
        <CallFormBody onSaved={() => setSaved((n) => n + 1)} />
        {saved > 0 && <p className="mt-3 text-sm text-emerald-700">✓ {t('save')}: {saved}</p>}
      </aside>
      </div>
    </Layout>
  );
}
