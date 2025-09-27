import { useEffect, useMemo, useState } from 'react';
import type { Producto } from '../../../../domain/entities';
import { listProductos } from '../../../../infrastructure/api/ProductoApi';
import { listCategorias } from '../../../../infrastructure/api/CategoriaApi';
import { CartProvider, useCart } from '../hooks/useCart';
import ProductCard from '../components/ProductCard';
import CartPanel from '../components/CartPanel';
import { formatCurrency } from '../../../../utils/currency';

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
          if (categoria.id_categoria !== undefined) {
            map[categoria.id_categoria] = categoria.nombre;
          }
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

  const totalInventoryValue = useMemo(() => {
    return products.reduce((acc, product) => {
      const price = Number.isFinite(product.precio) ? Number(product.precio) : 0;
      const stock = typeof product.stock === 'number' && product.stock > 0 ? product.stock : 1;
      return acc + price * stock;
    }, 0);
  }, [products]);

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
    if (currentQuantity <= 1) {
      removeItem(productId);
      return;
    }
    updateQuantity(productId, currentQuantity - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf5ff] via-white to-[#fef2f2] py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 md:flex-row">
        <main className="flex-1 space-y-8">
          <section className="rounded-3xl bg-neutral-900 px-8 py-10 text-white shadow-2xl">
            <h1 className="text-2xl font-bold md:text-3xl">Explora y arma el carrito perfecto para tu cliente</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-200 md:text-base">
              Catálogo seguro pensado para equipos de ventas. Agrega productos, controla cantidades y construye una pre-orden lista para cerrar.
            </p>
            <div className="mt-6 grid gap-4 text-xs uppercase tracking-wide text-neutral-200 md:grid-cols-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-[0.65rem] text-neutral-300">Artículos disponibles</p>
                <p className="mt-1 text-xl font-semibold">{products.length}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-[0.65rem] text-neutral-300">Valor total inventario</p>
                <p className="mt-1 text-xl font-semibold">{formatCurrency(totalInventoryValue)}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-[0.65rem] text-neutral-300">Productos en carrito</p>
                <p className="mt-1 text-xl font-semibold">{summary.totalItems}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
              <div className="flex flex-wrap gap-2 md:justify-end">
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
                <button
                  type="button"
                  onClick={() => setShowCartOnMobile(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 md:hidden"
                >
                  🛒 Ver carrito ({summary.totalItems})
                </button>
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

        <div className="md:sticky md:top-10 md:h-[calc(100vh-5rem)] md:w-[26rem]">
          <div className="hidden md:block">
            <CartPanel
              items={items}
              summary={summary}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              onClear={clear}
              onCheckout={() => alert('Integración pendiente: envía el pedido al backend o genera la orden.')}
            />
          </div>

          <div
            className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-red-200/80 bg-white/95 p-4 shadow-2xl transition-transform duration-300 md:hidden ${
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
              onCheckout={() => alert('Integración pendiente: envía el pedido al backend o genera la orden.')}
              open={showCartOnMobile}
            />
          </div>
          {showCartOnMobile && (
            <div
              className="fixed inset-0 z-40 bg-neutral-900/50 md:hidden"
              role="presentation"
              onClick={() => setShowCartOnMobile(false)}
            />
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
        <div
          key={index}
          className="h-72 animate-pulse rounded-2xl border border-neutral-200 bg-white/70"
        />
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
