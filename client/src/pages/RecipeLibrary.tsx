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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            📚 Recipe Library
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
        <Link to="/import">
          <Button>+ Import Recipe</Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6 animate-fade-in-up delay-100">
        <div className="flex gap-2">
          <Input
            placeholder="Search your recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary">Search</Button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : recipes.length === 0 ? (
        <Card className="p-10 text-center animate-scale-in">
          <div className="text-5xl mb-4">🧑‍🍳</div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {query ? `No recipes found for "${query}"` : 'Your recipe collection is empty'}
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            {query ? 'Try a different search term' : 'Import your first recipe and start building your baking library!'}
          </p>
          {!query && (
            <Link to="/import">
              <Button size="lg">Import Your First Recipe</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe, i) => (
            <Card key={recipe.id} className={`overflow-hidden group hover:-translate-y-1 animate-fade-in-up delay-${Math.min((i + 1) * 100, 700)}`}>
              <Link to={`/recipes/${recipe.id}`}>
                {recipe.imageUrl ? (
                  <div className="overflow-hidden">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-36 sm:h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="w-full h-36 sm:h-44 bg-linear-to-br from-amber-100 via-amber-50 to-orange-100 flex items-center justify-center">
                    <span className="text-4xl opacity-50">🧁</span>
                  </div>
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
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
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
