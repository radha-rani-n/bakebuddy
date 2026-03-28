import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecipes } from '../hooks/useRecipes';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function RecipeLibrary() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { recipes, loading, removeRecipe } = useRecipes(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await removeRecipe(id);
      toast.success('Recipe deleted');
    } catch {
      toast.error('Failed to delete recipe');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipe Library</h1>
          <p className="text-gray-600 mt-1">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/import">
          <Button>Import Recipe</Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary">Search</Button>
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : recipes.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">
            {query ? `No recipes found for "${query}"` : 'No recipes yet. Import your first recipe!'}
          </p>
          <Link to="/import">
            <Button>Import Recipe</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden">
              <Link to={`/recipes/${recipe.id}`}>
                {recipe.imageUrl && (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-44 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{recipe.title}</h3>
                  {recipe.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{recipe.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    {recipe.prepTime && <span>Prep: {recipe.prepTime}m</span>}
                    {recipe.cookTime && <span>Cook: {recipe.cookTime}m</span>}
                    {recipe.originalYield && <span>{recipe.originalYield} servings</span>}
                  </div>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                      {recipe.importSource}
                    </span>
                  </div>
                </div>
              </Link>
              <div className="px-4 pb-3">
                <button
                  onClick={() => handleDelete(recipe.id, recipe.title)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
