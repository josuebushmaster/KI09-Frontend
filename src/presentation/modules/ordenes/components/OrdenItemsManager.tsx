import { useEffect, useMemo, useState } from 'react';
import type { OrdenProducto } from '../../../../domain/entities';
import { useOrdenItems } from '../hooks/useOrdenItems';
import { useProductos } from '../../producto/hooks/useProductos';

interface Props {
  id_orden?: number;
  onChangeTotal?: (total: number) => void;
  onItemsChange?: (items: OrdenProducto[]) => void;
}

const OrdenItemsManager = ({ id_orden, onChangeTotal, onItemsChange }: Props) => {
  const { items, loadByOrden, create, update, remove } = useOrdenItems();
  const { items: productos, load: loadProductos } = useProductos();
  const [local, setLocal] = useState<OrdenProducto[]>([]);
  const [adding, setAdding] = useState(false);
  const [newProdId, setNewProdId] = useState<number>(0);
  const [newQty, setNewQty] = useState<number>(1);

  useEffect(() => { loadProductos(); }, [loadProductos]);

  useEffect(() => {
    if (id_orden) {
      loadByOrden(id_orden).then(res => setLocal(res)).catch(() => {});
    }
  }, [id_orden, loadByOrden]);

  useEffect(() => {
    setLocal(items);
  }, [items]);

  const total = useMemo(() => local.reduce((s, it) => s + (it.precio_unitario || 0) * it.cantidad, 0), [local]);

  useEffect(() => { if (onChangeTotal) onChangeTotal(Number(total.toFixed(2))); }, [total, onChangeTotal]);

  useEffect(() => {
    if (onItemsChange) onItemsChange(local);
  }, [local, onItemsChange]);

  const doAdd = async () => {
    if (!newProdId || newQty <= 0) return;
    setAdding(true);
    try {
      const prod = productos.find(p => p.id_producto === newProdId);
      const payload: Partial<OrdenProducto> = {
        id_orden: id_orden ?? 0,
        id_producto: newProdId,
        cantidad: newQty,
        // El precio se toma del producto; no permitimos editar desde aquí
        precio_unitario: prod?.precio ?? 0,
      };
      if (id_orden) {
        await create(payload);
      } else {
        // temporal en memoria si orden no existe aún
        const temp: OrdenProducto = {
          id_ordenProd: Date.now(),
          id_orden: id_orden ?? 0,
          id_producto: newProdId,
          cantidad: newQty,
          precio_unitario: payload.precio_unitario,
        };
        setLocal(prev => [...prev, temp]);
      }
  setNewProdId(0); setNewQty(1);
    } finally { setAdding(false); }
  };

  const doUpdateQty = async (item: OrdenProducto, qty: number) => {
    if (qty <= 0) return;
    if (item.id_ordenProd && id_orden) {
      await update(item.id_ordenProd, { cantidad: qty });
    } else {
      setLocal(prev => prev.map(p => p.id_ordenProd === item.id_ordenProd ? { ...p, cantidad: qty } : p));
    }
  };

  const doRemove = async (item: OrdenProducto) => {
    if (item.id_ordenProd && id_orden) {
      await remove(item.id_ordenProd);
    } else {
      setLocal(prev => prev.filter(p => p.id_ordenProd !== item.id_ordenProd));
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Ítems de la orden</h3>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <div>
            <label htmlFor="new-product" className="text-xs text-gray-600">Producto</label>
            <select id="new-product" title="Seleccionar producto" className="w-full rounded border px-2 py-1" value={newProdId} onChange={e => setNewProdId(Number(e.target.value))}>
              <option value={0}>Seleccionar producto</option>
              {productos.map(p => (<option key={p.id_producto} value={p.id_producto}>{p.nombre_producto ?? `#${p.id_producto}`} - ${Number(p.precio ?? 0).toFixed(2)}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600">Cantidad</label>
            <input aria-label="cantidad" title="Cantidad" type="number" min={1} placeholder="1" className="w-full rounded border px-2 py-1" value={newQty} onChange={e => setNewQty(parseInt(e.target.value || '1'))} />
          </div>
          {/* El precio se toma automáticamente del producto seleccionado */}
          <div>
            <button type="button" onClick={doAdd} disabled={adding} className="w-full bg-red-600 text-white rounded px-3 py-1">Agregar</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 uppercase text-xs">
                <th className="px-2 py-2">Producto</th>
                <th className="px-2 py-2">Precio</th>
                <th className="px-2 py-2">Cantidad</th>
                <th className="px-2 py-2">Subtotal</th>
                <th className="px-2 py-2" /></tr>
            </thead>
            <tbody>
              {local.map(it => (
                <tr key={it.id_ordenProd} className="border-t">
                  <td className="px-2 py-2">{productos.find(p => p.id_producto === it.id_producto)?.nombre_producto ?? `#${it.id_producto}`}</td>
                  <td className="px-2 py-2">${(it.precio_unitario ?? 0).toFixed(2)}</td>
                  <td className="px-2 py-2">
                    <input aria-label={`cantidad-${it.id_ordenProd}`} title="Cantidad" type="number" min={1} value={it.cantidad} onChange={e => doUpdateQty(it, parseInt(e.target.value || '1'))} className="w-20 rounded border px-2 py-1" />
                  </td>
                  <td className="px-2 py-2">${((it.precio_unitario ?? 0) * it.cantidad).toFixed(2)}</td>
                  <td className="px-2 py-2 text-right"><button onClick={() => doRemove(it)} className="text-red-600">Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-600">Total ítems: <span className="font-semibold text-gray-900">${total.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
};

export default OrdenItemsManager;
