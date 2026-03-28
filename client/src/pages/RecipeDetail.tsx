import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe } from '../api/recipes';
import { scaleRecipe } from '../api/scaling';
import { usePans } from '../hooks/usePans';
import type { Recipe, ScaledRecipe } from '../types/recipe';
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
  const [scaleMethod, setScaleMethod] = useState<'servings' | 'pan'>('servings');
  const [targetServings, setTargetServings] = useState('');
  const [targetPanId, setTargetPanId] = useState('');
  const [activeScaled, setActiveScaled] = useState<ScaledRecipe | null>(null);

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
  }, [id, navigate]);

  const handleScale = async () => {
    if (!recipe) return;
    setScaling(true);
    try {
      const { scaledRecipe: scaled } = await scaleRecipe(
        recipe.id,
        scaleMethod,
        scaleMethod === 'servings' ? parseInt(targetServings) : undefined,
        scaleMethod === 'pan' ? targetPanId : undefined
      );
      setActiveScaled(scaled);
      toast.success(`Scaled ${scaled.scaleFactor.toFixed(2)}x`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Scaling failed');
    } finally {
      setScaling(false);
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (!recipe) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/recipes')} className="text-sm text-amber-600 hover:text-amber-700 mb-2 block">
          &larr; Back to Library
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
        {recipe.description && <p className="text-gray-600 mt-2">{recipe.description}</p>}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
          {recipe.prepTime && <span>Prep: {recipe.prepTime} min</span>}
          {recipe.cookTime && <span>Cook: {recipe.cookTime} min</span>}
          {recipe.bakeTemp && <span>{recipe.bakeTemp}°{recipe.bakeTempUnit}</span>}
          {recipe.originalYield && <span>{recipe.originalYield} servings</span>}
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
            {recipe.importSource}
          </span>
        </div>
      </div>

      {recipe.imageUrl && (
        <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-64 object-cover rounded-xl mb-6" />
      )}

      {/* Scale Controls */}
      <Card className="p-4 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Scale Recipe</h2>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={scaleMethod === 'servings'}
              onChange={() => setScaleMethod('servings')}
              className="text-amber-600"
            />
            <span className="text-sm">By Servings</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={scaleMethod === 'pan'}
              onChange={() => setScaleMethod('pan')}
              className="text-amber-600"
            />
            <span className="text-sm">By Pan Size</span>
          </label>
        </div>

        <div className="flex gap-3 items-end">
          {scaleMethod === 'servings' ? (
            <div className="flex-1">
              <Input
                label="Target Servings"
                type="number"
                min="1"
                value={targetServings}
                onChange={(e) => setTargetServings(e.target.value)}
              />
            </div>
          ) : (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Pan</label>
              <PanSelector pans={pans} selectedId={targetPanId} onChange={setTargetPanId} />
            </div>
          )}
          <Button onClick={handleScale} loading={scaling} disabled={
            (scaleMethod === 'servings' && !targetServings) ||
            (scaleMethod === 'pan' && !targetPanId)
          }>
            Scale
          </Button>
        </div>
      </Card>

      {/* Scaled adjustments banner */}
      {activeScaled && (
        <Card className="p-4 mb-6 bg-amber-50 border-amber-200">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingredients */}
        <Card className="p-4 lg:col-span-1">
          <h2 className="font-semibold text-gray-900 mb-3">Ingredients</h2>
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
          <h2 className="font-semibold text-gray-900 mb-3">Instructions</h2>
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

      {/* Saved scaled versions */}
      {recipe.scaledRecipes && recipe.scaledRecipes.length > 0 && (
        <Card className="p-4 mt-6">
          <h2 className="font-semibold text-gray-900 mb-3">Saved Scaled Versions</h2>
          <div className="space-y-2">
            {recipe.scaledRecipes.map((sr) => (
              <button
                key={sr.id}
                onClick={() => setActiveScaled(sr)}
                className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:border-amber-300 transition-colors text-sm"
              >
                <span className="font-medium text-gray-900">{sr.scaleFactor.toFixed(2)}x</span>
                <span className="text-gray-500 ml-2">
                  {sr.scaleMethod === 'servings' ? `${sr.targetYield} servings` : sr.targetPanName}
                </span>
                <span className="text-gray-400 ml-2">
                  {new Date(sr.createdAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
