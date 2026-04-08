import { fractionToDecimal } from './fractions';

type IngredientCategory = 'DRY' | 'WET' | 'LEAVENING' | 'FAT' | 'SUGAR' | 'EGG' | 'SPICE' | 'OTHER';

interface ParsedIngredient {
  quantity: number | null;
  unit: string | null;
  name: string;
  category: IngredientCategory;
  notes: string | null;
}

const UNITS = [
  'cups?', 'tablespoons?', 'tbsp', 'teaspoons?', 'tsp',
  'ounces?', 'oz', 'pounds?', 'lbs?', 'grams?', 'g',
  'kilograms?', 'kg', 'ml', 'milliliters?', 'liters?', 'l',
  'quarts?', 'qt', 'pints?', 'pt', 'gallons?', 'gal',
  'sticks?', 'pinch(?:es)?', 'dash(?:es)?',
];

const UNIT_NORMALIZE: Record<string, string> = {
  cup: 'cup', cups: 'cup',
  tablespoon: 'tbsp', tablespoons: 'tbsp', tbsp: 'tbsp',
  teaspoon: 'tsp', teaspoons: 'tsp', tsp: 'tsp',
  ounce: 'oz', ounces: 'oz', oz: 'oz',
  pound: 'lb', pounds: 'lb', lb: 'lb', lbs: 'lb',
  gram: 'g', grams: 'g', g: 'g',
  kilogram: 'kg', kilograms: 'kg', kg: 'kg',
  ml: 'ml', milliliter: 'ml', milliliters: 'ml',
  liter: 'L', liters: 'L', l: 'L',
  quart: 'qt', quarts: 'qt', qt: 'qt',
  pint: 'pt', pints: 'pt', pt: 'pt',
  gallon: 'gal', gallons: 'gal', gal: 'gal',
  stick: 'stick', sticks: 'stick',
  pinch: 'pinch', pinches: 'pinch',
  dash: 'dash', dashes: 'dash',
};

const CATEGORY_KEYWORDS: Record<string, IngredientCategory> = {
  flour: 'DRY', 'all-purpose flour': 'DRY', 'bread flour': 'DRY', 'cake flour': 'DRY',
  cocoa: 'DRY', 'cocoa powder': 'DRY', cornstarch: 'DRY', oats: 'DRY',
  sugar: 'SUGAR', 'brown sugar': 'SUGAR', 'powdered sugar': 'SUGAR',
  'confectioners sugar': 'SUGAR', honey: 'SUGAR', molasses: 'SUGAR', 'maple syrup': 'SUGAR',
  butter: 'FAT', oil: 'FAT', 'vegetable oil': 'FAT', 'coconut oil': 'FAT',
  shortening: 'FAT', lard: 'FAT', margarine: 'FAT',
  egg: 'EGG', eggs: 'EGG', 'egg white': 'EGG', 'egg yolk': 'EGG',
  'baking powder': 'LEAVENING', 'baking soda': 'LEAVENING', yeast: 'LEAVENING',
  'active dry yeast': 'LEAVENING', 'instant yeast': 'LEAVENING',
  salt: 'SPICE', vanilla: 'SPICE', 'vanilla extract': 'SPICE',
  cinnamon: 'SPICE', nutmeg: 'SPICE', ginger: 'SPICE', cloves: 'SPICE',
  'almond extract': 'SPICE',
  milk: 'WET', water: 'WET', cream: 'WET', 'heavy cream': 'WET',
  buttermilk: 'WET', yogurt: 'WET', 'sour cream': 'WET',
};

// Regex: optional quantity (number, fraction, mixed, or "X and Y/Z"), optional unit, then the rest is the name
const QUANTITY_PATTERN = /^(\d+\s+and\s+\d+\/\d+|\d+\s+\d+\/\d+|\d+\/\d+|\d*\.\d+|\d+)\s*/i;
const UNICODE_FRACTIONS: Record<string, number> = {
  '\u00BC': 0.25, '\u00BD': 0.5, '\u00BE': 0.75,
  '\u2153': 0.333, '\u2154': 0.667,
  '\u2155': 0.2, '\u2156': 0.4, '\u2157': 0.6, '\u2158': 0.8,
  '\u2159': 0.167, '\u215A': 0.833,
  '\u215B': 0.125, '\u215C': 0.375, '\u215D': 0.625, '\u215E': 0.875,
};

export function parseIngredient(raw: string): ParsedIngredient {
  let text = raw.trim();

  // Extract notes in parentheses
  let notes: string | null = null;
  const notesMatch = text.match(/\(([^)]+)\)/);
  if (notesMatch) {
    notes = notesMatch[1];
    text = text.replace(notesMatch[0], '').trim();
  }

  // Also extract notes after comma
  const commaIdx = text.lastIndexOf(',');
  if (commaIdx > 0) {
    const afterComma = text.slice(commaIdx + 1).trim();
    notes = notes ? `${notes}, ${afterComma}` : afterComma;
    text = text.slice(0, commaIdx).trim();
  }

  // Replace unicode fractions
  for (const [char, val] of Object.entries(UNICODE_FRACTIONS)) {
    if (text.includes(char)) {
      const before = text.indexOf(char);
      const prefix = text.slice(0, before).trim();
      const wholeNum = prefix.match(/(\d+)$/);
      if (wholeNum) {
        text = text.slice(0, before - wholeNum[0].length) +
          (parseInt(wholeNum[0]) + val).toString() +
          text.slice(before + 1);
      } else {
        text = text.replace(char, val.toString());
      }
    }
  }

  // Parse quantity
  let quantity: number | null = null;
  const qtyMatch = text.match(QUANTITY_PATTERN);
  if (qtyMatch) {
    quantity = fractionToDecimal(qtyMatch[1]);
    text = text.slice(qtyMatch[0].length).trim();
  }

  // Parse unit
  let unit: string | null = null;
  const unitPattern = new RegExp(`^(${UNITS.join('|')})\\.?\\s+`, 'i');
  const unitMatch = text.match(unitPattern);
  if (unitMatch) {
    const rawUnit = unitMatch[1].toLowerCase();
    unit = UNIT_NORMALIZE[rawUnit] || rawUnit;
    text = text.slice(unitMatch[0].length).trim();
  }

  // Remaining text is the ingredient name
  const name = text.replace(/\s+/g, ' ').trim();

  // Categorize
  const nameLower = name.toLowerCase();
  let category: IngredientCategory = 'OTHER';
  for (const [keyword, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (nameLower.includes(keyword)) {
      category = cat;
      break;
    }
  }

  return { quantity, unit, name, category, notes };
}
