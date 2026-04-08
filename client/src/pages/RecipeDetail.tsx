import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, updateRecipePan } from '../api/recipes';
import { scaleRecipe, getScalableIngredients } from '../api/scaling';
import { usePans } from '../hooks/usePans';
import type { Recipe, ScaledRecipe } from '../types/recipe';
import type { PanShape } from '../types/pan';
import { PAN_SHAPES } from '../lib/constants';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import PanSelector from '../components/pans/PanSelector';
import toast from 'react-hot-toast';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pans } = usePans();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [scaling, setScaling] = useState(false);
  const [scaleMethod, setScaleMethod] = useState<'servings' | 'pan' | 'ingredient'>('servings');
  const [targetServings, setTargetServings] = useState('');
  const [targetPanId, setTargetPanId] = useState('');
  const [scalableIngs, setScalableIngs] = useState<{ name: string; quantity: number; unit: string | null; category: string }[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [haveQuantity, setHaveQuantity] = useState('');
  const [haveUnit, setHaveUnit] = useState('g');
  const [activeScaled, setActiveScaled] = useState<ScaledRecipe | null>(null);
  const [editingPan, setEditingPan] = useState(false);
  const [panShape, setPanShape] = useState<PanShape | ''>('');
  const [panDiameter, setPanDiameter] = useState('');
  const [panWidth, setPanWidth] = useState('');
  const [panLength, setPanLength] = useState('');
  const [panHeight, setPanHeight] = useState('2');
  const [savingPan, setSavingPan] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRecipe(id)
      .then(({ recipe }) => {
        setRecipe(recipe);
        if (recipe.originalYield) setTargetServings(recipe.originalYield.toString());
      })
      .catch(() => {
        toast.error('Recipe not found');
        navigate('/recipes');
      })
      .finally(() => setLoading(false));
    // Load scalable ingredients
    getScalableIngredients(id).then(({ ingredients }) => {
      setScalableIngs(ingredients);
      if (ingredients.length > 0) setSelectedIngredient(ingredients[0].name);
    }).catch(() => {});
  }, [id, navigate]);

  const handleScale = async () => {
    if (!recipe) return;
    setScaling(true);
    try {
      const { scaledRecipe: scaled } = await scaleRecipe(
        recipe.id,
        scaleMethod,
        scaleMethod === 'servings' ? parseInt(targetServings) : undefined,
        scaleMethod === 'pan' ? targetPanId : undefined,
        scaleMethod === 'ingredient' ? selectedIngredient : undefined,
        scaleMethod === 'ingredient' ? parseFloat(haveQuantity) : undefined,
        scaleMethod === 'ingredient' ? haveUnit : undefined
      );
      setActiveScaled(scaled);
      toast.success(`Scaled ${scaled.scaleFactor.toFixed(2)}x`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Scaling failed');
    } finally {
      setScaling(false);
    }
  };

  const openPanEditor = () => {
    if (recipe) {
      setPanShape((recipe.originalPanShape as PanShape) || '');
      setPanDiameter(recipe.originalPanDiameter?.toString() || '');
      setPanWidth(recipe.originalPanWidth?.toString() || '');
      setPanLength(recipe.originalPanLength?.toString() || '');
      setPanHeight(recipe.originalPanHeight?.toString() || '2');
    }
    setEditingPan(true);
  };

  const handleSavePan = async () => {
    if (!recipe) return;
    setSavingPan(true);
    try {
      const { recipe: updated } = await updateRecipePan(recipe.id, {
        originalPanShape: panShape || null,
        ...(panShape === 'ROUND' && { originalPanDiameter: parseFloat(panDiameter) || null }),
        ...((panShape === 'SQUARE' || panShape === 'RECTANGULAR' || panShape === 'LOAF') && {
          originalPanWidth: parseFloat(panWidth) || null,
        }),
        ...((panShape === 'RECTANGULAR' || panShape === 'LOAF') && {
          originalPanLength: parseFloat(panLength) || null,
        }),
        originalPanHeight: parseFloat(panHeight) || 2,
      });
      setRecipe(updated);
      setEditingPan(false);
      toast.success('Pan size updated');
    } catch {
      toast.error('Failed to update pan size');
    } finally {
      setSavingPan(false);
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (!recipe) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 animate-fade-in-up">
        <button onClick={() => navigate('/recipes')} className="text-sm text-amber-600 hover:text-amber-700 mb-2 block transition-colors">
          &larr; Back to Library
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{recipe.title}</h1>
        {recipe.description && <p className="text-gray-600 mt-2">{recipe.description}</p>}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
          {recipe.prepTime && <span>Prep: {recipe.prepTime} min</span>}
          {recipe.cookTime && <span>Cook: {recipe.cookTime} min</span>}
          {recipe.bakeTemp && <span>{recipe.bakeTemp}°{recipe.bakeTempUnit}</span>}
          {recipe.originalYield && <span>{recipe.originalYield} servings</span>}
          {recipe.sourceUrl ? (
            <a
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full hover:bg-amber-200 transition-colors"
            >
              {recipe.importSource} ↗
            </a>
          ) : (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
              {recipe.importSource}
            </span>
          )}
        </div>
      </div>

      {recipe.imageUrl && (
        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-48 sm:h-64 object-cover rounded-xl mb-6 animate-fade-in shadow-lg" />
      )}

      {/* Original Pan Info */}
      <Card className="p-4 mb-6 animate-fade-in-up delay-100">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-900">Original Pan Size</h2>
          <Button variant="ghost" size="sm" onClick={openPanEditor}>
            {recipe.originalPanShape ? 'Edit' : 'Add Pan'}
          </Button>
        </div>
        {editingPan ? (
          <div className="space-y-3">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Diameter (in)" type="number" step="0.5" value={panDiameter} onChange={(e) => setPanDiameter(e.target.value)} />
                <Input label="Height (in)" type="number" step="0.5" value={panHeight} onChange={(e) => setPanHeight(e.target.value)} />
              </div>
            )}
            {panShape === 'SQUARE' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Width (in)" type="number" step="0.5" value={panWidth} onChange={(e) => setPanWidth(e.target.value)} />
                <Input label="Height (in)" type="number" step="0.5" value={panHeight} onChange={(e) => setPanHeight(e.target.value)} />
              </div>
            )}
            {(panShape === 'RECTANGULAR' || panShape === 'LOAF') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input label="Width (in)" type="number" step="0.5" value={panWidth} onChange={(e) => setPanWidth(e.target.value)} />
                <Input label="Length (in)" type="number" step="0.5" value={panLength} onChange={(e) => setPanLength(e.target.value)} />
                <Input label="Height (in)" type="number" step="0.5" value={panHeight} onChange={(e) => setPanHeight(e.target.value)} />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditingPan(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSavePan} loading={savingPan}>Save</Button>
            </div>
          </div>
        ) : recipe.originalPanShape ? (
          <p className="text-sm text-gray-600">
            {recipe.originalPanShape === 'ROUND' && `${recipe.originalPanDiameter}" round × ${recipe.originalPanHeight}" deep`}
            {recipe.originalPanShape === 'SQUARE' && `${recipe.originalPanWidth}" × ${recipe.originalPanWidth}" × ${recipe.originalPanHeight}" deep`}
            {(recipe.originalPanShape === 'RECTANGULAR' || recipe.originalPanShape === 'LOAF') && `${recipe.originalPanWidth}" × ${recipe.originalPanLength}" × ${recipe.originalPanHeight}" deep`}
            {recipe.originalPanVolume && <span className="text-amber-700 font-medium ml-2">({recipe.originalPanVolume.toFixed(1)} cu in)</span>}
          </p>
        ) : (
          <p className="text-sm text-gray-400">No pan size set. Add one to enable pan-based scaling.</p>
        )}
      </Card>

      {/* Scale Controls */}
      <Card className="p-4 mb-6 animate-fade-in-up delay-200">
        <h2 className="font-semibold text-gray-900 mb-3">📐 Scale Recipe</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { value: 'servings' as const, label: 'By Servings', icon: '🔢' },
            { value: 'pan' as const, label: 'By Pan', icon: '🍳' },
            { value: 'ingredient' as const, label: 'By What I Have', icon: '🧈' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setScaleMethod(opt.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                scaleMethod === opt.value
                  ? 'bg-amber-100 text-amber-800 shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          {scaleMethod === 'servings' && (
            <div className="flex-1 w-full">
              <Input
                label="Target Servings"
                type="number"
                min="1"
                value={targetServings}
                onChange={(e) => setTargetServings(e.target.value)}
              />
            </div>
          )}
          {scaleMethod === 'pan' && (
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Pan</label>
              <PanSelector pans={pans} selectedId={targetPanId} onChange={setTargetPanId} />
            </div>
          )}
          {scaleMethod === 'ingredient' && (
            <div className="flex-1 w-full space-y-3">
              <p className="text-xs text-gray-500">Pick an ingredient and enter how much you have — we'll scale the whole recipe to match.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient</label>
                <select
                  value={selectedIngredient}
                  onChange={(e) => {
                    setSelectedIngredient(e.target.value);
                    const ing = scalableIngs.find(i => i.name === e.target.value);
                    if (ing?.unit) setHaveUnit(ing.unit);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {scalableIngs.map((ing) => (
                    <option key={ing.name} value={ing.name}>
                      {ing.name} ({ing.quantity} {ing.unit || 'pcs'} in recipe)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    label="I have"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="Amount"
                    value={haveQuantity}
                    onChange={(e) => setHaveQuantity(e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={haveUnit}
                    onChange={(e) => setHaveUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="oz">oz</option>
                    <option value="lb">lb</option>
                    <option value="cup">cup</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                    <option value="ml">ml</option>
                    <option value="stick">stick</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          <Button onClick={handleScale} loading={scaling} disabled={
            (scaleMethod === 'servings' && !targetServings) ||
            (scaleMethod === 'pan' && !targetPanId) ||
            (scaleMethod === 'ingredient' && (!selectedIngredient || !haveQuantity))
          }>
            Scale
          </Button>
        </div>
      </Card>

      {/* Scaled adjustments banner */}
      {activeScaled && (
        <Card className="p-4 mb-6 bg-amber-50 border-amber-200 animate-scale-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-amber-800">
                Scaled {activeScaled.scaleFactor.toFixed(2)}x
                {activeScaled.targetPanName && ` — ${activeScaled.targetPanName}`}
                {activeScaled.targetYield && ` — ${activeScaled.targetYield} servings`}
              </p>
              <div className="flex gap-4 mt-1 text-sm text-amber-700">
                {activeScaled.adjustedBakeTime && (
                  <span>Bake time: {activeScaled.adjustedBakeTime} min</span>
                )}
                {activeScaled.adjustedBakeTemp && (
                  <span>Bake temp: {activeScaled.adjustedBakeTemp}°F</span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveScaled(null)}>
              Clear
            </Button>
          </div>
        </Card>
      )}

      {/* Saved scaled versions — shown before ingredients for visibility */}
      {recipe.scaledRecipes && recipe.scaledRecipes.length > 0 && (
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Saved Scaled Versions</h2>
          <div className="flex flex-wrap gap-2">
            {recipe.scaledRecipes.map((sr) => (
              <button
                key={sr.id}
                onClick={() => setActiveScaled(sr)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all hover:-translate-y-0.5 ${
                  activeScaled?.id === sr.id
                    ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-sm'
                    : 'border-gray-200 hover:border-amber-300 text-gray-700'
                }`}
              >
                <span className="font-medium">{sr.scaleFactor.toFixed(2)}x</span>
                <span className="text-gray-500 ml-1.5 text-xs">
                  {sr.scaleMethod === 'servings' ? `${sr.targetYield} servings` : sr.targetPanName}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-300">
        {/* Ingredients */}
        <Card className="p-4 lg:col-span-1">
          <h2 className="font-semibold text-gray-900 mb-3">🥄 Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, idx) => {
              const scaled = activeScaled?.scaledIngredients[idx];
              return (
                <li key={ing.id || idx} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      {ing.quantity && <span className="font-medium">{ing.quantity} </span>}
                      {ing.unit && <span>{ing.unit} </span>}
                      {ing.name}
                      {ing.notes && <span className="text-gray-400"> ({ing.notes})</span>}
                    </span>
                    {scaled?.scaledQty && (
                      <span className="text-amber-700 font-medium ml-2 whitespace-nowrap">
                        → {scaled.scaledQty.toFixed(2)} {scaled.unit || ''}
                        {scaled.scaledGrams != null && (
                          <span className="text-amber-500 text-xs ml-1">({scaled.scaledGrams}g)</span>
                        )}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Steps */}
        <Card className="p-4 lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-3">👩‍🍳 Instructions</h2>
          <ol className="space-y-4">
            {(activeScaled ? activeScaled.scaledSteps : recipe.steps).map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 text-amber-800 text-sm font-medium flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="text-sm text-gray-700 pt-1">{step.text}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>

    </div>
  );
}
