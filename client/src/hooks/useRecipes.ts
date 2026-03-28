import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '../types/recipe';
import * as recipesApi from '../api/recipes';

export function useRecipes(searchQuery?: string) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true);
      const { recipes } = await recipesApi.listRecipes(searchQuery);
      setRecipes(recipes);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const removeRecipe = async (id: string) => {
    await recipesApi.deleteRecipe(id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return { recipes, loading, error, removeRecipe, refetch: fetchRecipes };
}
