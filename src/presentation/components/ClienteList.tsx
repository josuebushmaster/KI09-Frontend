import { useState, useEffect } from 'react';
import { listClientes } from '../../infrastructure/api/ClienteApi';
import type { Cliente } from '../../domain/entities';

const ClienteList = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await listClientes();
        setClientes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="p-4">Cargando clientes...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Clientes</h2>
      {clientes.length === 0 ? (
        <p>No hay clientes disponibles.</p>
      ) : (
        <div className="space-y-3">
          {clientes.map((c) => (
            <div key={c.id_cliente} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{c.nombre}</h3>
              <p className="text-gray-600 mt-1">{c.email ?? <span className="italic text-gray-400">Sin email</span>}</p>
              <div className="mt-4 flex space-x-2">
                <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Editar</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClienteList;