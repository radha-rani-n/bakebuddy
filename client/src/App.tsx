import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageShell from './components/layout/PageShell';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import MyPans from './pages/MyPans';
import ImportRecipe from './pages/ImportRecipe';
import RecipeLibrary from './pages/RecipeLibrary';
import RecipeDetail from './pages/RecipeDetail';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageShell><Dashboard /></PageShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pans"
            element={
              <ProtectedRoute>
                <PageShell><MyPans /></PageShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/import"
            element={
              <ProtectedRoute>
                <PageShell><ImportRecipe /></PageShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes"
            element={
              <ProtectedRoute>
                <PageShell><RecipeLibrary /></PageShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes/:id"
            element={
              <ProtectedRoute>
                <PageShell><RecipeDetail /></PageShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <PageShell><Settings /></PageShell>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
