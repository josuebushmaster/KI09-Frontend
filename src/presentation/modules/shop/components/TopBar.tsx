import type { ReactNode } from 'react';
import { formatCurrency } from '../../../../utils/currency';

export type TopBarProps = {
  total: number;
  totalItems: number;
  onCartClick: () => void;
  onClearCart: () => void;
  actions?: ReactNode;
  customerName?: string;
  orderName?: string;
};

export function TopBar({
  total,
  totalItems,
  onCartClick,
  onClearCart,
  actions,
  customerName,
  orderName,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-red-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">🛍️</span>
            <span>Catálogo para clientes</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-neutral-900 md:text-2xl">
              {customerName ? `Hola ${customerName}, elige tus productos` : 'Selecciona tus productos favoritos'}
            </h1>
            <p className="text-sm text-neutral-500">
              {orderName ? orderName : 'Revisa la selección, ajusta cantidades y pasa al pago cuando estés listo.'}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-stretch gap-3 md:flex-none md:flex-row md:items-center">
          <div className="grid grid-cols-2 gap-3 md:flex md:flex-row md:items-center md:gap-6">
            <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white/60 px-4 py-3 text-sm text-neutral-700">
              <span className="text-xs uppercase tracking-wide text-neutral-400">Artículos</span>
              <span className="mt-1 text-lg font-semibold text-neutral-900">{totalItems}</span>
            </div>
            <div className="flex flex-col rounded-2xl border border-neutral-200 bg-white/60 px-4 py-3 text-sm text-neutral-700">
              <span className="text-xs uppercase tracking-wide text-neutral-400">Total estimado</span>
              <span className="mt-1 text-lg font-semibold text-neutral-900">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <button
              type="button"
              onClick={onCartClick}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/40 text-lg">🛒</span>
              <span>Ver carrito ({totalItems})</span>
            </button>
            <button
              type="button"
              onClick={onClearCart}
              disabled={totalItems === 0}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Limpiar
            </button>
            {actions}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
