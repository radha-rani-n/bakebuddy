import type { PanShape } from '../types/pan';

export const PAN_SHAPES: { value: PanShape; label: string }[] = [
  { value: 'ROUND', label: 'Round' },
  { value: 'SQUARE', label: 'Square' },
  { value: 'RECTANGULAR', label: 'Rectangular' },
  { value: 'LOAF', label: 'Loaf' },
  { value: 'MUFFIN_TIN', label: 'Muffin Tin' },
];

export const INGREDIENT_CATEGORIES = [
  { value: 'DRY', label: 'Dry' },
  { value: 'WET', label: 'Wet' },
  { value: 'LEAVENING', label: 'Leavening' },
  { value: 'FAT', label: 'Fat' },
  { value: 'SUGAR', label: 'Sugar' },
  { value: 'EGG', label: 'Egg' },
  { value: 'SPICE', label: 'Spice' },
  { value: 'OTHER', label: 'Other' },
];
