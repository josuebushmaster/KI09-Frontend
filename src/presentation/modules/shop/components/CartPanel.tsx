import { formatCurrency, clampQuantity } from '../../../../utils/currency';
import type { CartItem } from '../hooks/useCart';
import { useToast } from '../../../common/toastContext';

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
  showCheckout?: boolean;
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
  showCheckout = true,
}: CartPanelProps) {
  const isEmpty = items.length === 0;
  const { push } = useToast();

  return (
    <aside
      className={`relative flex h-full w-full flex-col rounded-3xl border border-neutral-200/70 bg-white/95 p-6 shadow-xl transition-all md:w-72 ${open ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0 md:opacity-100'}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Tu carrito</h2>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            {summary.totalItems} artículo{summary.totalItems === 1 ? '' : 's'}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-neutral-700 shadow hover:bg-neutral-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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
              onRemoveWithToast={(productId, prevQty) => {
                onRemove(productId);
                if (typeof push === 'function') {
                  push({
                    title: 'Elemento removido',
                    description: `${item.name ?? `Producto #${item.productId}`} eliminado`,
                    action: {
                      label: 'Deshacer',
                      onClick: () => onUpdateQuantity(productId, prevQty),
                    },
                  });
                }
              }}
            />
          ))
        )}
      </div>

      <div className="mt-6 space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-neutral-600">Subtotal</span>
          <span className="font-semibold text-neutral-900">{formatCurrency(summary.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-600">Impuestos estimados (18%)</span>
          <span className="font-semibold text-neutral-900">{formatCurrency(summary.estimatedTax)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-neutral-200/70 pt-3 font-semibold text-neutral-900">
          <span>Total</span>
          <span className="text-lg">{formatCurrency(summary.total)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 md:flex-row md:gap-2">
        <button
          type="button"
          onClick={() => {
            onClear();
            if (typeof push === 'function') push({ title: 'Carrito vaciado', description: 'Se han eliminado los artículos del carrito' });
          }}
          disabled={isEmpty}
          className="h-11 flex-1 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Vaciar carrito
        </button>
        {showCheckout && (
          <button
            type="button"
            onClick={() => {
              if (onCheckout) onCheckout();
              if (typeof push === 'function') push({ title: 'Pedido', description: 'Abriendo flujo de pago...' });
            }}
            disabled={isEmpty}
            className="h-11 flex-[1.5] rounded-xl bg-red-600 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-400"
          >
            Finalizar pedido
          </button>
        )}
      </div>
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300/80 bg-white/80 p-6 text-center text-sm text-neutral-500">
      <span className="text-4xl">🛒</span>
      <p className="mt-2 font-medium">Tu carrito está vacío</p>
      <p className="text-xs text-neutral-400">Agrega productos y aparecerán aquí.</p>
    </div>
  );
}

type CartItemRowProps = {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onRemoveWithToast?: (productId: number, prevQty: number) => void;
};

function CartItemRow({ item, onUpdateQuantity, onRemove, onRemoveWithToast }: CartItemRowProps) {
  const max = typeof item.stock === 'number' && item.stock >= 0 ? item.stock : undefined;

  return (
    <article className="relative flex gap-3 rounded-2xl border border-neutral-200 bg-white/90 p-3 shadow-sm transition hover:border-red-200/80 hover:shadow-md">
      <div className="flex-1 text-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">{item.name ?? `Producto #${item.productId}`}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{formatCurrency(item.price)} c/u</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const prevQty = item.quantity;
              if (onRemoveWithToast) onRemoveWithToast(item.productId, prevQty);
              else onRemove(item.productId);
            }}
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
              className="h-9 w-16 rounded-lg border border-neutral-300 bg-white px-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div className="text-right text-sm font-semibold text-neutral-900">
            {formatCurrency(item.price * item.quantity)}
          </div>
        </div>
        {/* stock hidden in cart rows for client view */}
      </div>
    </article>
  );
}

export default CartPanel;
