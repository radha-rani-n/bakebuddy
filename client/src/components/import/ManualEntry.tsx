import { useState, FormEvent } from 'react';
import { RecipeFormData, Ingredient, Step, IngredientCategory } from '../../types/recipe';
import { PanShape } from '../../types/pan';
import { PAN_SHAPES, INGREDIENT_CATEGORIES } from '../../lib/constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

interface ManualEntryProps {
  onSave: (data: RecipeFormData) => Promise<void>;
  initialData?: Partial<RecipeFormData>;
}

const emptyIngredient = (): Ingredient => ({
  sortOrder: 0,
  quantity: null,
  unit: null,
  name: '',
  category: 'OTHER',
  notes: null,
});

const emptyStep = (): Step => ({
  sortOrder: 0,
  text: '',
});

export default function ManualEntry({ onSave, initialData }: ManualEntryProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [originalYield, setOriginalYield] = useState(initialData?.originalYield?.toString() || '');
  const [prepTime, setPrepTime] = useState(initialData?.prepTime?.toString() || '');
  const [cookTime, setCookTime] = useState(initialData?.cookTime?.toString() || '');
  const [bakeTemp, setBakeTemp] = useState(initialData?.bakeTemp?.toString() || '');
  const [panShape, setPanShape] = useState<PanShape | ''>(initialData?.originalPanShape || '');
  const [panDiameter, setPanDiameter] = useState(initialData?.originalPanDiameter?.toString() || '');
  const [panWidth, setPanWidth] = useState(initialData?.originalPanWidth?.toString() || '');
  const [panLength, setPanLength] = useState(initialData?.originalPanLength?.toString() || '');
  const [panHeight, setPanHeight] = useState(initialData?.originalPanHeight?.toString() || '2');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients || [emptyIngredient()]
  );
  const [steps, setSteps] = useState<Step[]>(
    initialData?.steps || [emptyStep()]
  );
  const [loading, setLoading] = useState(false);

  const addIngredient = () => setIngredients([...ingredients, emptyIngredient()]);
  const removeIngredient = (idx: number) => setIngredients(ingredients.filter((_, i) => i !== idx));

  const updateIngredient = (idx: number, field: string, value: any) => {
    setIngredients(ingredients.map((ing, i) => i === idx ? { ...ing, [field]: value } : ing));
  };

  const addStep = () => setSteps([...steps, emptyStep()]);
  const removeStep = (idx: number) => setSteps(steps.filter((_, i) => i !== idx));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data: RecipeFormData = {
      title,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      importSource: initialData?.importSource || 'MANUAL',
      originalYield: originalYield ? parseInt(originalYield) : undefined,
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      cookTime: cookTime ? parseInt(cookTime) : undefined,
      bakeTemp: bakeTemp ? parseInt(bakeTemp) : undefined,
      ...(panShape && {
        originalPanShape: panShape as PanShape,
        ...(panShape === 'ROUND' && { originalPanDiameter: parseFloat(panDiameter) }),
        ...((panShape === 'RECTANGULAR' || panShape === 'LOAF' || panShape === 'SQUARE') && {
          originalPanWidth: parseFloat(panWidth),
        }),
        ...((panShape === 'RECTANGULAR' || panShape === 'LOAF') && {
          originalPanLength: parseFloat(panLength),
        }),
        originalPanHeight: parseFloat(panHeight) || 2,
      }),
      ingredients: ingredients
        .filter((ing) => ing.name.trim())
        .map((ing, idx) => ({ ...ing, sortOrder: idx })),
      steps: steps
        .filter((step) => step.text.trim())
        .map((step, idx) => ({ ...step, sortOrder: idx })),
    };

    try {
      await onSave(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Basic Info</h3>
        <Input label="Recipe Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <Input label="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Input label="Servings" type="number" value={originalYield} onChange={(e) => setOriginalYield(e.target.value)} />
          <Input label="Prep (min)" type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
          <Input label="Cook (min)" type="number" value={cookTime} onChange={(e) => setCookTime(e.target.value)} />
          <Input label="Bake Temp (°F)" type="number" value={bakeTemp} onChange={(e) => setBakeTemp(e.target.value)} />
        </div>
      </Card>

      {/* Original Pan (optional) */}
      <Card className="p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Original Pan Size (optional)</h3>
        <p className="text-xs text-gray-500">Needed if you want to scale by pan size</p>
        <select
          value={panShape}
          onChange={(e) => setPanShape(e.target.value as PanShape | '')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">None</option>
          {PAN_SHAPES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {panShape === 'ROUND' && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Diameter (in)" type="number" step="0.5" value={panDiameter} onChange={(e) => setPanDiameter(e.target.value)} />
            <Input label="Height (in)" type="number" step="0.5" value={panHeight} onChange={(e) => setPanHeight(e.target.value)} />
          </div>
        )}
        {(panShape === 'SQUARE') && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Width (in)" type="number" step="0.5" value={panWidth} onChange={(e) => setPanWidth(e.target.value)} />
            <Input label="Height (in)" type="number" step="0.5" value={panHeight} onChange={(e) => setPanHeight(e.target.value)} />
          </div>
        )}
        {(panShape === 'RECTANGULAR' || panShape === 'LOAF') && (
          <div className="grid grid-cols-3 gap-3">
            <Input label="Width (in)" type="number" step="0.5" value={panWidth} onChange={(e) => setPanWidth(e.target.value)} />
            <Input label="Length (in)" type="number" step="0.5" value={panLength} onChange={(e) => setPanLength(e.target.value)} />
            <Input label="Height (in)" type="number" step="0.5" value={panHeight} onChange={(e) => setPanHeight(e.target.value)} />
          </div>
        )}
      </Card>

      {/* Ingredients */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Ingredients</h3>
          <Button type="button" variant="ghost" size="sm" onClick={addIngredient}>+ Add</Button>
        </div>
        {ingredients.map((ing, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <div className="w-16">
              <Input
                placeholder="Qty"
                type="number"
                step="0.25"
                value={ing.quantity?.toString() || ''}
                onChange={(e) => updateIngredient(idx, 'quantity', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
            <div className="w-16">
              <Input
                placeholder="Unit"
                value={ing.unit || ''}
                onChange={(e) => updateIngredient(idx, 'unit', e.target.value || null)}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Ingredient name"
                value={ing.name}
                onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
              />
            </div>
            <div className="w-24">
              <select
                value={ing.category}
                onChange={(e) => updateIngredient(idx, 'category', e.target.value as IngredientCategory)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {INGREDIENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            {ingredients.length > 1 && (
              <button type="button" onClick={() => removeIngredient(idx)} className="text-red-400 hover:text-red-600 mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </Card>

      {/* Steps */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Instructions</h3>
          <Button type="button" variant="ghost" size="sm" onClick={addStep}>+ Add Step</Button>
        </div>
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-sm font-medium flex items-center justify-center mt-1">
              {idx + 1}
            </span>
            <div className="flex-1">
              <textarea
                value={step.text}
                onChange={(e) => setSteps(steps.map((s, i) => i === idx ? { ...s, text: e.target.value } : s))}
                rows={2}
                placeholder={`Step ${idx + 1}...`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {steps.length > 1 && (
              <button type="button" onClick={() => removeStep(idx)} className="text-red-400 hover:text-red-600 mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={loading} size="lg">
          Save Recipe
        </Button>
      </div>
    </form>
  );
}
