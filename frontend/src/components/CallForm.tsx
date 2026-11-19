import { useState, type FormEvent } from 'react';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import { OUTCOME_KEY, STATUS_KEY, TYPE_KEY, selectCls } from '../lib/callMeta';
import type { CallDirection, CallInput, CallLang, CallOutcome, CallStatus, CallType } from '../lib/types';
import { Button, ErrorText, Field, Input, Modal, ModalActions, Textarea } from './ui';

const EMPTY: CallInput = {
  caller_name: '',
  phone: '+998 ',
  direction: 'in',
  outcome: 'answered',
  duration_min: 0,
  topic: '',
  note: '',
  call_type: 'lead',
  biz_type: '',
  lang: 'uz',
  next_step: '',
  status: 'new',
};

export function CallFormBody({ onSaved, onCancel }: { onSaved: () => void; onCancel?: () => void }) {
  const { t, errorText } = useLang();
  const [form, setForm] = useState<CallInput>(EMPTY);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof CallInput>(k: K, v: CallInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const sel = selectCls + ' w-full';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.createCall(form);
      setForm(EMPTY);
      onSaved();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('fullName')}>
          <Input value={form.caller_name} onChange={(e) => set('caller_name', e.target.value)} />
        </Field>
        <Field label={t('phone')}>
          <Input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required minLength={5} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t('direction')}>
          <select className={sel} value={form.direction} onChange={(e) => set('direction', e.target.value as CallDirection)}>
            <option value="in">{t('dirIn')}</option>
            <option value="out">{t('dirOut')}</option>
          </select>
        </Field>
        <Field label={t('outcome')}>
          <select className={sel} value={form.outcome} onChange={(e) => set('outcome', e.target.value as CallOutcome)}>
            {(Object.keys(OUTCOME_KEY) as CallOutcome[]).map((o) => (
              <option key={o} value={o}>
                {t(OUTCOME_KEY[o])}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('duration')}>
          <Input type="number" min={0} max={600} step={0.5} value={form.duration_min} onChange={(e) => set('duration_min', Number(e.target.value))} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t('callType')}>
          <select className={sel} value={form.call_type} onChange={(e) => set('call_type', e.target.value as CallType)}>
            {(Object.keys(TYPE_KEY) as CallType[]).map((k) => (
              <option key={k} value={k}>
                {t(TYPE_KEY[k])}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('bizType')}>
          <Input value={form.biz_type} onChange={(e) => set('biz_type', e.target.value)} placeholder={t('bizPlaceholder')} />
        </Field>
        <Field label={t('lang')}>
          <select className={sel} value={form.lang} onChange={(e) => set('lang', e.target.value as CallLang)}>
            <option value="uz">uz</option>
            <option value="ru">ru</option>
            <option value="en">en</option>
          </select>
        </Field>
      </div>
      <Field label={t('topic')}>
        <Input value={form.topic} onChange={(e) => set('topic', e.target.value)} placeholder={t('servicePlaceholder')} />
      </Field>
      <Field label={t('note')}>
        <Textarea value={form.note} onChange={(e) => set('note', e.target.value)} placeholder={t('notePlaceholder')} />
      </Field>
      <Field label={t('nextStep')}>
        <Input value={form.next_step} onChange={(e) => set('next_step', e.target.value)} placeholder={t('nextStepPlaceholder')} />
      </Field>
      <Field label={t('callStatus')}>
        <select className={sel} value={form.status} onChange={(e) => set('status', e.target.value as CallStatus)}>
          {(Object.keys(STATUS_KEY) as CallStatus[]).map((k) => (
            <option key={k} value={k}>
              {t(STATUS_KEY[k])}
            </option>
          ))}
        </select>
      </Field>
      <ErrorText>{error ? errorText(error) : null}</ErrorText>
      <ModalActions>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('cancel')}
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {t('save')}
        </Button>
      </ModalActions>
    </form>
  );
}

export function CallFormModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { t } = useLang();
  return (
    <Modal title={t('addCall')} onClose={onClose}>
      <CallFormBody onSaved={onSaved} onCancel={onClose} />
    </Modal>
  );
}
