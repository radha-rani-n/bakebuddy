import { smartAdjustQuantity, adjustBakeTime, adjustBakeTemp } from './smartAdjust';
import { decimalToFraction } from '../../utils/fractions';

interface IngredientData {
  name: string;
  quantity: number | null;
  unit: string | null;
  category: string;
  notes: string | null;
  sortOrder: number;
}

interface StepData {
  sortOrder: number;
  text: string;
}

interface PanData {
  volumeCubicInches: number;
  name: string;
}

interface RecipeWithRelations {
  originalYield: number | null;
  originalPanVolume: number | null;
  bakeTemp: number | null;
  cookTime: number | null;
  ingredients: IngredientData[];
  steps: StepData[];
}

interface ScaledIngredient {
  name: string;
  originalQty: number | null;
  scaledQty: number | null;
  unit: string | null;
  category: string;
  notes: string | null;
}

interface ScaledStep {
  sortOrder: number;
  text: string;
}

interface ScaleResult {
  scaleFactor: number;
  adjustedBakeTemp: number | null;
  adjustedBakeTime: number | null;
  scaledIngredients: ScaledIngredient[];
  scaledSteps: ScaledStep[];
}

export function scaleRecipe(
  recipe: RecipeWithRelations,
  method: 'servings' | 'pan',
  targetServings?: number | null,
  targetPan?: PanData | null
): ScaleResult {
  let scaleFactor: number;

  if (method === 'servings') {
    if (!targetServings || !recipe.originalYield) {
      throw new Error('Both target servings and original yield are required for serving-based scaling');
    }
    scaleFactor = targetServings / recipe.originalYield;
  } else {
    if (!targetPan || !recipe.originalPanVolume) {
      throw new Error('Both target pan and original pan volume are required for pan-based scaling');
    }
    scaleFactor = targetPan.volumeCubicInches / recipe.originalPanVolume;
  }

  const scaledIngredients: ScaledIngredient[] = recipe.ingredients.map((ing) => ({
    name: ing.name,
    originalQty: ing.quantity,
    scaledQty: ing.quantity
      ? smartAdjustQuantity(ing.quantity, scaleFactor, ing.category as any)
      : null,
    unit: ing.unit,
    category: ing.category,
    notes: ing.notes,
  }));

  const scaledSteps: ScaledStep[] = recipe.steps.map((step) => {
    let text = step.text;

    // Replace ingredient references in step text with scaled amounts
    for (const scaledIng of scaledIngredients) {
      if (scaledIng.originalQty && scaledIng.scaledQty && scaledIng.unit) {
        const originalStr = `${decimalToFraction(scaledIng.originalQty)} ${scaledIng.unit}`;
        const scaledStr = `${decimalToFraction(scaledIng.scaledQty)} ${scaledIng.unit}`;
        text = text.replace(originalStr, scaledStr);
      }
    }

    return { sortOrder: step.sortOrder, text };
  });

  return {
    scaleFactor,
    adjustedBakeTemp: recipe.bakeTemp ? adjustBakeTemp(recipe.bakeTemp, scaleFactor) : null,
    adjustedBakeTime: recipe.cookTime ? adjustBakeTime(recipe.cookTime, scaleFactor) : null,
    scaledIngredients,
    scaledSteps,
  };
}
