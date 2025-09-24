import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientes } from '../hooks/useClientes';

const ClienteList = () => {
  const { items: clientes, loading, error, load, remove } = useClientes();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="p-4">Cargando clientes...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Lista de Clientes</h2>
        <button onClick={() => navigate('/clientes')} className="text-sm text-blue-600 hover:underline">Ver todos</button>
      </div>
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
                <button
                  onClick={async () => {
                    if (!confirm('¿Eliminar este cliente?')) return;
                    try {
                      await remove(c.id_cliente);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : 'Error al eliminar');
                    }
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClienteList;
