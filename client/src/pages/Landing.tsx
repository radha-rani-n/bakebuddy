import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';

export default function Landing() {
  const { user, loading } = useAuth();

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-800">BakeBuddy</h1>
        <div className="flex items-center gap-3">
          <Link to="/signin">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Your Personal
            <span className="text-amber-600"> Baking Assistant</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Import recipes from anywhere, scale them to your pans, and build your
            personal baking library. Smart adjustments for eggs, leavening, spices,
            bake time, and temperature.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg">Start Baking</Button>
            </Link>
            <Link to="/signin">
              <Button variant="secondary" size="lg">I Have an Account</Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-2xl mb-3">📥</div>
              <h3 className="font-semibold text-gray-900 mb-1">Import Recipes</h3>
              <p className="text-sm text-gray-600">
                From URLs, YouTube, TikTok, Instagram, photos, or type them in manually.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-2xl mb-3">📐</div>
              <h3 className="font-semibold text-gray-900 mb-1">Smart Scaling</h3>
              <p className="text-sm text-gray-600">
                Scale by servings or pan size with intelligent adjustments for every ingredient.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-2xl mb-3">📚</div>
              <h3 className="font-semibold text-gray-900 mb-1">Recipe Library</h3>
              <p className="text-sm text-gray-600">
                Save, search, and cook from your personal collection with original and scaled versions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
