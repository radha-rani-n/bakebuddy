import type { Pan } from '../../types/pan';

interface PanSelectorProps {
  pans: Pan[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function PanSelector({ pans, selectedId, onChange }: PanSelectorProps) {
  return (
    <select
      value={selectedId}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
    >
      <option value="">Select a pan...</option>
      {pans.map((pan) => (
        <option key={pan.id} value={pan.id}>
          {pan.name} ({pan.volumeCubicInches.toFixed(1)} cu.in.)
        </option>
      ))}
    </select>
  );
}
