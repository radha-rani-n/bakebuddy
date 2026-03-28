export type PanShape = 'ROUND' | 'SQUARE' | 'RECTANGULAR' | 'LOAF' | 'MUFFIN_TIN';

export interface Pan {
  id: string;
  userId: string;
  name: string;
  shape: PanShape;
  diameter: number | null;
  width: number | null;
  length: number | null;
  height: number;
  cupCount: number | null;
  cupVolume: number | null;
  volumeCubicInches: number;
  createdAt: string;
  updatedAt: string;
}

export interface PanFormData {
  name: string;
  shape: PanShape;
  diameter?: number;
  width?: number;
  length?: number;
  height: number;
  cupCount?: number;
  cupVolume?: number;
}
