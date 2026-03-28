import { parseIngredient } from '../../utils/parseIngredient';

interface RawRecipe {
  title?: string;
  description?: string;
  imageUrl?: string;
  yield?: number | string;
  prepTime?: number | string;
  cookTime?: number | string;
  bakeTemp?: number;
  ingredients?: string[];
  steps?: string[];
}

interface ParsedIngredient {
  sortOrder: number;
  quantity: number | null;
  unit: string | null;
  name: string;
  category: string;
  notes: string | null;
}

interface ParsedStep {
  sortOrder: number;
  text: string;
  ingredientRefs: null;
}

export interface ParsedRecipe {
  title: string;
  description: string | null;
  imageUrl: string | null;
  originalYield: number | null;
  prepTime: number | null;
  cookTime: number | null;
  bakeTemp: number | null;
  ingredients: ParsedIngredient[];
  steps: ParsedStep[];
}

function parseMinutes(value: number | string | undefined): number | null {
  if (!value) return null;
  if (typeof value === 'number') return value;

  // Handle ISO 8601 duration: PT30M, PT1H30M, etc.
  const isoMatch = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (isoMatch) {
    const hours = parseInt(isoMatch[1] || '0');
    const minutes = parseInt(isoMatch[2] || '0');
    return hours * 60 + minutes;
  }

  // Try plain number
  const num = parseInt(value);
  return isNaN(num) ? null : num;
}

function parseYield(value: number | string | undefined): number | null {
  if (!value) return null;
  if (typeof value === 'number') return value;

  const match = value.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export function normalizeRecipe(raw: RawRecipe): ParsedRecipe {
  const ingredients: ParsedIngredient[] = (raw.ingredients || []).map((text, idx) => {
    const parsed = parseIngredient(text);
    return {
      sortOrder: idx,
      quantity: parsed.quantity,
      unit: parsed.unit,
      name: parsed.name,
      category: parsed.category,
      notes: parsed.notes,
    };
  });

  const steps: ParsedStep[] = (raw.steps || []).map((text, idx) => ({
    sortOrder: idx,
    text: text.trim(),
    ingredientRefs: null,
  }));

  return {
    title: raw.title?.trim() || 'Untitled Recipe',
    description: raw.description?.trim() || null,
    imageUrl: raw.imageUrl || null,
    originalYield: parseYield(raw.yield),
    prepTime: parseMinutes(raw.prepTime),
    cookTime: parseMinutes(raw.cookTime),
    bakeTemp: raw.bakeTemp || null,
    ingredients,
    steps,
  };
}
