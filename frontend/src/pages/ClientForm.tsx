import { useState, type FormEvent } from 'react';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import type { Client, ClientInput, ClientStatus } from '../lib/types';
import { Button, ErrorText, Field, Input, Modal, Textarea, statusStyles } from '../components/ui';

const STATUSES: ClientStatus[] = ['waiting', 'confirmed', 'cancelled'];

export default function ClientForm({
  client,
  defaultStatus,
  onClose,
  onSaved,
}: {
  client: Client | null;
  defaultStatus: ClientStatus;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t, errorText } = useLang();
  const [form, setForm] = useState<ClientInput>({
    full_name: client?.full_name ?? '',
    phone: client?.phone ?? '+998 ',
    service: client?.service ?? '',
    note: client?.note ?? '',
    status: client?.status ?? defaultStatus,
    cancel_reason: client?.cancel_reason ?? '',
  });
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ClientInput>(key: K, value: ClientInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (client) await api.updateClient(client.id, form);
      else await api.createClient(form);
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={client ? t('editClient') : t('addClient')} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('fullName')}>
            <Input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required minLength={2} autoFocus />
          </Field>
          <Field label={t('phone')}>
            <Input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required minLength={5} />
          </Field>
        </div>
        <Field label={t('service')}>
          <Input value={form.service} onChange={(e) => set('service', e.target.value)} placeholder={t('servicePlaceholder')} />
        </Field>
        <Field label={t('note')}>
          <Textarea value={form.note} onChange={(e) => set('note', e.target.value)} placeholder={t('notePlaceholder')} />
        </Field>

        <Field label={t('status')}>
          <div className="grid grid-cols-3 gap-2">
            {STATUSES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => set('status', s)}
                className={`rounded-lg px-2 py-2 text-xs font-medium ring-1 transition sm:text-sm ${
                  form.status === s ? statusStyles[s].badge + ' ring-2' : 'text-slate-500 ring-slate-200 hover:bg-slate-50'
                }`}
              >
                {t(s)}
              </button>
            ))}
          </div>
        </Field>

        {form.status === 'cancelled' && (
          <Field label={t('cancelReason')}>
            <Textarea
              rows={2}
              value={form.cancel_reason}
              onChange={(e) => set('cancel_reason', e.target.value)}
              placeholder={t('cancelReasonPlaceholder')}
            />
          </Field>
        )}

        <ErrorText>{error ? errorText(error) : null}</ErrorText>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={busy}>
            {t('save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
