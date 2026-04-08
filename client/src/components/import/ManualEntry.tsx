import { useState, type FormEvent } from 'react';
import type { RecipeFormData, Ingredient, Step, IngredientCategory } from '../../types/recipe';
import type { PanShape } from '../../types/pan';
import { INGREDIENT_CATEGORIES } from '../../lib/constants';
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
      sourceUrl: initialData?.sourceUrl,
      importSource: initialData?.importSource || 'MANUAL',
      originalYield: originalYield ? parseInt(originalYield) : undefined,
      prepTime: prepTime ? parseInt(prepTime) : undefined,
      cookTime: cookTime ? parseInt(cookTime) : undefined,
      bakeTemp: bakeTemp ? parseInt(bakeTemp) : undefined,
      ...(initialData?.originalPanShape && {
        originalPanShape: initialData.originalPanShape as PanShape,
        originalPanDiameter: initialData.originalPanDiameter,
        originalPanWidth: initialData.originalPanWidth,
        originalPanLength: initialData.originalPanLength,
        originalPanHeight: initialData.originalPanHeight || 2,
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

      {/* Detected Pan Size (read-only) */}
      {initialData?.originalPanShape && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1">Detected Pan Size</h3>
          <p className="text-sm text-gray-600">
            {initialData.originalPanShape === 'ROUND' && `${initialData.originalPanDiameter}" Round × ${initialData.originalPanHeight || 2}" deep`}
            {initialData.originalPanShape === 'SQUARE' && `${initialData.originalPanWidth}" × ${initialData.originalPanWidth}" Square × ${initialData.originalPanHeight || 2}" deep`}
            {(initialData.originalPanShape === 'RECTANGULAR' || initialData.originalPanShape === 'LOAF') && `${initialData.originalPanWidth}" × ${initialData.originalPanLength}" ${initialData.originalPanShape === 'LOAF' ? 'Loaf' : 'Rectangular'} × ${initialData.originalPanHeight || 2}" deep`}
            {initialData.originalPanShape === 'MUFFIN_TIN' && 'Muffin Tin'}
          </p>
          <p className="text-xs text-gray-400 mt-1">You can edit this later on the recipe page.</p>
        </Card>
      )}

      {/* Ingredients */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Ingredients</h3>
          <Button type="button" variant="ghost" size="sm" onClick={addIngredient}>+ Add</Button>
        </div>
        {ingredients.map((ing, idx) => (
          <div key={idx} className="border border-gray-100 rounded-lg p-2 sm:p-0 sm:border-0">
            <div className="grid grid-cols-[1fr_1fr_auto] sm:flex gap-2 items-start">
              <div className="sm:w-16">
                <Input
                  placeholder="Qty"
                  type="number"
                  step="0.25"
                  value={ing.quantity?.toString() || ''}
                  onChange={(e) => updateIngredient(idx, 'quantity', e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div className="sm:w-16">
                <Input
                  placeholder="Unit"
                  value={ing.unit || ''}
                  onChange={(e) => updateIngredient(idx, 'unit', e.target.value || null)}
                />
              </div>
              {ingredients.length > 1 && (
                <button type="button" onClick={() => removeIngredient(idx)} className="sm:hidden text-red-400 hover:text-red-600 mt-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="col-span-2 sm:flex-1">
                <Input
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                />
              </div>
              <div className="col-span-1 sm:w-24">
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
                <button type="button" onClick={() => removeIngredient(idx)} className="hidden sm:block text-red-400 hover:text-red-600 mt-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
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
