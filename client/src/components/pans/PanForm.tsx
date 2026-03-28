import { useState, type FormEvent } from 'react';
import type { Pan, PanFormData, PanShape } from '../../types/pan';
import { PAN_SHAPES } from '../../lib/constants';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface PanFormProps {
  pan?: Pan | null;
  onSubmit: (data: PanFormData) => Promise<void>;
  onCancel: () => void;
}

export default function PanForm({ pan, onSubmit, onCancel }: PanFormProps) {
  const [name, setName] = useState(pan?.name || '');
  const [shape, setShape] = useState<PanShape>(pan?.shape || 'ROUND');
  const [diameter, setDiameter] = useState(pan?.diameter?.toString() || '');
  const [width, setWidth] = useState(pan?.width?.toString() || '');
  const [length, setLength] = useState(pan?.length?.toString() || '');
  const [height, setHeight] = useState(pan?.height?.toString() || '2');
  const [cupCount, setCupCount] = useState(pan?.cupCount?.toString() || '12');
  const [cupVolume, setCupVolume] = useState(pan?.cupVolume?.toString() || '3.5');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data: PanFormData = {
      name,
      shape,
      height: parseFloat(height) || 2,
      ...(shape === 'ROUND' && { diameter: parseFloat(diameter) }),
      ...(shape === 'SQUARE' && { width: parseFloat(width) }),
      ...((shape === 'RECTANGULAR' || shape === 'LOAF') && {
        width: parseFloat(width),
        length: parseFloat(length),
      }),
      ...(shape === 'MUFFIN_TIN' && {
        cupCount: parseInt(cupCount),
        cupVolume: parseFloat(cupVolume),
      }),
    };

    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Pan Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., My 9-inch Round"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
        <select
          value={shape}
          onChange={(e) => setShape(e.target.value as PanShape)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {PAN_SHAPES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {shape === 'ROUND' && (
        <Input
          label="Diameter (inches)"
          type="number"
          step="0.5"
          value={diameter}
          onChange={(e) => setDiameter(e.target.value)}
          required
        />
      )}

      {(shape === 'SQUARE') && (
        <Input
          label="Width (inches)"
          type="number"
          step="0.5"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          required
        />
      )}

      {(shape === 'RECTANGULAR' || shape === 'LOAF') && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Width (inches)"
            type="number"
            step="0.5"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            required
          />
          <Input
            label="Length (inches)"
            type="number"
            step="0.5"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            required
          />
        </div>
      )}

      {shape === 'MUFFIN_TIN' && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Number of Cups"
            type="number"
            value={cupCount}
            onChange={(e) => setCupCount(e.target.value)}
            required
          />
          <Input
            label="Volume per Cup (cu.in.)"
            type="number"
            step="0.5"
            value={cupVolume}
            onChange={(e) => setCupVolume(e.target.value)}
            required
          />
        </div>
      )}

      {shape !== 'MUFFIN_TIN' && (
        <Input
          label="Height / Depth (inches)"
          type="number"
          step="0.5"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          required
        />
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {pan ? 'Update Pan' : 'Add Pan'}
        </Button>
      </div>
    </form>
  );
}
