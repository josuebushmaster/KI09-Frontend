import { useNavigate } from 'react-router-dom';
import ClienteForm, { type ClienteFormValues } from '../components/ClienteForm';
import * as service from '../services/clientesService';
import { useStatus } from '../../../core';

export default function ClienteCreatePage() {
  const navigate = useNavigate();
  const { show } = useStatus();

  const handleSubmit = async (payload: ClienteFormValues) => {
    await service.createCliente(payload);
    show({ title: 'Cliente creado', message: 'El cliente se creó correctamente.', variant: 'success' });
    navigate('/clientes');
  };

  return (
    <div className="p-6 lg:p-10">
      <ClienteForm onSubmit={handleSubmit} submitLabel="Crear" />
    </div>
  );
}
