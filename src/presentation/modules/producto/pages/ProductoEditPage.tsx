import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProductoForm, { type ProductoFormValues } from '../components/ProductoForm';
import * as service from '../services/productosService';
import { useStatus } from '../../../core';
import FormPageLayout from '../../shared/FormPageLayout';
import type { Producto } from '../../../../domain/entities';

export default function ProductoEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { show } = useStatus();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id || isNaN(Number(id))) {
        setError('ID de producto inválido');
        setLoading(false);
        return;
      }

      try {
        const data = await service.getProducto(Number(id));
        setProducto(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar producto');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleSubmit = async (payload: ProductoFormValues) => {
    if (!producto?.id_producto) return;
    await service.updateProducto(producto.id_producto, payload);
    show({ title: 'Producto actualizado', message: 'Los cambios se guardaron correctamente.', variant: 'success' });
    navigate('/productos');
  };

  if (loading) {
    return (
      <FormPageLayout
        title="Editar Producto"
        subtitle="Cargando información del producto..."
        backTo="/productos"
      >
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </FormPageLayout>
    );
  }

  if (error || !producto) {
    return (
      <FormPageLayout
        title="Error"
        subtitle={error || 'Producto no encontrado'}
        backTo="/productos"
      >
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se pudo cargar el producto</h3>
          <p className="text-gray-600">{error || 'El producto solicitado no existe.'}</p>
        </div>
      </FormPageLayout>
    );
  }

  return (
    <FormPageLayout
      title={`Editar Producto: ${producto.nombre_producto}`}
      subtitle="Modifica los datos del producto y guarda los cambios."
      backTo="/productos"
    >
      <ProductoForm
        initial={producto}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />
    </FormPageLayout>
  );
}