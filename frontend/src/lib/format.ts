import type { Lang } from './i18n';

export function formatDate(value: string | null | undefined, lang: Lang): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
