import type { PanShape } from './pan';

export type ImportSource = 'URL' | 'YOUTUBE' | 'TIKTOK' | 'INSTAGRAM' | 'IMAGE' | 'MANUAL';
export type IngredientCategory = 'DRY' | 'WET' | 'LEAVENING' | 'FAT' | 'SUGAR' | 'EGG' | 'SPICE' | 'OTHER';

export interface Ingredient {
  id?: string;
  sortOrder: number;
  quantity: number | null;
  unit: string | null;
  name: string;
  category: IngredientCategory;
  notes: string | null;
}

export interface Step {
  id?: string;
  sortOrder: number;
  text: string;
  ingredientRefs?: any;
}

export interface Recipe {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  importSource: ImportSource;
  originalYield: number | null;
  prepTime: number | null;
  cookTime: number | null;
  bakeTemp: number | null;
  bakeTempUnit: string;
  originalPanShape: PanShape | null;
  originalPanWidth: number | null;
  originalPanLength: number | null;
  originalPanDiameter: number | null;
  originalPanHeight: number | null;
  originalPanVolume: number | null;
  ingredients: Ingredient[];
  steps: Step[];
  scaledRecipes?: ScaledRecipe[];
  createdAt: string;
  updatedAt: string;
}

export interface ScaledRecipe {
  id: string;
  recipeId: string;
  scaleFactor: number;
  scaleMethod: string;
  targetYield: number | null;
  targetPanName: string | null;
  targetPanVolume: number | null;
  adjustedBakeTemp: number | null;
  adjustedBakeTime: number | null;
  scaledIngredients: ScaledIngredient[];
  scaledSteps: ScaledStep[];
  createdAt: string;
}

export interface ScaledIngredient {
  name: string;
  originalQty: number | null;
  scaledQty: number | null;
  scaledGrams: number | null;
  unit: string | null;
  category: string;
  notes: string | null;
}

export interface ScaledStep {
  sortOrder: number;
  text: string;
}

export interface RecipeFormData {
  title: string;
  description?: string;
  sourceUrl?: string;
  imageUrl?: string;
  importSource: ImportSource;
  originalYield?: number;
  prepTime?: number;
  cookTime?: number;
  bakeTemp?: number;
  bakeTempUnit?: string;
  originalPanShape?: PanShape;
  originalPanWidth?: number;
  originalPanLength?: number;
  originalPanDiameter?: number;
  originalPanHeight?: number;
  ingredients: Ingredient[];
  steps: Step[];
}
