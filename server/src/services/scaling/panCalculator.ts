interface PanDimensions {
  shape: string;
  diameter?: number | null;
  width?: number | null;
  length?: number | null;
  height: number;
  cupCount?: number | null;
  cupVolume?: number | null;
}

export function calculatePanVolume(pan: PanDimensions): number {
  switch (pan.shape) {
    case 'ROUND':
      if (!pan.diameter) throw new Error('Round pan requires diameter');
      return Math.PI * Math.pow(pan.diameter / 2, 2) * pan.height;

    case 'SQUARE':
      if (!pan.width) throw new Error('Square pan requires width');
      return Math.pow(pan.width, 2) * pan.height;

    case 'RECTANGULAR':
    case 'LOAF':
      if (!pan.width || !pan.length) throw new Error('Rectangular/loaf pan requires width and length');
      return pan.width * pan.length * pan.height;

    case 'MUFFIN_TIN':
      if (!pan.cupCount || !pan.cupVolume) throw new Error('Muffin tin requires cupCount and cupVolume');
      return pan.cupCount * pan.cupVolume;

    default:
      throw new Error(`Unknown pan shape: ${pan.shape}`);
  }
}
