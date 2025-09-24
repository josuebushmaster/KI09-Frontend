import {
  listCategorias as apiList,
  getCategoria as apiGet,
  createCategoria as apiCreate,
  updateCategoria as apiUpdate,
  deleteCategoria as apiDelete,
} from '../../../../infrastructure/api/CategoriaApi';
import type { Categoria } from '../../../../domain/entities';

export async function listCategorias(): Promise<Categoria[]> {
  return apiList();
}

export async function getCategoria(id: number): Promise<Categoria> {
  return apiGet(id);
}

export async function createCategoria(payload: Partial<Categoria>): Promise<Categoria> {
  return apiCreate(payload);
}

export async function updateCategoria(id: number, payload: Partial<Categoria>): Promise<Categoria> {
  return apiUpdate(id, payload);
}

export async function deleteCategoria(id: number): Promise<void> {
  return apiDelete(id);
}
