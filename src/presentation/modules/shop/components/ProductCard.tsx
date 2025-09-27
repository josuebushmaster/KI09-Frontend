import type { Producto } from '../../../../domain/entities';
import { formatCurrency } from '../../../../utils/currency';
import placeholder from '../../../../assets/product-placeholder.svg';

const FALLBACK_IMAGE = placeholder;

type ProductCardProps = {
  product: Producto;
  inCartQuantity: number;
  onAdd: (product: Producto) => void;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
};

export function ProductCard({ product, inCartQuantity, onAdd, onIncrement, onDecrement }: ProductCardProps) {
  const hasStock = typeof product.stock === 'number' ? product.stock > 0 : true;
  const limitedStock = typeof product.stock === 'number' && product.stock <= 5 && product.stock > 0;
  const imageSrc = product.imagen_url?.trim() || FALLBACK_IMAGE;

  return (
    <article className="group rounded-2xl border border-neutral-200/60 bg-white/95 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900/90">
      <div className="relative overflow-hidden rounded-t-2xl bg-neutral-100 dark:bg-neutral-800">
        <img
          src={imageSrc}
          alt={`Imagen de ${product.nombre_producto}`}
          loading="lazy"
          onError={(event) => {
            const target = event.currentTarget;
            if (target.dataset.fallbackApplied === 'true') return;
            target.dataset.fallbackApplied = 'true';
            target.src = FALLBACK_IMAGE;
          }}
          className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {limitedStock && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">
            ¡Últimas {product.stock}!
          </span>
        )}
        {!hasStock && (
          <span className="absolute left-3 top-3 rounded-full bg-neutral-800/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Sin stock
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <header>
          <h3 className="line-clamp-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">{product.nombre_producto}</h3>
          {product.descripcion && (
            <p className="mt-1 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-300">{product.descripcion}</p>
          )}
        </header>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(product.precio)}</span>
          {typeof product.stock === 'number' && (
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Stock: {Math.max(product.stock, 0)}</span>
          )}
        </div>

        <div className="mt-auto">
          {inCartQuantity > 0 ? (
            <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/60 p-2 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-900/40 dark:text-red-200">
              <button
                type="button"
                onClick={() => onDecrement(product.id_producto)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-red-600/30 bg-white text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                aria-label="Disminuir cantidad"
              >
                -
              </button>
              <div className="flex flex-col items-center">
                <span className="text-base font-semibold">{inCartQuantity}</span>
                <span className="text-[0.65rem] uppercase tracking-wide">En carrito</span>
              </div>
              <button
                type="button"
                onClick={() => onIncrement(product.id_producto)}
                disabled={!hasStock}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-red-600/30 bg-white text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Incrementar cantidad"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAdd(product)}
              disabled={!hasStock}
              className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-400/70"
            >
              Agregar al carrito
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
