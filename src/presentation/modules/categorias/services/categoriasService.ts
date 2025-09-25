import {
  listCategorias as apiList,
  getCategoria as apiGet,
  createCategoria as apiCreate,
  updateCategoria as apiUpdate,
  deleteCategoria as apiDelete,
  listCategoriasRaw,
  toDomain,
} from '../../../../infrastructure/api/CategoriaApi';
import type { Categoria } from '../../../../domain/entities';

export async function listCategorias(): Promise<Categoria[]> {
  return apiList();
}

export async function listCategoriasDetailed(): Promise<{ valid: Categoria[]; invalid: unknown[] }> {
  const raw = await listCategoriasRaw();
  const mapped = raw.map((r) => toDomain(r));
  const valid: Categoria[] = [];
  const invalid: unknown[] = [];
  for (let i = 0; i < raw.length; i++) {
    const dom = mapped[i];
    if (dom) valid.push(dom);
    else invalid.push(raw[i]);
  }
  return { valid, invalid };
}

export async function getCategoria(id: number): Promise<Categoria> {
  return apiGet(id);
}

export async function createCategoria(payload: Partial<Categoria>): Promise<Categoria> {
  // Debug temporal: ver qué llega al servicio
  console.log('🔍 SERVICIO - Payload recibido:', payload);
  
  // Sanitizar payload para evitar enviar campos de id accidentalmente
  // Limpieza inline: eliminar claves tipo ID del payload si existen
  let cleaned: Partial<Categoria> | undefined = undefined;
  try {
    const bodyObj = payload as Record<string, unknown> | undefined;
    if (bodyObj && typeof bodyObj === 'object') {
      const out = { ...bodyObj } as Record<string, unknown>;
      const idPattern = /(^id$|id_|_id$|idCategoria|idcategoria)/i;
      const removed: string[] = [];
      for (const k of Object.keys(out)) {
        if (idPattern.test(k)) {
          removed.push(k);
          delete out[k];
        }
      }
      if (removed.length > 0) {
        try {
          console.warn('🧹 servicio: se eliminaron claves tipo ID del payload:', removed, payload);
        } catch {
          /* ignore */
        }
      }
      cleaned = out as Partial<Categoria>;
    }
  } catch {
    // ignore
  }

  const sanitized: Partial<Categoria> = {
    nombre: cleaned?.nombre ?? payload.nombre,
    descripcion: (cleaned?.descripcion ?? payload.descripcion) || '', // Siempre enviar descripción, aunque sea vacía
  };
  
  console.log('🔍 SERVICIO - Payload sanitizado:', sanitized);
  
  return apiCreate(sanitized);
}

export async function updateCategoria(id: number, payload: Partial<Categoria>): Promise<Categoria> {
  return apiUpdate(id, payload);
}

export async function deleteCategoria(id: number): Promise<void> {
  return apiDelete(id);
}
