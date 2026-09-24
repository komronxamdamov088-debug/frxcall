import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  CheckCircle2,
  Clock,
  LogOut,
  Pencil,
  Phone,
  PhoneCall,
  Plus,
  Search,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import { formatDate } from '../lib/format';
import type { Client, ClientStatus, Stats, User } from '../lib/types';
import { Button, ErrorText, Field, LangSwitch, Modal, StatusBadge, Textarea } from '../components/ui';
import ClientForm from './ClientForm';

type Tab = ClientStatus | 'all';

const TABS: { key: Tab; icon: ReactNode; active: string }[] = [
  { key: 'all', icon: <Users size={16} />, active: 'border-brand-600 text-brand-700' },
  { key: 'waiting', icon: <Clock size={16} />, active: 'border-amber-500 text-amber-700' },
  { key: 'confirmed', icon: <CheckCircle2 size={16} />, active: 'border-emerald-500 text-emerald-700' },
  { key: 'cancelled', icon: <XCircle size={16} />, active: 'border-red-500 text-red-700' },
];

export default function ClientsPage() {
  const { t, lang, errorText } = useLang();
  const { user, logout } = useAuth();

  const [tab, setTab] = useState<Tab>('waiting');
  const [query, setQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<Stats>({ all: 0, waiting: 0, confirmed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [editing, setEditing] = useState<Client | null | 'new'>(null);
  const [cancelling, setCancelling] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [showTeam, setShowTeam] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [list, s] = await Promise.all([
        api.clients({ status: tab === 'all' ? undefined : tab, q: query }),
        api.stats(),
      ]);
      setClients(list.clients);
      setStats(s);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [tab, query]);

  useEffect(() => {
    const id = setTimeout(load, query ? 250 : 0);
    return () => clearTimeout(id);
  }, [load, query]);

  const changeStatus = async (client: Client, status: ClientStatus) => {
    if (status === 'cancelled') return setCancelling(client);
    try {
      await api.setStatus(client.id, status);
      load();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Phone size={18} />
            </div>
            <span className="font-bold">{t('appName')}</span>
          </div>
          <div className="flex items-center gap-2">
            <LangSwitch />
            <Button variant="ghost" className="px-2.5" onClick={() => setShowTeam(true)} title={t('team')}>
              <Users size={16} />
              <span className="hidden sm:inline">{user?.name}</span>
            </Button>
            <Button variant="ghost" className="px-2.5" onClick={logout} title={t('logout')}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TABS.map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-2xl border bg-white p-4 text-left transition hover:shadow-sm ${
                tab === key ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {icon}
                {t(key)}
              </div>
              <div className="mt-1 text-2xl font-bold">{stats[key]}</div>
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex overflow-x-auto border-b border-slate-200">
            {TABS.map(({ key, icon, active }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition ${
                  tab === key ? active : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {icon}
                {t(key)}
                <span className="rounded-full bg-slate-100 px-1.5 text-xs text-slate-600">{stats[key]}</span>
              </button>
            ))}
          </div>
          <Button onClick={() => setEditing('new')}>
            <Plus size={16} />
            {t('addClient')}
          </Button>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <ErrorText>{error ? errorText(error) : null}</ErrorText>

        {loading ? (
          <p className="py-16 text-center text-slate-400">{t('loading')}</p>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <PhoneCall className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="font-medium">{t('empty')}</p>
            <p className="mt-1 text-sm text-slate-500">{t('emptyHint')}</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {clients.map((c) => (
              <ClientCard
                key={c.id}
                client={c}
                onEdit={() => setEditing(c)}
                onDelete={() => setDeleting(c)}
                onStatus={(s) => changeStatus(c, s)}
              />
            ))}
          </div>
        )}
        {!loading && clients.length > 0 && (
          <p className="mt-4 text-center text-xs text-slate-400">{t('shown')}: {clients.length}</p>
        )}
      </main>

      {editing && (
        <ClientForm
          client={editing === 'new' ? null : editing}
          defaultStatus={tab === 'all' ? 'waiting' : tab}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      {cancelling && (
        <CancelModal
          client={cancelling}
          onClose={() => setCancelling(null)}
          onDone={() => {
            setCancelling(null);
            load();
          }}
        />
      )}
      {deleting && (
        <Modal title={t('delete')} onClose={() => setDeleting(null)}>
          <p className="mb-5 text-sm text-slate-600">
            {t('confirmDelete')} <b className="text-slate-900">{deleting.full_name}</b>
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await api.deleteClient(deleting.id);
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
          </div>
        </Modal>
      )}
      {showTeam && <TeamModal onClose={() => setShowTeam(false)} />}
    </div>
  );
}

function ClientCard({
  client: c,
  onEdit,
  onDelete,
  onStatus,
}: {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
  onStatus: (s: ClientStatus) => void;
}) {
  const { t, lang } = useLang();
  const actions: { status: ClientStatus; label: string; cls: string; icon: ReactNode }[] = [
    { status: 'waiting', label: t('markWaiting'), cls: 'text-amber-700 hover:bg-amber-50', icon: <Clock size={14} /> },
    { status: 'confirmed', label: t('markConfirmed'), cls: 'text-emerald-700 hover:bg-emerald-50', icon: <CheckCircle2 size={14} /> },
    { status: 'cancelled', label: t('markCancelled'), cls: 'text-red-700 hover:bg-red-50', icon: <XCircle size={14} /> },
  ];

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{c.full_name}</h3>
          <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="text-sm text-brand-600 hover:underline">
            {c.phone}
          </a>
        </div>
        <StatusBadge status={c.status} />
      </div>

      {c.service && <p className="mt-2 text-sm"><span className="text-slate-500">{t('service')}:</span> {c.service}</p>}
      {c.note && <p className="mt-1 text-sm whitespace-pre-line text-slate-700">{c.note}</p>}
      {c.status === 'cancelled' && c.cancel_reason && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <b>{t('cancelReason')}:</b> {c.cancel_reason}
        </p>
      )}

      <div className="mt-3 text-xs text-slate-400">
        {t('addedBy')}: {c.created_by_name ?? '—'} · {formatDate(c.created_at, lang)}
        {c.updated_at !== c.created_at && (
          <>
            <br />
            {t('updatedBy')}: {c.updated_by_name ?? '—'} · {formatDate(c.updated_at, lang)}
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-3">
        {actions
          .filter((a) => a.status !== c.status)
          .map((a) => (
            <button
              key={a.status}
              onClick={() => onStatus(a.status)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${a.cls}`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        <div className="ml-auto flex gap-1">
          <button onClick={onEdit} title={t('edit')} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <Pencil size={16} />
          </button>
          <button onClick={onDelete} title={t('delete')} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CancelModal({ client, onClose, onDone }: { client: Client; onClose: () => void; onDone: () => void }) {
  const { t, errorText } = useLang();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<unknown>(null);

  const submit = async () => {
    try {
      await api.setStatus(client.id, 'cancelled', reason);
      onDone();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Modal title={`${t('markCancelled')}: ${client.full_name}`} onClose={onClose}>
      <div className="space-y-4">
        <Field label={t('cancelReason')}>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('cancelReasonPlaceholder')} autoFocus />
        </Field>
        <ErrorText>{error ? errorText(error) : null}</ErrorText>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant="danger" onClick={submit}>
            <XCircle size={16} />
            {t('markCancelled')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function TeamModal({ onClose }: { onClose: () => void }) {
  const { t, lang } = useLang();
  const [data, setData] = useState<{ users: User[]; max: number } | null>(null);

  useEffect(() => {
    api.users().then(setData).catch(() => {});
  }, []);

  return (
    <Modal title={data ? `${t('team')} (${data.users.length}/${data.max})` : t('team')} onClose={onClose}>
      {!data ? (
        <p className="text-sm text-slate-400">{t('loading')}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {data.users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 font-semibold text-brand-700">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{u.name}</p>
                <p className="truncate text-xs text-slate-500">
                  {u.phone} · {t('lastLogin')}: {formatDate(u.last_login_at, lang)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
