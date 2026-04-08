import { useState } from 'react';
import ChefAnimation from './ChefAnimation';
import BakeBuddyLogo from '../ui/BakeBuddyLogo';
import BakeBuddyText from '../ui/BakeBuddyText';

interface SplashScreenProps {
  onEnter: () => void;
}

export default function SplashScreen({ onEnter }: SplashScreenProps) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 700);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${
        exiting ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
      }`}
      style={{
        background: 'linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 40%, #FED7AA 80%, #FDBA74 100%)',
      }}
    >
      {/* Soft glow */}
      <div
        className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)' }}
      />

      {/* Floating pastries background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-[6%] left-[6%] text-3xl animate-drift delay-200 opacity-25">🍰</span>
        <span className="absolute top-[10%] right-[8%] text-2xl animate-float-slow delay-500 opacity-20">🍪</span>
        <span className="absolute bottom-[12%] left-[8%] text-2xl animate-drift delay-700 opacity-15">🥐</span>
        <span className="absolute bottom-[8%] right-[6%] text-3xl animate-float delay-300 opacity-20">🧁</span>
        <span className="absolute top-[40%] left-[3%] text-xl animate-sparkle delay-1000 opacity-25">✨</span>
        <span className="absolute top-[18%] right-[4%] text-xl animate-sparkle delay-1500 opacity-25">✨</span>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Chef coming out from bottom */}
        <ChefAnimation />

        {/* Logo + name */}
        <div className="flex items-center gap-3 mt-4 animate-hero-slide delay-600">
          <BakeBuddyLogo size={44} />
          <BakeBuddyText size="xl" />
        </div>
        <p
          className="text-amber-800/50 mt-2 text-sm sm:text-base animate-hero-slide delay-800 text-center font-medium"
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          Fresh out of the oven, just for you!
        </p>

        {/* Enter button */}
        <button
          onClick={handleEnter}
          className="mt-8 group animate-hero-slide delay-1200"
        >
          <div
            className="text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 animate-pulse-glow flex items-center gap-3"
            style={{
              fontFamily: "'Baloo 2', cursive",
              background: 'linear-gradient(135deg, #F59E0B, #EA580C)',
            }}
          >
            <span>Let's Bake 🍰</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </button>
      </div>
    </div>
  );
}
