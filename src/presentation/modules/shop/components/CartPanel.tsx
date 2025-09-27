import { formatCurrency, clampQuantity } from '../../../../utils/currency';
import type { CartItem } from '../hooks/useCart';

type CartPanelProps = {
  items: CartItem[];
  summary: {
    subtotal: number;
    estimatedTax: number;
    total: number;
    totalItems: number;
  };
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onClear: () => void;
  onCheckout?: () => void;
  onClose?: () => void;
  open?: boolean;
};

export function CartPanel({
  items,
  summary,
  onUpdateQuantity,
  onRemove,
  onClear,
  onCheckout,
  onClose,
  open = true,
}: CartPanelProps) {
  const isEmpty = items.length === 0;

  return (
    <aside
      className={`relative flex h-full w-full flex-col rounded-3xl border border-red-200/50 bg-white/90 p-6 shadow-xl transition-all dark:border-neutral-800 dark:bg-neutral-900/95 md:w-[24rem] ${open ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0 md:opacity-100'}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Carrito</h2>
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {summary.totalItems} artículo{summary.totalItems === 1 ? '' : 's'}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 shadow hover:bg-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
        {isEmpty ? (
          <EmptyState />
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.productId}
              item={item}
              onRemove={onRemove}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))
        )}
      </div>

      <div className="mt-6 space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4 text-sm dark:border-neutral-700 dark:bg-neutral-800/60">
        <div className="flex items-center justify-between">
          <span className="text-neutral-600 dark:text-neutral-300">Subtotal</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(summary.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-600 dark:text-neutral-300">Impuestos estimados (18%)</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{formatCurrency(summary.estimatedTax)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-neutral-200/70 pt-3 font-semibold text-neutral-900 dark:border-neutral-700 dark:text-neutral-50">
          <span>Total</span>
          <span className="text-lg">{formatCurrency(summary.total)}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onClear}
          disabled={isEmpty}
          className="h-11 flex-1 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Vaciar
        </button>
        <button
          type="button"
          onClick={onCheckout}
          disabled={isEmpty}
          className="h-11 flex-[2] rounded-xl bg-red-600 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          Finalizar compra
        </button>
      </div>
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300/80 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
      <span className="text-4xl">🛒</span>
      <p className="mt-2 font-medium">Tu carrito está vacío</p>
      <p className="text-xs text-neutral-400">Explora los productos y agrega tus favoritos.</p>
    </div>
  );
}

type CartItemRowProps = {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
};

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const max = typeof item.stock === 'number' && item.stock >= 0 ? item.stock : undefined;

  return (
    <article className="relative flex gap-3 rounded-2xl border border-neutral-200 bg-white/90 p-3 shadow-sm transition hover:border-red-200 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800/70">
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-neutral-100">
        <span className="text-3xl">📦</span>
      </div>
      <div className="flex-1 text-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">{item.name}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatCurrency(item.price)} c/u</p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="text-xs font-semibold uppercase text-red-500 transition hover:text-red-600"
          >
            Quitar
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400" htmlFor={`qty-${item.productId}`}>
              Cantidad
            </label>
            <input
              type="number"
              min={1}
              max={max ?? 99}
              inputMode="numeric"
              id={`qty-${item.productId}`}
              value={item.quantity}
              onChange={(event) => {
                const value = clampQuantity(Number(event.target.value || 0), { min: 1, max: max ?? 99 });
                onUpdateQuantity(item.productId, value);
              }}
              className="h-9 w-16 rounded-lg border border-neutral-300 bg-white px-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-400 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
          <div className="text-right text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(item.price * item.quantity)}
          </div>
        </div>
        {typeof item.stock === 'number' && item.stock >= 0 && (
          <p className="mt-2 text-[0.65rem] uppercase tracking-wide text-neutral-400">
            Stock disponible: {item.stock}
          </p>
        )}
      </div>
    </article>
  );
}

export default CartPanel;
