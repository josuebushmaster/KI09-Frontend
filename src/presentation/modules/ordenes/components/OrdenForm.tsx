import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrdenes } from '../hooks/useOrdenes';
import { getOrden } from '../services/ordenesService';
import { useClientes } from '../../clientes';
import type { Orden } from '../../../../domain/entities/Orden';
import { useStatus } from '../../../core';

interface OrdenFormData {
  id_cliente: number;
  estado_orden: string;
  direccion_envio: string;
  ciudad_envio: string;
  codigo_postal_envio: string;
  pais_envio: string;
  metodo_envio: string;
  costo_envio: number;
  estado_envio: string;
  total_orden: number;
}

const OrdenForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { items: ordenes, loading: loadingOrdenes, create, update } = useOrdenes();
  const { items: clientes, loading: loadingClientes, load: loadClientes } = useClientes();
  const [loading, setLoading] = useState(false);
  const { show } = useStatus();

  const [formData, setFormData] = useState<OrdenFormData>({
    id_cliente: 0,
    estado_orden: 'Pendiente',
    direccion_envio: '',
    ciudad_envio: '',
    codigo_postal_envio: '',
    pais_envio: 'México',
    metodo_envio: 'Standard',
    costo_envio: 0,
    estado_envio: 'Preparando',
    total_orden: 0
  });

  const [errors, setErrors] = useState<Partial<OrdenFormData>>({});

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  useEffect(() => {
    let cancelled = false;
    async function ensureOrden() {
      if (!(isEdit && id)) return;
      const existing = ordenes.find(c => c.id_orden === Number(id));
      if (existing) {
        if (!cancelled) {
          setFormData({
            id_cliente: existing.id_cliente || 0,
            estado_orden: existing.estado_orden || 'Pendiente',
            direccion_envio: existing.direccion_envio || '',
            ciudad_envio: existing.ciudad_envio || '',
            codigo_postal_envio: existing.codigo_postal_envio || '',
            pais_envio: existing.pais_envio || 'México',
            metodo_envio: existing.metodo_envio || 'Standard',
            costo_envio: existing.costo_envio || 0,
            estado_envio: existing.estado_envio || 'Preparando',
            total_orden: existing.total_orden || 0
          });
        }
        return;
      }
      try {
        setLoading(true);
        const fetched = await getOrden(Number(id));
        if (!cancelled) {
          setFormData({
            id_cliente: fetched.id_cliente || 0,
            estado_orden: fetched.estado_orden || 'Pendiente',
            direccion_envio: fetched.direccion_envio || '',
            ciudad_envio: fetched.ciudad_envio || '',
            codigo_postal_envio: fetched.codigo_postal_envio || '',
            pais_envio: fetched.pais_envio || 'México',
            metodo_envio: fetched.metodo_envio || 'Standard',
            costo_envio: fetched.costo_envio || 0,
            estado_envio: fetched.estado_envio || 'Preparando',
            total_orden: fetched.total_orden || 0,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo cargar la orden';
        show({ title: 'Error al cargar', message, detail: err, variant: 'error' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    ensureOrden();
    return () => { cancelled = true; };
  }, [id, isEdit, ordenes, show]);

  const validateForm = (): boolean => {
    const newErrors: Partial<OrdenFormData> = {};

    if (!formData.id_cliente || formData.id_cliente === 0) {
      newErrors.id_cliente = 0; // Usar 0 como indicador de error
    }

    if (!formData.direccion_envio.trim()) {
      newErrors.direccion_envio = 'La dirección de envío es obligatoria';
    }

    if (!formData.ciudad_envio.trim()) {
      newErrors.ciudad_envio = 'La ciudad de envío es obligatoria';
    }

    if (!formData.codigo_postal_envio.trim()) {
      newErrors.codigo_postal_envio = 'El código postal es obligatorio';
    }

    if (formData.total_orden <= 0) {
      newErrors.total_orden = 0; // Usar 0 como indicador de error para números
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Para updates no sobreescribimos fecha_orden; solo se envía al crear
      const baseData: Omit<Orden, 'id_orden' | 'created_at' | 'updated_at'> = {
        id_cliente: formData.id_cliente,
        estado_orden: formData.estado_orden,
        direccion_envio: formData.direccion_envio,
        ciudad_envio: formData.ciudad_envio,
        codigo_postal_envio: formData.codigo_postal_envio,
        pais_envio: formData.pais_envio,
        metodo_envio: formData.metodo_envio,
        costo_envio: formData.costo_envio,
        estado_envio: formData.estado_envio,
        total_orden: formData.total_orden,
        fecha_orden: '' as unknown as string, // placeholder, se ajusta abajo
      };

      if (isEdit && id) {
        const updatePayload = {
          id_cliente: baseData.id_cliente,
          estado_orden: baseData.estado_orden,
          direccion_envio: baseData.direccion_envio,
          ciudad_envio: baseData.ciudad_envio,
          codigo_postal_envio: baseData.codigo_postal_envio,
          pais_envio: baseData.pais_envio,
          metodo_envio: baseData.metodo_envio,
          costo_envio: baseData.costo_envio,
          estado_envio: baseData.estado_envio,
          total_orden: baseData.total_orden,
        };
        await update(Number(id), updatePayload);
        show({
          title: 'Orden actualizada',
          message: 'La orden se actualizó correctamente.',
          variant: 'success'
        });
      } else {
        const createPayload = { ...baseData, fecha_orden: new Date().toISOString() };
        await create(createPayload);
        show({
          title: 'Orden creada',
          message: 'La orden se creó correctamente.',
          variant: 'success'
        });
      }
      
      navigate('/ordenes');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      show({
        title: isEdit ? 'Error al actualizar' : 'Error al crear',
        message: `Error: ${message}`,
        detail: error,
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof OrdenFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loadingOrdenes || loadingClientes || (isEdit && loading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="text-sm text-gray-500">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/ordenes')}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Volver a la lista"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white shadow">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.5a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25h6.5m12.75 0a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25V0H6.75a2.25 2.25 0 00-2.25 2.25v16.5" />
                </svg>
              </span>
              {isEdit ? 'Editar Orden' : 'Nueva Orden'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? 'Modifica los datos de la orden seleccionada' : 'Completa los datos para crear una nueva orden'}
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Cliente */}
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50/60 px-6 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Información del Cliente
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente <span className="text-red-500">*</span>
                </label>
                <select
                  id="cliente"
                  value={formData.id_cliente}
                  onChange={(e) => handleChange('id_cliente', Number(e.target.value))}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500/30 ${
                    errors.id_cliente ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white focus:border-red-600'
                  }`}
                  required
                >
                  <option value={0}>Seleccionar cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id_cliente} value={cliente.id_cliente}>
                      {`${cliente.nombre} ${cliente.apellido || ''}`.trim()} - {cliente.email}
                    </option>
                  ))}
                </select>
                {errors.id_cliente !== undefined && (
                  <p className="text-xs text-red-600 mt-1">Debe seleccionar un cliente</p>
                )}
              </div>
              <div>
                <label htmlFor="estado_orden" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado de la Orden
                </label>
                <select
                  id="estado_orden"
                  value={formData.estado_orden}
                  onChange={(e) => handleChange('estado_orden', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-500/30"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Confirmada">Confirmada</option>
                  <option value="Procesando">Procesando</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Información de Envío */}
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50/60 px-6 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0V8.25a1.5 1.5 0 011.5-1.5h10.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H6.75z" />
              </svg>
              Información de Envío
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="direccion_envio" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección de Envío <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="direccion_envio"
                  value={formData.direccion_envio}
                  onChange={(e) => handleChange('direccion_envio', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500/30 ${
                    errors.direccion_envio ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white focus:border-red-600'
                  }`}
                  placeholder="Ingrese la dirección completa"
                  required
                />
                {errors.direccion_envio && (
                  <p className="text-xs text-red-600 mt-1">{errors.direccion_envio}</p>
                )}
              </div>
              <div>
                <label htmlFor="ciudad_envio" className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="ciudad_envio"
                  value={formData.ciudad_envio}
                  onChange={(e) => handleChange('ciudad_envio', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500/30 ${
                    errors.ciudad_envio ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white focus:border-red-600'
                  }`}
                  placeholder="Ciudad de envío"
                  required
                />
                {errors.ciudad_envio && (
                  <p className="text-xs text-red-600 mt-1">{errors.ciudad_envio}</p>
                )}
              </div>
              <div>
                <label htmlFor="codigo_postal_envio" className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="codigo_postal_envio"
                  value={formData.codigo_postal_envio}
                  onChange={(e) => handleChange('codigo_postal_envio', e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500/30 ${
                    errors.codigo_postal_envio ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white focus:border-red-600'
                  }`}
                  placeholder="Código postal"
                  required
                />
                {errors.codigo_postal_envio && (
                  <p className="text-xs text-red-600 mt-1">{errors.codigo_postal_envio}</p>
                )}
              </div>
              <div>
                <label htmlFor="pais_envio" className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <input
                  type="text"
                  id="pais_envio"
                  value={formData.pais_envio}
                  onChange={(e) => handleChange('pais_envio', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-500/30"
                  placeholder="País"
                />
              </div>
              <div>
                <label htmlFor="metodo_envio" className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Envío
                </label>
                <select
                  id="metodo_envio"
                  value={formData.metodo_envio}
                  onChange={(e) => handleChange('metodo_envio', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-500/30"
                >
                  <option value="Standard">Standard</option>
                  <option value="Express">Express</option>
                  <option value="Overnight">Overnight</option>
                  <option value="Economy">Economy</option>
                </select>
              </div>
              <div>
                <label htmlFor="costo_envio" className="block text-sm font-medium text-gray-700 mb-1">
                  Costo de Envío
                </label>
                <input
                  type="number"
                  id="costo_envio"
                  step="0.01"
                  min="0"
                  value={formData.costo_envio}
                  onChange={(e) => handleChange('costo_envio', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-500/30"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="estado_envio" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado de Envío
                </label>
                <select
                  id="estado_envio"
                  value={formData.estado_envio}
                  onChange={(e) => handleChange('estado_envio', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-500/30"
                >
                  <option value="Preparando">Preparando</option>
                  <option value="Enviado">Enviado</option>
                  <option value="En tránsito">En tránsito</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Devuelto">Devuelto</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Información Financiera */}
        <div className="bg-white/60 backdrop-blur rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50/60 px-6 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Información Financiera
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="total_orden" className="block text-sm font-medium text-gray-700 mb-1">
                  Total de la Orden <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="total_orden"
                  step="0.01"
                  min="0"
                  value={formData.total_orden}
                  onChange={(e) => handleChange('total_orden', parseFloat(e.target.value) || 0)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-red-500/30 ${
                    errors.total_orden !== undefined ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white focus:border-red-600'
                  }`}
                  placeholder="0.00"
                  required
                />
                {errors.total_orden !== undefined && (
                  <p className="text-xs text-red-600 mt-1">El total debe ser mayor a 0</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Final
                </label>
                <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  ${(formData.total_orden + formData.costo_envio).toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Incluye costo de envío: ${formData.costo_envio.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-4 bg-white/60 backdrop-blur rounded-xl border border-gray-200 p-6">
          <button
            type="button"
            onClick={() => navigate('/ordenes')}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-2.5 rounded-lg font-medium shadow-md shadow-red-600/25 transition disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                {isEdit ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {isEdit ? 'Actualizar Orden' : 'Crear Orden'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrdenForm;