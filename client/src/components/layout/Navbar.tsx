import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import BakeBuddyLogo from '../ui/BakeBuddyLogo';
import BakeBuddyText from '../ui/BakeBuddyText';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/recipes', label: 'Recipes' },
  { to: '/import', label: 'Import' },
  { to: '/pans', label: 'My Pans' },
];

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const initial = (user?.name?.[0] || user?.email?.[0] || '?').toUpperCase();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <BakeBuddyLogo size={32} />
              <BakeBuddyText size="sm" />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/settings"
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:scale-105 ${
              location.pathname === '/settings'
                ? 'bg-amber-600 text-white ring-2 ring-amber-300'
                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
            }`}
            title="Settings & Profile"
          >
            {initial}
          </Link>
        </div>
      </div>
    </nav>
  );
}
