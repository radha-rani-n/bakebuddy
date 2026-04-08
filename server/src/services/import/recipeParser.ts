import { parseIngredient } from '../../utils/parseIngredient';

interface RawRecipe {
  title?: string;
  description?: string;
  imageUrl?: string;
  yield?: number | string | string[];
  prepTime?: number | string;
  cookTime?: number | string;
  bakeTemp?: number;
  ingredients?: string[];
  steps?: string[];
  bodyText?: string;
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
  originalPanShape: string | null;
  originalPanWidth: number | null;
  originalPanLength: number | null;
  originalPanDiameter: number | null;
  originalPanHeight: number | null;
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

interface DetectedPan {
  shape: string;
  width: number | null;
  length: number | null;
  diameter: number | null;
  height: number | null;
}

function detectPanFromText(text: string): DetectedPan | null {
  const t = text.toLowerCase();

  // "9-inch square" or "9 inch square pan"
  const squareMatch = t.match(/(\d+\.?\d*)\s*[-"]?\s*(?:inch|in\.?)?\s*square\s*(?:baking\s*)?(?:pan|tin|dish)?/);
  if (squareMatch) {
    const size = parseFloat(squareMatch[1]);
    return { shape: 'SQUARE', width: size, length: null, diameter: null, height: 2 };
  }

  // "9-inch round" or "9 inch round"
  const roundMatch = t.match(/(\d+\.?\d*)\s*[-"]?\s*(?:inch|in\.?)?\s*round\s*(?:baking\s*)?(?:pan|cake\s*pan|tin)?/);
  if (roundMatch) {
    return { shape: 'ROUND', width: null, length: null, diameter: parseFloat(roundMatch[1]), height: 2 };
  }

  // "round 9-inch" or "round 9""
  const roundMatch2 = t.match(/round\s*(\d+\.?\d*)\s*[-"]?\s*(?:inch|in\.?)?\s*(?:pan|cake\s*pan|tin)?/);
  if (roundMatch2) {
    return { shape: 'ROUND', width: null, length: null, diameter: parseFloat(roundMatch2[1]), height: 2 };
  }

  // "5x9 loaf" or "5 x 9 loaf pan"
  const loafDimMatch = t.match(/(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)\s*(?:[x×]\s*(\d+\.?\d*))?\s*(?:-?\s*inch|-?\s*in\.?)?\s*loaf\s*(?:pan)?/);
  if (loafDimMatch) {
    const w = parseFloat(loafDimMatch[1]);
    const l = parseFloat(loafDimMatch[2]);
    const h = loafDimMatch[3] ? parseFloat(loafDimMatch[3]) : null;
    return { shape: 'LOAF', width: Math.min(w, l), length: Math.max(w, l), diameter: null, height: h || 3 };
  }

  // "loaf pan" without dimensions
  if (/loaf\s*pan/.test(t)) {
    return { shape: 'LOAF', width: 5, length: 9, diameter: null, height: 3 };
  }

  // "muffin tin" or "muffin pan" or "cupcake pan"
  if (/muffin\s*(?:tin|pan)|cupcake\s*(?:tin|pan)/.test(t)) {
    return { shape: 'MUFFIN_TIN', width: null, length: null, diameter: null, height: null };
  }

  // "9x13" or "9 x 13" — generic rectangular/square fallback
  const rectMatch = t.match(/(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)\s*(?:[x×]\s*(\d+\.?\d*))?\s*(?:-?\s*inch|-?\s*in\.?)?\s*(?:pan|baking|dish|casserole)?/);
  if (rectMatch) {
    const a = parseFloat(rectMatch[1]);
    const b = parseFloat(rectMatch[2]);
    const h = rectMatch[3] ? parseFloat(rectMatch[3]) : null;
    if (a === b) {
      return { shape: 'SQUARE', width: a, length: null, diameter: null, height: h || 2 };
    }
    return { shape: 'RECTANGULAR', width: Math.min(a, b), length: Math.max(a, b), diameter: null, height: h || 2 };
  }

  return null;
}

function parseYield(value: number | string | string[] | undefined): number | null {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (Array.isArray(value)) return parseYield(value[0]);

  const match = value.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export function normalizeRecipe(raw: RawRecipe): ParsedRecipe {
  const ingredients: ParsedIngredient[] = (raw.ingredients || [])
    .map((item) => typeof item === 'string' ? item : String(item))
    .filter((text) => text.trim().length > 0)
    .map((text, idx) => {
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

  // Detect pan from all available text (body text has the best coverage)
  const allText = [
    raw.bodyText || '',
    ...(raw.ingredients || []),
    ...(raw.steps || []),
    raw.description || '',
  ].join(' ');
  const pan = detectPanFromText(allText);

  return {
    title: raw.title?.trim() || 'Untitled Recipe',
    description: raw.description?.trim() || null,
    imageUrl: raw.imageUrl || null,
    originalYield: parseYield(raw.yield),
    prepTime: parseMinutes(raw.prepTime),
    cookTime: parseMinutes(raw.cookTime),
    bakeTemp: raw.bakeTemp || null,
    originalPanShape: pan?.shape || null,
    originalPanWidth: pan?.width || null,
    originalPanLength: pan?.length || null,
    originalPanDiameter: pan?.diameter || null,
    originalPanHeight: pan?.height || null,
    ingredients,
    steps,
  };
}
