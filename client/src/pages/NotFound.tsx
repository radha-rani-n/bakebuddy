import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-amber-600 mb-4">404</h1>
        <p className="text-gray-600 mb-6">Page not found</p>
        <Link to="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
