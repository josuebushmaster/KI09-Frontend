import { useNavigate } from 'react-router-dom';
import ProductoForm, { type ProductoFormValues } from '../components/ProductoForm';
import * as service from '../services/productosService';
import { useStatus } from '../../../core';
import FormPageLayout from '../../shared/FormPageLayout';

export default function ProductoCreatePage() {
  const navigate = useNavigate();
  const { show } = useStatus();

  const handleSubmit = async (payload: ProductoFormValues) => {
    await service.createProducto(payload);
    show({ title: 'Producto creado', message: 'El producto se creó correctamente.', variant: 'success' });
    navigate('/productos');
  };

  return (
    <FormPageLayout
      title="Crear Producto"
      subtitle="Registra un nuevo producto completando la información requerida."
      backTo="/productos"
    >
      <ProductoForm onSubmit={handleSubmit} submitLabel="Crear" />
    </FormPageLayout>
  );
}