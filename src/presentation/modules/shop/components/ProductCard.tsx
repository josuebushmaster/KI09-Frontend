import React, { useState } from 'react';
import type { Producto } from '../../../../domain/entities';
import { formatCurrency } from '../../../../utils/currency';
import placeholder from '../../../../assets/product-placeholder.svg';
import { useToast } from '../../../common/toastContext';
import QuickViewModal from './QuickViewModal';

const FALLBACK_IMAGE = placeholder;

type ProductCardProps = {
  product: Producto;
  inCartQuantity: number;
  onAdd: (product: Producto) => void;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
};

export function ProductCard({ product, inCartQuantity, onAdd, onIncrement, onDecrement }: ProductCardProps) {
  const { push } = useToast();
  const hasStock = typeof product.stock === 'number' ? product.stock > 0 : true;
  const imageSrc = product.imagen_url?.trim() || FALLBACK_IMAGE;
  const [quickOpen, setQuickOpen] = useState(false);
  const discountPercent = product.costo && product.costo > product.precio ? Math.round((1 - product.precio / product.costo) * 100) : 0;
  const rating = (product as unknown as { rating?: number }).rating as number | undefined;

  const renderStars = (r?: number) => {
    if (r === undefined || r === null) return null;
    const full = Math.floor(r);
    const stars: React.ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(<span key={i} className="text-amber-500">★</span>);
      } else {
        stars.push(<span key={i} className="text-neutral-300">★</span>);
      }
    }
    return (
      <div className="flex items-center gap-1 text-sm">
        {stars}
        <span className="ml-2 text-xs text-neutral-500">{r?.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <article className="group rounded-2xl border border-neutral-200/60 bg-white/95 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900/90">
        <div className="relative overflow-hidden rounded-t-2xl bg-neutral-100 dark:bg-neutral-800">
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          {product.stock && product.stock > 0 ? (
            <span className="rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white">Disponible</span>
          ) : (
            <span className="rounded-full bg-gray-300 px-3 py-1 text-xs font-semibold text-gray-700">Agotado</span>
          )}
          {discountPercent > 0 && (
            <span className="rounded-full bg-red-600/95 px-3 py-1 text-xs font-semibold text-white">-{discountPercent}%</span>
          )}
        </div>
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
          className="h-52 w-full object-contain transition duration-500 group-hover:scale-105 bg-white"
        />
        <button
          type="button"
          onClick={() => setQuickOpen(true)}
          className="absolute right-3 bottom-3 rounded-full bg-white/90 px-3 py-2 text-xs font-medium shadow-md hover:bg-white"
          aria-label="Vista rápida"
        >
          Quick view
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <header>
          <h3 className="line-clamp-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">{product.nombre_producto}</h3>
          {renderStars(rating)}
          {product.descripcion && (
            <p className="mt-1 line-clamp-3 text-sm text-neutral-600 dark:text-neutral-300">{product.descripcion}</p>
          )}
        </header>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(product.precio)}</span>
          {/* stock hidden in product card for client view */}
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
        <QuickViewModal product={product} open={quickOpen} onClose={() => setQuickOpen(false)} onAdd={(p) => { onAdd(p); setQuickOpen(false); }} />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onAdd(product);
                if (typeof push === 'function') push({ title: 'Añadido', description: `${product.nombre_producto} agregado al carrito` });
              }}
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
