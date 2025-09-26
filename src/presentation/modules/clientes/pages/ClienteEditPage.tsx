import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ClienteForm, { type ClienteFormValues } from '../components/ClienteForm';
import * as service from '../services/clientesService';
import type { Cliente } from '../../../../domain/entities';
import { useStatus } from '../../../core';
import FormPageLayout from '../../shared/FormPageLayout';

export default function ClienteEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { show } = useStatus();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const num = Number(id);
    if (!Number.isFinite(num)) {
      setError('ID inválido');
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await service.getCliente(num);
        setCliente(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (payload: ClienteFormValues) => {
    if (!cliente) return;
    await service.updateCliente(cliente.id_cliente, payload);
    show({ title: 'Cliente actualizado', message: 'Los datos se guardaron correctamente.', variant: 'success' });
    navigate('/clientes');
  };

  if (loading) {
    return (
      <FormPageLayout
        title="Editar Cliente"
        subtitle="Cargando información del cliente..."
        backTo="/clientes"
      >
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="text-sm text-gray-500">Cargando cliente...</p>
          </div>
        </div>
      </FormPageLayout>
    );
  }
  
  if (error || !cliente) {
    return (
      <FormPageLayout
        title="Error"
        subtitle={error || "Cliente no encontrado"}
        backTo="/clientes"
      >
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se pudo cargar el cliente</h3>
          <p className="text-gray-600">{error || "El cliente solicitado no existe."}</p>
        </div>
      </FormPageLayout>
    );
  }

  return (
    <FormPageLayout
      title="Editar Cliente"
      subtitle="Modifica los datos del cliente y confirma para guardar."
      backTo="/clientes"
    >
      <ClienteForm initial={cliente} onSubmit={handleSubmit} submitLabel="Guardar cambios" />
    </FormPageLayout>
  );
}
