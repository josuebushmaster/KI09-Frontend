import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ClienteForm, { type ClienteFormValues } from '../components/ClienteForm';
import * as service from '../services/clientesService';
import type { Cliente } from '../../../../domain/entities';
import { useStatus } from '../../../core';

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

  if (loading) return <div className="p-6">Cargando cliente...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!cliente) return <div className="p-6 text-gray-600">No se encontró el cliente.</div>;

  return (
    <div className="p-6 lg:p-10">
      <ClienteForm initial={cliente} onSubmit={handleSubmit} submitLabel="Guardar cambios" />
    </div>
  );
}
