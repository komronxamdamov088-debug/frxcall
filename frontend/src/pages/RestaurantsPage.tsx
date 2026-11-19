import { ExternalLink, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useLang } from '../context/LangContext';
import { restaurants, restaurantSites } from '../lib/restaurants';

export default function RestaurantsPage() {
  const { t, lang } = useLang();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const kinds = useMemo(() => [...new Set(restaurants.map((r) => r.kind[lang]))], [lang]);
  const k = q.trim().toLowerCase();
  const list = restaurants.filter(
    (r) => (!kind || r.kind[lang] === kind) && (!k || `${r.name} ${r.kind[lang]} ${r.desc[lang]}`.toLowerCase().includes(k))
  );

  return (
    <Layout>
      <h1 className="text-xl font-bold">{t('restTitle')}</h1>
      <p className="mt-1 mb-4 max-w-2xl text-sm text-slate-500">{t('restHint')}</p>

      <div className="relative mb-3 max-w-md">
        <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('restSearch')}
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-3 pl-9 text-base outline-none sm:py-2 sm:text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {['', ...kinds].map((x) => (
          <button
            key={x || 'all'}
            onClick={() => setKind(x)}
            aria-pressed={kind === x}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
              kind === x ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {x || t('all')}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="py-12 text-center text-slate-400">{t('noData')}</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <article key={r.name} className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-slate-200 bg-white p-4">
              <span className="text-[11px] font-semibold tracking-wide text-amber-600 uppercase">{r.kind[lang]}</span>
              <h3 className="font-semibold">{r.name}</h3>
              <p className="text-sm text-slate-600">{r.desc[lang]}</p>
              <p className="text-sm">{r.where}</p>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-brand-600 hover:underline"
              >
                {t('restSource')}: {r.source}
                <ExternalLink size={13} />
              </a>
            </article>
          ))}
        </div>
      )}

      <h2 className="mt-8 mb-3 font-semibold">{t('restMore')}</h2>
      <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
        {restaurantSites.map((s) => (
          <li key={s.name} className="border-t border-slate-200 py-2.5">
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 hover:underline">
              {s.name}
            </a>
            <span className="block text-sm text-slate-500">{s.note[lang]}</span>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
