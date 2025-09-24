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
  // Sanitize payload to avoid sending id fields accidentally.
  const sanitized: Partial<Categoria> = {
    nombre: payload.nombre,
    descripcion: payload.descripcion ?? null,
  };
  return apiCreate(sanitized);
}

export async function updateCategoria(id: number, payload: Partial<Categoria>): Promise<Categoria> {
  return apiUpdate(id, payload);
}

export async function deleteCategoria(id: number): Promise<void> {
  return apiDelete(id);
}
