import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, LogIn, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import { Button, ErrorText, Field, Input, LangSwitch } from '../components/ui';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const { t, errorText } = useLang();
  const { signIn } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [capacity, setCapacity] = useState<{ used: number; max: number } | null>(null);

  useEffect(() => {
    api.capacity().then(setCapacity).catch(() => {});
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = mode === 'register' ? await api.register({ name, phone, password }) : await api.login({ phone, password });
      signIn(r.token, r.user);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const seatsLeft = capacity ? Math.max(capacity.max - capacity.used, 0) : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="absolute top-4 right-4">
        <LangSwitch />
      </div>

      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-500/30">
          <Phone size={24} />
        </div>
        <h1 className="text-2xl font-bold">{t('appName')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('tagline')}</p>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-medium">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`rounded-md py-1.5 transition ${mode === m ? 'bg-white shadow-sm' : 'text-slate-500'}`}
            >
              {t(m)}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <Field label={t('name')}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                autoComplete="name"
                required
                minLength={3}
              />
            </Field>
          )}
          <Field label={t('phone')}>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              autoComplete="tel"
              required
            />
          </Field>
          <Field label={t('password')}>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                minLength={mode === 'register' ? 6 : 1}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                title={t('showPassword')}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {mode === 'register' && <span className="mt-1 block text-xs text-slate-500">{t('passwordHint')}</span>}
          </Field>

          {mode === 'register' && seatsLeft !== null && (
            <p className={`text-xs ${seatsLeft === 0 ? 'text-red-600' : 'text-slate-500'}`}>
              {seatsLeft === 0 ? t('noSeats') : t('seatsLeft', { n: seatsLeft, max: capacity!.max })}
            </p>
          )}
          <ErrorText>{error ? errorText(error) : null}</ErrorText>
          <Button type="submit" className="w-full" disabled={busy}>
            {mode === 'register' ? <UserPlus size={16} /> : <LogIn size={16} />}
            {t(mode)}
          </Button>
        </form>
      </div>
    </div>
  );
}
