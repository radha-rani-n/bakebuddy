import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import Input from '../ui/Input';
import BakeBuddyLogo from '../ui/BakeBuddyLogo';
import BakeBuddyText from '../ui/BakeBuddyText';
import toast from 'react-hot-toast';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password, name || undefined);
        toast.success('Account created! Welcome to BakeBuddy!');
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
      }
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            <BakeBuddyLogo size={36} />
            <BakeBuddyText size="lg" />
          </Link>
          <p className="text-gray-600 mt-2">
            {mode === 'signin' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 animate-fade-in-up delay-200">
          {mode === 'signup' && (
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
            required
            minLength={mode === 'signup' ? 6 : undefined}
          />

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <Link to="/signup" className="text-amber-600 hover:text-amber-700 font-medium">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/signin" className="text-amber-600 hover:text-amber-700 font-medium">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
