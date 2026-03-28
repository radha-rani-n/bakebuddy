import apiClient from './client';
import type { ScaledRecipe } from '../types/recipe';

export async function scaleRecipe(
  recipeId: string,
  method: 'servings' | 'pan',
  targetServings?: number,
  targetPanId?: string
): Promise<{ scaledRecipe: ScaledRecipe }> {
  const { data } = await apiClient.post(`/recipes/${recipeId}/scale`, {
    method,
    targetServings,
    targetPanId,
  });
  return data;
}

export async function listScaledRecipes(recipeId: string): Promise<{ scaledRecipes: ScaledRecipe[] }> {
  const { data } = await apiClient.get(`/recipes/${recipeId}/scaled`);
  return data;
}

export async function deleteScaledRecipe(recipeId: string, scaledId: string): Promise<void> {
  await apiClient.delete(`/recipes/${recipeId}/scaled/${scaledId}`);
}
