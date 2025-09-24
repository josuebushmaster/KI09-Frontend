import { useState } from 'react';
import type { Categoria } from '../../../../domain/entities';

type Props = {
  initial?: Partial<Categoria>;
  onSubmit: (payload: Partial<Categoria>) => Promise<void> | void;
  submitLabel?: string;
};

export default function CategoriaForm({ initial = {}, onSubmit, submitLabel = 'Guardar' }: Props) {
  const [nombre, setNombre] = useState(String(initial.nombre ?? ''));
  const [descripcion, setDescripcion] = useState(String(initial.descripcion ?? ''));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit({ nombre: nombre.trim(), descripcion: descripcion.trim() || null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-xl">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          aria-label="Nombre de la categoría"
          placeholder="Nombre de la categoría"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          aria-label="Descripción de la categoría"
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
        />
      </div>

      {error && <div className="text-sm text-red-500 mb-2">{error}</div>}

      <div className="flex items-center space-x-2">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
          disabled={saving}
        >
          {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

