import { BarChart3, FileText, PhoneCall, Users, UtensilsCrossed } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLang } from '../context/LangContext';

const ITEMS = [
  { to: '/', key: 'navClients', icon: Users, end: true },
  { to: '/calls', key: 'navCalls', icon: PhoneCall, end: false },
  { to: '/scripts', key: 'navScripts', icon: FileText, end: false },
  { to: '/stats', key: 'navStats', icon: BarChart3, end: false },
  { to: '/restaurants', key: 'navRestaurants', icon: UtensilsCrossed, end: false },
] as const;

export default function NavTabs() {
  const { t } = useLang();
  return (
    <nav className="no-scrollbar mx-auto flex max-w-6xl overflow-x-auto px-4">
      {ITEMS.map(({ to, key, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              isActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`
          }
        >
          <Icon size={16} />
          {t(key)}
        </NavLink>
      ))}
    </nav>
  );
}
