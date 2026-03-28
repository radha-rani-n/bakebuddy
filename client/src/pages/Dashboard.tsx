import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRecipes } from '../hooks/useRecipes';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';

export default function Dashboard() {
  const { user } = useAuth();
  const { recipes, loading } = useRecipes();

  const recentRecipes = recipes.slice(0, 6);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-gray-600 mt-1">What are we baking today?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Link to="/import">
          <Card className="p-4 text-center hover:border-amber-300">
            <div className="text-2xl mb-2">📥</div>
            <p className="text-sm font-medium text-gray-700">Import Recipe</p>
          </Card>
        </Link>
        <Link to="/recipes">
          <Card className="p-4 text-center hover:border-amber-300">
            <div className="text-2xl mb-2">📚</div>
            <p className="text-sm font-medium text-gray-700">My Recipes</p>
          </Card>
        </Link>
        <Link to="/pans">
          <Card className="p-4 text-center hover:border-amber-300">
            <div className="text-2xl mb-2">🍳</div>
            <p className="text-sm font-medium text-gray-700">My Pans</p>
          </Card>
        </Link>
        <Link to="/import">
          <Card className="p-4 text-center hover:border-amber-300">
            <div className="text-2xl mb-2">✏️</div>
            <p className="text-sm font-medium text-gray-700">Add Recipe</p>
          </Card>
        </Link>
      </div>

      {/* Recent Recipes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Recipes</h2>
          {recipes.length > 6 && (
            <Link to="/recipes" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              View all
            </Link>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : recentRecipes.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">No recipes yet. Start by importing one!</p>
            <Link
              to="/import"
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Import your first recipe
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentRecipes.map((recipe) => (
              <Link key={recipe.id} to={`/recipes/${recipe.id}`}>
                <Card className="p-4 hover:border-amber-300">
                  {recipe.imageUrl && (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 truncate">{recipe.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {recipe.cookTime ? `${recipe.cookTime} min` : ''}
                    {recipe.cookTime && recipe.originalYield ? ' · ' : ''}
                    {recipe.originalYield ? `${recipe.originalYield} servings` : ''}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
