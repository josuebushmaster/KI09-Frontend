import type { Producto } from '../../../../domain/entities/Producto';
import placeholder from '../../../../assets/product-placeholder.svg';

type Props = {
  product: Producto | null;
  open: boolean;
  onClose: () => void;
  onAdd: (product: Producto) => void;
};

export function QuickViewModal({ product, open, onClose, onAdd }: Props) {
  if (!open || !product) return null;

  const image = product.imagen_url?.trim() || placeholder;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex gap-6">
          <div className="w-1/2 flex items-center justify-center">
            <img src={image} alt={product.nombre_producto} className="max-h-80 w-full object-contain" />
          </div>
          <div className="w-1/2 flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-semibold">{product.nombre_producto}</h3>
              <div className="mt-2 text-lg font-bold text-red-600">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(product.precio)}</div>
            </div>
            {product.descripcion && <p className="text-sm text-neutral-600">{product.descripcion}</p>}
            <div className="mt-auto flex items-center gap-3">
              <button
                onClick={() => onAdd(product)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Agregar al carrito
              </button>
              <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
