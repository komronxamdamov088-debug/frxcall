import { createContext, useContext, useState, type ReactNode } from 'react';
import { dictionaries, errorMessages, type Lang, type TKey } from '../lib/i18n';
import { ApiError } from '../lib/api';

interface LangValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  errorText: (err: unknown) => string;
}

const LangContext = createContext<LangValue | null>(null);
const STORAGE_KEY = 'frx_phone_lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'uz' || saved === 'ru') return saved;
  } catch {
    /* localStorage yopiq bo'lishi mumkin */
  }
  return 'uz';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = (next: Lang) => {
    setLangState(next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const t: LangValue['t'] = (key, vars) => {
    let text = dictionaries[lang][key];
    if (vars) for (const [k, v] of Object.entries(vars)) text = text.replace(`{${k}}`, String(v));
    return text;
  };

  const errorText = (err: unknown) => {
    const code = err instanceof ApiError ? err.code : 'DEFAULT';
    return errorMessages[lang][code] ?? errorMessages[lang].DEFAULT;
  };

  return <LangContext.Provider value={{ lang, setLang, t, errorText }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
