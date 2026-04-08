import { smartAdjustQuantity, adjustBakeTime, adjustBakeTemp } from './smartAdjust';
import { decimalToFraction } from '../../utils/fractions';

// Approximate grams per 1 unit (for common baking units)
const GRAMS_PER_UNIT: Record<string, Record<string, number>> = {
  // Default (general purpose) conversions
  _default: {
    cup: 128, tbsp: 8, tsp: 2.7, oz: 28.35, lb: 453.6,
    g: 1, kg: 1000, ml: 1, L: 1000, stick: 113,
  },
  // Category-specific overrides (grams per 1 cup)
  DRY: { cup: 125, tbsp: 8, tsp: 2.6 },      // flour
  SUGAR: { cup: 200, tbsp: 12.5, tsp: 4.2 },  // granulated sugar
  FAT: { cup: 227, tbsp: 14.2, tsp: 4.7 },    // butter
  WET: { cup: 240, tbsp: 15, tsp: 5 },         // liquids
  LEAVENING: { tbsp: 14, tsp: 4.6 },
  SPICE: { tbsp: 6, tsp: 2 },
};

function toGrams(qty: number, unit: string | null, category: string): number | null {
  if (!unit) return null;
  const unitLower = unit.toLowerCase();
  const catMap = GRAMS_PER_UNIT[category] || {};
  const defaultMap = GRAMS_PER_UNIT._default;
  const gramsPerUnit = catMap[unitLower] ?? defaultMap[unitLower];
  if (gramsPerUnit == null) return null;
  return Math.round(qty * gramsPerUnit * 10) / 10;
}

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
  scaledGrams: number | null;
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

// Categories that are perishable
const PERISHABLE_CATEGORIES = new Set(['WET', 'FAT', 'EGG']);

// Key ingredients — perishables + staples you might have limited amounts of
const PERISHABLE_KEYWORDS = [
  'flour', 'all-purpose flour', 'bread flour', 'cake flour',
  'butter', 'cheese', 'cream cheese', 'cream', 'heavy cream',
  'sour cream', 'yogurt', 'milk', 'buttermilk', 'whipping cream',
  'egg', 'eggs', 'egg white', 'egg yolk',
  'mascarpone', 'ricotta', 'mozzarella', 'cheddar', 'parmesan',
  'chocolate', 'nutella', 'peanut butter',
  'banana', 'apple', 'strawberry', 'blueberry', 'raspberry',
  'pumpkin', 'lemon', 'orange', 'lime', 'mango', 'peach',
  'avocado', 'coconut cream', 'coconut milk',
];

export function getScalableIngredients(ingredients: IngredientData[]): IngredientData[] {
  return ingredients.filter(ing => {
    if (!ing.quantity || ing.quantity <= 0) return false;
    const nameLower = ing.name.toLowerCase();
    // Include perishable categories (wet, fat, egg)
    if (PERISHABLE_CATEGORIES.has(ing.category)) return true;
    // Include by perishable name match
    return PERISHABLE_KEYWORDS.some(kw => nameLower.includes(kw));
  });
}

interface IngredientScaleInput {
  ingredientName: string;
  haveQuantity: number;
  haveUnit: string;
}

export function scaleRecipe(
  recipe: RecipeWithRelations,
  method: 'servings' | 'pan' | 'ingredient',
  targetServings?: number | null,
  targetPan?: PanData | null,
  ingredientInput?: IngredientScaleInput | null
): ScaleResult {
  let scaleFactor: number;

  if (method === 'servings') {
    if (!targetServings || !recipe.originalYield) {
      throw new Error('Both target servings and original yield are required for serving-based scaling');
    }
    scaleFactor = targetServings / recipe.originalYield;
  } else if (method === 'pan') {
    if (!targetPan || !recipe.originalPanVolume) {
      throw new Error('Both target pan and original pan volume are required for pan-based scaling');
    }
    scaleFactor = targetPan.volumeCubicInches / recipe.originalPanVolume;
  } else {
    // Scale by ingredient
    if (!ingredientInput) {
      throw new Error('Ingredient info is required for ingredient-based scaling');
    }

    // Find the matching ingredient in the recipe
    const matchName = ingredientInput.ingredientName.toLowerCase();
    const matchedIng = recipe.ingredients.find(
      ing => ing.name.toLowerCase() === matchName
    );

    if (!matchedIng || !matchedIng.quantity) {
      throw new Error(`Ingredient "${ingredientInput.ingredientName}" not found in recipe or has no quantity`);
    }

    // Convert "have" quantity to the same unit as recipe
    let haveInRecipeUnit = ingredientInput.haveQuantity;
    const haveUnit = ingredientInput.haveUnit.toLowerCase();
    const recipeUnit = (matchedIng.unit || '').toLowerCase();

    // If units differ, convert via grams
    if (haveUnit !== recipeUnit) {
      const haveGrams = toGrams(ingredientInput.haveQuantity, haveUnit, matchedIng.category);
      const recipeGramsPerUnit = toGrams(1, recipeUnit || null, matchedIng.category);

      if (haveGrams != null && recipeGramsPerUnit != null && recipeGramsPerUnit > 0) {
        haveInRecipeUnit = haveGrams / recipeGramsPerUnit;
      } else if (haveUnit === 'g' && recipeUnit) {
        // Direct gram conversion
        const gramsPerRecipeUnit = toGrams(1, recipeUnit, matchedIng.category);
        if (gramsPerRecipeUnit) {
          haveInRecipeUnit = ingredientInput.haveQuantity / gramsPerRecipeUnit;
        }
      }
      // If conversion fails, assume same unit
    }

    scaleFactor = haveInRecipeUnit / matchedIng.quantity;
  }

  const scaledIngredients: ScaledIngredient[] = recipe.ingredients.map((ing) => {
    const scaledQty = ing.quantity
      ? smartAdjustQuantity(ing.quantity, scaleFactor, ing.category as any)
      : null;
    return {
      name: ing.name,
      originalQty: ing.quantity,
      scaledQty,
      scaledGrams: scaledQty ? toGrams(scaledQty, ing.unit, ing.category) : null,
      unit: ing.unit,
      category: ing.category,
      notes: ing.notes,
    };
  });

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
