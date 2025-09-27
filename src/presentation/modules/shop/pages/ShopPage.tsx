import { useEffect, useMemo, useRef, useState } from 'react';
import type { Producto } from '../../../../domain/entities';
import { listProductos } from '../../../../infrastructure/api/ProductoApi';
import { listCategorias } from '../../../../infrastructure/api/CategoriaApi';
import { CartProvider, useCart } from '../hooks/useCart';
import ProductCard from '../components/ProductCard';
import CartPanel from '../components/CartPanel';
import { formatCurrency } from '../../../../utils/currency';

import TopBar from '../components/TopBar';

type CategoriaMap = Record<number, string>;

type Status = 'idle' | 'loading' | 'success' | 'error';

function ShopPageInner() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [categoryMap, setCategoryMap] = useState<CategoriaMap>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [showCartOnMobile, setShowCartOnMobile] = useState(false);
  const [showCartDesktop, setShowCartDesktop] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const cartPanelRef = useRef<HTMLDivElement>(null);

  const { items, addItem, updateQuantity, removeItem, clear, summary, getItemQuantity } = useCart();

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setStatus('loading');
    setError(null);

    async function fetchResources() {
      try {
        const [productList, categorias] = await Promise.all([
          listProductos(controller.signal),
          listCategorias(),
        ]);
        if (!active) return;
        setProducts(productList);
        const map: CategoriaMap = {};
        categorias.forEach((categoria) => {
          if (categoria.id_categoria !== undefined) map[categoria.id_categoria] = categoria.nombre;
        });
        setCategoryMap(map);
        setStatus('success');
      } catch (err) {
        if (!active || controller.signal.aborted) return;
        console.error('ShopPage: error al cargar recursos', err);
        setError('No se pudo cargar el catálogo. Intenta nuevamente.');
        setStatus('error');
      }
    }

    fetchResources();
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      if (onlyAvailable) {
        if (typeof product.stock === 'number' && product.stock <= 0) return false;
      }
      if (categoryFilter !== 'all' && product.id_categoria !== categoryFilter) return false;
      if (term.length > 0) {
        const haystack = `${product.nombre_producto} ${product.descripcion ?? ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [products, categoryFilter, onlyAvailable, searchTerm]);

  const handleCartAccess = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setShowCartOnMobile(true);
      return;
    }
    setShowCartDesktop((s) => !s);
  };

  const handleAddProduct = (product: Producto) => {
    const availableStock = typeof product.stock === 'number' ? product.stock : undefined;
    if (availableStock !== undefined && availableStock <= 0) return;
    addItem(product, 1);
    setShowCartOnMobile(true);
  };

  const handleIncrement = (productId: number) => {
    const product = products.find((p) => p.id_producto === productId);
    if (!product) return;
    addItem(product, 1);
  };

  const handleDecrement = (productId: number) => {
    const currentQuantity = items.find((item) => item.productId === productId)?.quantity ?? 0;
    if (currentQuantity <= 1) return removeItem(productId);
    updateQuantity(productId, currentQuantity - 1);
  };

  const handleCheckoutOpen = () => setShowCheckoutModal(true);
  const handleCheckoutConfirm = () => {
    clear();
    setShowCheckoutModal(false);
    setShowCartDesktop(false);
    setShowCartOnMobile(false);
    setOrderConfirmed(true);
    setTimeout(() => setOrderConfirmed(false), 3500);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar
        total={summary.total}
        totalItems={summary.totalItems}
        onCartClick={handleCartAccess}
        onClearCart={clear}
        customerName="Cliente"
        actions={(
          <a
            href="mailto:soporte@ki09.com"
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            Contactar soporte
          </a>
        )}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 md:flex-row">
        <main className="flex-1 space-y-8">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-neutral-500">
                <span>Productos disponibles</span>
                <span role="img" aria-label="Productos">🧺</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-neutral-900">{filteredProducts.length}</p>
              <p className="text-xs text-neutral-400">Resultados visibles según tus filtros.</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-neutral-500">
                <span>Categorías</span>
                <span role="img" aria-label="Categorías">🏷️</span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-neutral-900">{Object.keys(categoryMap).length}</p>
              <p className="text-xs text-neutral-400">Explora diferentes familias de productos.</p>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-md backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Catálogo de productos</h2>
                <p className="text-sm text-neutral-500">Encuentra artículos por nombre, categoría o disponibilidad.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                  <span className="text-neutral-400">🔍</span>
                  <input
                    type="search"
                    placeholder="Buscar por nombre o descripción"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCartAccess}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 md:hidden"
                >
                  🛒 Ver carrito ({summary.totalItems})
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <select
                  value={categoryFilter}
                  onChange={(event) => {
                    const value = event.target.value;
                    setCategoryFilter(value === 'all' ? 'all' : Number(value));
                  }}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label="Filtrar por categoría"
                >
                  <option value="all">Todas las categorías</option>
                  {Object.entries(categoryMap).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 shadow-sm">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(event) => setOnlyAvailable(event.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                  />
                  Solo disponibles
                </label>
              </div>
            </div>

            <div className="mt-6">
              {status === 'loading' && <ProductSkeletonGrid />}
              {status === 'error' && (
                <ErrorState message={error ?? 'Ocurrió un error inesperado'} onRetry={() => window.location.reload()} />
              )}
              {status === 'success' && filteredProducts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-neutral-300/70 bg-white/70 p-12 text-center text-neutral-500">
                  <p className="text-lg font-semibold">No encontramos coincidencias</p>
                  <p className="mt-2 text-sm">Prueba ajustar los filtros o buscar con otras palabras clave.</p>
                </div>
              )}
              {status === 'success' && filteredProducts.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id_producto}
                      product={product}
                      inCartQuantity={getItemQuantity(product.id_producto)}
                      onAdd={handleAddProduct}
                      onIncrement={handleIncrement}
                      onDecrement={handleDecrement}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <div ref={cartPanelRef} className="md:sticky md:top-24 md:h-[calc(100vh-6rem)]">
          <div className="hidden md:block">
            {showCartDesktop ? (
              <div className="md:w-72">
                <CartPanel
                  items={items}
                  summary={summary}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                  onClear={clear}
                  onCheckout={handleCheckoutOpen}
                  onClose={() => setShowCartDesktop(false)}
                  showCheckout
                />
              </div>
            ) : null}
          </div>

          <div
            className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col border-l border-neutral-200 bg-white/95 p-4 shadow-2xl transition-transform duration-300 md:hidden ${
              showCartOnMobile ? 'translate-x-0' : 'translate-x-full'
            }`}
            role="dialog"
            aria-modal="true"
          >
            <CartPanel
              items={items}
              summary={summary}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              onClear={clear}
              onClose={() => setShowCartOnMobile(false)}
              onCheckout={handleCheckoutOpen}
              open={showCartOnMobile}
              showCheckout
            />
          </div>

          {showCartOnMobile && (
            <div
              className="fixed inset-0 z-40 bg-neutral-900/50 md:hidden"
              role="presentation"
              onClick={() => setShowCartOnMobile(false)}
            />
          )}

          {showCheckoutModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center">
              <div className="fixed inset-0 bg-black/40" onClick={() => setShowCheckoutModal(false)} />
              <div className="z-70 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-neutral-900">Confirmar pedido</h3>
                <p className="mt-3 text-sm text-neutral-600">Vas a confirmar un pedido por {summary.totalItems} artículo{summary.totalItems === 1 ? '' : 's'}.</p>
                <div className="mt-4 text-sm text-neutral-700">Total estimado: <span className="font-semibold">{formatCurrency(summary.total)}</span></div>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setShowCheckoutModal(false)} className="rounded-xl border border-neutral-200 px-4 py-2">Cancelar</button>
                  <button onClick={handleCheckoutConfirm} className="rounded-xl bg-red-600 px-4 py-2 text-white">Confirmar</button>
                </div>
              </div>
            </div>
          )}

          {orderConfirmed && (
            <div className="fixed right-6 bottom-6 z-70 rounded-lg bg-emerald-600 px-4 py-3 text-white shadow-lg">
              Pedido confirmado ✔️
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-2xl border border-neutral-200 bg-white/70" />
      ))}
    </div>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50/70 p-10 text-center text-red-700">
      <p className="text-base font-semibold">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Reintentar
      </button>
    </div>
  );
}

export default function ShopPage() {
  return (
    <CartProvider>
      <ShopPageInner />
    </CartProvider>
  );
}
 
