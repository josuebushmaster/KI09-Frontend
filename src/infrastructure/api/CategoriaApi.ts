import { http } from "./http";
import type { Categoria } from "../../domain/entities";

// Shape returned by your backend (Swagger shows these names)
type ApiCategoria = {
  _id_categoria?: number;
  id_categoria?: number;
  _id?: number;
  nombre_categoria?: string;
  descripcion?: string | null;
  // some backends may use an alternate field name
  descripcion_categoria?: string | null;
  created_at?: string;
  updated_at?: string;
};

export function toDomain(api: ApiCategoria): Categoria | null {
  const rawId = api._id_categoria ?? api.id_categoria ?? api._id;
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
  const out: Partial<ApiCategoria> = {};
  if (payload.nombre !== undefined) out.nombre_categoria = payload.nombre;
  if (payload.descripcion !== undefined) out.descripcion = payload.descripcion;
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
  if (!dom) throw new Error('API returned categoria without valid id_categoria');
  return dom;
}

export async function createCategoria(payload: Partial<Categoria>): Promise<Categoria> {
  const apiPayload = toApi(payload);
  const data = await http<ApiCategoria>("categorias/", "POST", apiPayload);
  const dom = toDomain(data);
  if (!dom) throw new Error('API returned created categoria without valid id_categoria');
  return dom;
}

export async function updateCategoria(id: number, payload: Partial<Categoria>): Promise<Categoria> {
  const apiPayload = toApi(payload);
  const data = await http<ApiCategoria>(`categorias/${id}`, "PUT", apiPayload);
  const dom = toDomain(data);
  if (!dom) throw new Error('API returned updated categoria without valid id_categoria');
  return dom;
}

export async function deleteCategoria(id: number): Promise<void> {
  await http<void>(`categorias/${id}`, "DELETE");
}