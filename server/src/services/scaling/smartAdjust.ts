type IngredientCategory = 'DRY' | 'WET' | 'LEAVENING' | 'FAT' | 'SUGAR' | 'EGG' | 'SPICE' | 'OTHER';

export function smartAdjustQuantity(
  quantity: number,
  scaleFactor: number,
  category: IngredientCategory
): number {
  switch (category) {
    case 'EGG':
      return Math.max(1, Math.round(quantity * scaleFactor));

    case 'LEAVENING':
      return quantity * Math.pow(scaleFactor, 0.7);

    case 'SPICE':
      return quantity * Math.pow(scaleFactor, 0.6);

    case 'DRY':
    case 'WET':
    case 'FAT':
    case 'SUGAR':
    case 'OTHER':
    default:
      return quantity * scaleFactor;
  }
}

export function adjustBakeTime(originalMinutes: number, scaleFactor: number): number {
  if (scaleFactor > 1) {
    return Math.round(originalMinutes * Math.pow(scaleFactor, 0.4));
  }
  return Math.round(originalMinutes * Math.pow(scaleFactor, 0.5));
}

export function adjustBakeTemp(originalTemp: number, scaleFactor: number): number {
  if (scaleFactor > 1.5) return originalTemp - 25;
  if (scaleFactor < 0.5) return originalTemp + 15;
  return originalTemp;
}
