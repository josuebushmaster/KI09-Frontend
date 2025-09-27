const defaultCurrency = (import.meta.env?.VITE_APP_CURRENCY || 'USD') as string;

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string, locale: string): Intl.NumberFormat {
  const key = `${locale}:${currency}`;
  const existing = formatterCache.get(key);
  if (existing) return existing;
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    maximumFractionDigits: 2,
  });
  formatterCache.set(key, formatter);
  return formatter;
}

export function formatCurrency(value: number, options?: { currency?: string; locale?: string }): string {
  const locale = options?.locale ?? 'es-PE';
  const currency = options?.currency ?? defaultCurrency;
  if (!Number.isFinite(value)) return getFormatter(currency, locale).format(0);
  return getFormatter(currency, locale).format(value);
}

export function clampQuantity(raw: number, opts?: { min?: number; max?: number }): number {
  if (!Number.isFinite(raw)) return opts?.min ?? 1;
  const min = opts?.min ?? 1;
  const max = opts?.max ?? Number.POSITIVE_INFINITY;
  const sanitized = Math.floor(raw);
  return Math.min(Math.max(sanitized, min), max);
}
