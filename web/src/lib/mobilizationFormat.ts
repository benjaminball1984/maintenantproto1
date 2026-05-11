/**
 * Helpers de formatage des dates pour les mobilisations. Conservé dans
 * `lib/` (et non dans les pages) pour respecter `react-refresh/only-export-components`
 * — un fichier de page ne doit exporter que des composants.
 */
const longDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatMobilizationDate(
  isoDate: string | null | undefined,
  variant: 'long' | 'short' = 'short',
): string {
  if (!isoDate) return '';
  const time = Date.parse(isoDate);
  if (Number.isNaN(time)) return '';
  const date = new Date(time);
  return variant === 'long' ? longDateFormatter.format(date) : shortDateFormatter.format(date);
}

export function formatMobilizationTime(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  const time = Date.parse(isoDate);
  if (Number.isNaN(time)) return '';
  return timeFormatter.format(new Date(time));
}
