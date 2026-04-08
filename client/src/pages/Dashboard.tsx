import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRecipes } from '../hooks/useRecipes';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';

export default function Dashboard() {
  const { user } = useAuth();
  const { recipes, loading } = useRecipes();

  const recentRecipes = recipes.slice(0, 6);

  const greetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    return '🌙';
  };

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {greetingEmoji()} Welcome{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">What are we baking today?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { to: '/import', icon: '📥', label: 'Import Recipe' },
          { to: '/recipes', icon: '📚', label: 'My Recipes' },
          { to: '/pans', icon: '🍳', label: 'My Pans' },
          { to: '/import', icon: '✏️', label: 'Add Recipe' },
        ].map((action, i) => (
          <Link key={action.label + i} to={action.to} className={`animate-fade-in-up delay-${(i + 1) * 100}`}>
            <Card className="p-4 text-center hover:border-amber-300 hover:-translate-y-1 group">
              <div className="text-2xl mb-2 group-hover:animate-float transition-transform">{action.icon}</div>
              <p className="text-sm font-medium text-gray-700">{action.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Recipes */}
      <div className="animate-fade-in-up delay-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Recipes</h2>
          {recipes.length > 6 && (
            <Link to="/recipes" className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors">
              View all →
            </Link>
          )}
        </div>

        {loading ? (
          <Spinner />
        ) : recentRecipes.length === 0 ? (
          <Card className="p-8 text-center animate-scale-in">
            <div className="text-4xl mb-3">🧁</div>
            <p className="text-gray-500 mb-4">No recipes yet. Start by importing one!</p>
            <Link
              to="/import"
              className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              Import your first recipe →
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentRecipes.map((recipe, i) => (
              <Link key={recipe.id} to={`/recipes/${recipe.id}`} className={`animate-fade-in-up delay-${Math.min((i + 1) * 100, 700)}`}>
                <Card className="p-4 hover:border-amber-300 hover:-translate-y-1 overflow-hidden">
                  {recipe.imageUrl && (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-36 sm:h-40 object-cover rounded-lg mb-3 transition-transform duration-300 hover:scale-105"
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
