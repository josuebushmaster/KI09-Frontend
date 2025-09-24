import { http } from "./http";
import type { Categoria } from "../../domain/entities";

// Shape returned by your backend (Swagger shows these names)
type ApiCategoria = {
  _id_categoria: number;
  nombre_categoria: string;
  descripcion?: string | null;
  // some backends may use an alternate field name
  descripcion_categoria?: string | null;
  created_at?: string;
  updated_at?: string;
};

function toDomain(api: ApiCategoria): Categoria {
  return {
    id_categoria: api._id_categoria,
    nombre: api.nombre_categoria,
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
  return Array.isArray(data) ? data.map(toDomain) : [];
}

export async function getCategoria(id: number): Promise<Categoria> {
  const data = await http<ApiCategoria>(`categorias/${id}`);
  return toDomain(data);
}

export async function createCategoria(payload: Partial<Categoria>): Promise<Categoria> {
  const apiPayload = toApi(payload);
  const data = await http<ApiCategoria>("categorias/", "POST", apiPayload);
  return toDomain(data);
}

export async function updateCategoria(id: number, payload: Partial<Categoria>): Promise<Categoria> {
  const apiPayload = toApi(payload);
  const data = await http<ApiCategoria>(`categorias/${id}`, "PUT", apiPayload);
  return toDomain(data);
}

export async function deleteCategoria(id: number): Promise<void> {
  await http<void>(`categorias/${id}`, "DELETE");
}