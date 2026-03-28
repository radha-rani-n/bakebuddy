import apiClient from './client';
import type { Recipe, RecipeFormData } from '../types/recipe';

export async function listRecipes(query?: string): Promise<{ recipes: Recipe[] }> {
  const { data } = await apiClient.get('/recipes', { params: query ? { q: query } : {} });
  return data;
}

export async function getRecipe(id: string): Promise<{ recipe: Recipe }> {
  const { data } = await apiClient.get(`/recipes/${id}`);
  return data;
}

export async function createRecipe(recipe: RecipeFormData): Promise<{ recipe: Recipe }> {
  const { data } = await apiClient.post('/recipes', recipe);
  return data;
}

export async function updateRecipe(id: string, recipe: RecipeFormData): Promise<{ recipe: Recipe }> {
  const { data } = await apiClient.put(`/recipes/${id}`, recipe);
  return data;
}

export async function deleteRecipe(id: string): Promise<void> {
  await apiClient.delete(`/recipes/${id}`);
}
