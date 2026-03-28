const FRACTION_MAP: [number, string][] = [
  [0.125, '1/8'],
  [0.25, '1/4'],
  [0.333, '1/3'],
  [0.375, '3/8'],
  [0.5, '1/2'],
  [0.625, '5/8'],
  [0.667, '2/3'],
  [0.75, '3/4'],
  [0.875, '7/8'],
];

export function decimalToFraction(value: number): string {
  if (value <= 0) return '0';

  const whole = Math.floor(value);
  const decimal = value - whole;

  if (decimal < 0.0625) {
    return whole.toString();
  }

  let closestFraction = '';
  let closestDiff = Infinity;

  for (const [dec, frac] of FRACTION_MAP) {
    const diff = Math.abs(decimal - dec);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestFraction = frac;
    }
  }

  if (whole === 0) return closestFraction;
  return `${whole} ${closestFraction}`;
}

export function fractionToDecimal(fraction: string): number {
  const trimmed = fraction.trim();

  // Handle mixed numbers like "2 1/2"
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
  }

  // Handle simple fractions like "1/2"
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
  }

  // Handle whole numbers
  return parseFloat(trimmed) || 0;
}
