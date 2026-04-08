import apiClient from './client';
import type { ScaledRecipe } from '../types/recipe';

export async function scaleRecipe(
  recipeId: string,
  method: 'servings' | 'pan' | 'ingredient',
  targetServings?: number,
  targetPanId?: string,
  ingredientName?: string,
  haveQuantity?: number,
  haveUnit?: string
): Promise<{ scaledRecipe: ScaledRecipe }> {
  const { data } = await apiClient.post(`/recipes/${recipeId}/scale`, {
    method,
    targetServings,
    targetPanId,
    ingredientName,
    haveQuantity,
    haveUnit,
  });
  return data;
}

export async function getScalableIngredients(recipeId: string): Promise<{
  ingredients: { name: string; quantity: number; unit: string | null; category: string }[];
}> {
  const { data } = await apiClient.get(`/recipes/${recipeId}/scalable-ingredients`);
  return data;
}

export async function listScaledRecipes(recipeId: string): Promise<{ scaledRecipes: ScaledRecipe[] }> {
  const { data } = await apiClient.get(`/recipes/${recipeId}/scaled`);
  return data;
}

export async function deleteScaledRecipe(recipeId: string, scaledId: string): Promise<void> {
  await apiClient.delete(`/recipes/${recipeId}/scaled/${scaledId}`);
}
