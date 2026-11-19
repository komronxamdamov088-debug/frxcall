import { LogOut, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { Button, LangSwitch } from './ui';
import NavTabs from './NavTabs';

export default function Layout({ children }: { children: ReactNode }) {
  const { t } = useLang();
  const { user, logout } = useAuth();
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Phone size={18} />
            </div>
            <span className="truncate font-bold">{t('appName')}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <LangSwitch />
            <span className="hidden max-w-40 truncate text-sm text-slate-600 sm:inline">{user?.name}</span>
            <Button variant="ghost" className="px-2.5" onClick={logout} title={t('logout')}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
        <NavTabs />
      </header>
      <main className="mx-auto max-w-6xl px-4 pt-4 pb-28 sm:py-6">{children}</main>
    </div>
  );
}
