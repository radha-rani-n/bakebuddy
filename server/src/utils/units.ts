// Volume conversions to ml
const TO_ML: Record<string, number> = {
  tsp: 4.929,
  tbsp: 14.787,
  cup: 236.588,
  oz: 29.574,
  ml: 1,
  L: 1000,
  pt: 473.176,
  qt: 946.353,
  gal: 3785.41,
};

// Weight conversions to grams
const TO_GRAMS: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

export function convertUnit(value: number, fromUnit: string, toUnit: string): number | null {
  // Check volume
  if (TO_ML[fromUnit] && TO_ML[toUnit]) {
    return (value * TO_ML[fromUnit]) / TO_ML[toUnit];
  }

  // Check weight
  if (TO_GRAMS[fromUnit] && TO_GRAMS[toUnit]) {
    return (value * TO_GRAMS[fromUnit]) / TO_GRAMS[toUnit];
  }

  return null;
}
