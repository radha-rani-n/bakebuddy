import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import SplashScreen from '../components/landing/SplashScreen';
import BakeBuddyLogo from '../components/ui/BakeBuddyLogo';
import BakeBuddyText from '../components/ui/BakeBuddyText';

export default function Landing() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
  }

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-warm flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-orange-50/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-orange-100/50 animate-fade-in">
        <Link to="/" className="flex items-center gap-2">
          <BakeBuddyLogo size={32} />
          <BakeBuddyText size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/signin">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20">
        <div className="text-center max-w-2xl">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-5 animate-fade-in-up">
            Your Personal <span className="gradient-text">Baking Assistant</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto animate-fade-in-up delay-200">
            Import recipes from anywhere, scale them smartly, and build your baking library.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-400">
            <Link to="/signup">
              <Button size="lg" className="animate-pulse-glow px-8">Start Baking Free</Button>
            </Link>
            <Link to="/signin">
              <Button variant="secondary" size="lg">I Have an Account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Feature Cards */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: '📥', title: 'Import Recipes', desc: 'From URLs, YouTube, TikTok, Instagram, photos, or manual entry.', color: 'from-amber-50 to-orange-50', border: 'border-amber-200' },
            { icon: '📐', title: 'Smart Scaling', desc: 'Scale by servings or pan size with intelligent adjustments.', color: 'from-rose-50 to-pink-50', border: 'border-rose-200' },
            { icon: '📚', title: 'Recipe Library', desc: 'Your personal collection with original and scaled versions.', color: 'from-violet-50 to-purple-50', border: 'border-violet-200' },
          ].map((item, i) => (
            <div key={item.title} className={`bg-linear-to-br ${item.color} p-6 rounded-2xl border ${item.border} pin-card animate-fade-in-up delay-${(i + 1) * 200}`}>
              <div className="text-4xl mb-3 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>{item.icon}</div>
              <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 bg-linear-to-br from-amber-500 to-orange-600 text-center">
        <div className="max-w-md mx-auto animate-fade-in-up">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Ready to bake smarter?</h3>
          <p className="text-amber-100 mb-8">Free to use. No credit card needed.</p>
          <Link to="/signup">
            <Button variant="secondary" size="lg" className="bg-white! text-amber-700! hover:bg-amber-50! px-8 shadow-xl font-bold">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 bg-gray-900 text-center text-sm text-gray-400">
        🧁 BakeBuddy — Made with love for bakers
      </footer>
    </div>
  );
}
