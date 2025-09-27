import { http } from "./http";
import type { Categoria } from "../../domain/entities";

// Shape returned by your backend (Swagger shows these names)
type ApiCategoria = {
  id_categoria?: number;
  nombre_categoria?: string;
  descripcion?: string | null;
  // some backends may use an alternate field name
  descripcion_categoria?: string | null;
  created_at?: string;
  updated_at?: string;
};

export function toDomain(api: ApiCategoria): Categoria | null {
  const rawId = api.id_categoria;
  if (rawId === undefined || rawId === null) return null;
  const id = Number(rawId);
  if (!Number.isFinite(id)) return null;

  return {
    id_categoria: id,
    nombre: String(api.nombre_categoria ?? '').trim(),
    descripcion: api.descripcion ?? api.descripcion_categoria ?? null,
    created_at: api.created_at,
    updated_at: api.updated_at,
  } as Categoria;
}

function toApi(payload: Partial<Categoria>): Partial<ApiCategoria> {
  // Solo crear un objeto completamente nuevo con los campos que queremos
  const out: Partial<ApiCategoria> = {};
  
  // NUNCA incluir ningún tipo de ID
  // Solo mapear campos específicos y validados
  
  if (payload.nombre !== undefined && payload.nombre !== null) {
    out.nombre_categoria = String(payload.nombre).trim();
  }
  
  if (payload.descripcion !== undefined) {
    if (payload.descripcion === null || payload.descripcion === '') {
      out.descripcion = ''; // Enviar string vacío en lugar de null
    } else {
      out.descripcion = String(payload.descripcion).trim();
    }
  }
  
  // Inspeccionar y limpiar el payload original si contiene claves tipo ID
  // Limpieza inline: eliminar claves tipo ID del payload original para rastreo
  try {
    const bodyObj = payload as Record<string, unknown> | undefined;
    if (bodyObj && typeof bodyObj === 'object') {
      const idPattern = /(^id$|id_|_id$|idCategoria|idcategoria)/i;
      const out = { ...bodyObj } as Record<string, unknown>;
      const removed: string[] = [];
      for (const k of Object.keys(out)) {
        if (idPattern.test(k)) {
          removed.push(k);
          delete out[k];
        }
      }
      if (removed.length > 0) {
        try {
          console.warn('🚨 toApi: payload original contenía claves ID y fue limpiado', payload, '->', out);
        } catch {
          /* ignore logging errors */
        }
      }
    }
  } catch {
    // ignore
  }

  return out;
}

export async function listCategorias(): Promise<Categoria[]> {
  const data = await http<ApiCategoria[]>("categorias/");
  if (!Array.isArray(data)) return [];
  const mapped = data.map(toDomain).filter((x): x is Categoria => x !== null);
  if (mapped.length !== data.length) {
    console.warn('Some categorias returned by API were missing id_categoria and were ignored', data);
  }
  return mapped;
}

export async function listCategoriasRaw(): Promise<ApiCategoria[]> {
  const data = await http<ApiCategoria[]>("categorias/");
  return Array.isArray(data) ? data : [];
}

export async function getCategoria(id: number): Promise<Categoria> {
  const data = await http<ApiCategoria>(`categorias/${id}`);
  const dom = toDomain(data);
  if (!dom) throw new Error('La API devolvió una categoría sin id_categoria válido');
  return dom;
}

export async function createCategoria(payload: Partial<Categoria>): Promise<Categoria> {
  // Verificar que el payload original no tenga IDs
  if ('id_categoria' in payload && payload.id_categoria !== undefined) {
    console.error('🚨 PAYLOAD ORIGINAL CONTIENE ID_CATEGORIA:', payload);
  }
  
  const apiPayload = toApi(payload);
  
  // Debug temporal: mostrar exactamente qué se envía al backend
  console.log('🐛 DEBUG - Payload original:', payload);
  console.log('🐛 DEBUG - Payload mapeado para API:', apiPayload);
  
  // Verificación final: el apiPayload NO debe tener ningún campo de ID
  const payloadKeys = Object.keys(apiPayload);
  const idFields = payloadKeys.filter(key => 
    key.includes('id_') || key.includes('_id') || key === 'id'
  );
  
  if (idFields.length > 0) {
    console.error('🚨 ERROR CRÍTICO: El payload contiene campos de ID:', idFields, apiPayload);
    throw new Error(`El payload contiene campos de ID no permitidos: ${idFields.join(', ')}`);
  }
  
  const data = await http<ApiCategoria>("categorias/", "POST", apiPayload);
  const dom = toDomain(data);
  if (!dom) throw new Error('La API devolvió una categoría creada sin id_categoria válido');
  return dom;
}

export async function updateCategoria(id: number, payload: Partial<Categoria>): Promise<Categoria> {
  const apiPayload = toApi(payload);
  const data = await http<ApiCategoria>(`categorias/${id}`, "PUT", apiPayload);
  const dom = toDomain(data);
  if (!dom) throw new Error('La API devolvió una categoría actualizada sin id_categoria válido');
  return dom;
}

export async function deleteCategoria(id: number): Promise<void> {
  await http<void>(`categorias/${id}`, "DELETE");
}