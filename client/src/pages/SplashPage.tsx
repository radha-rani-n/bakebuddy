import { useNavigate } from 'react-router-dom';
import SplashScreen from '../components/landing/SplashScreen';

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <SplashScreen onEnter={() => navigate(-1)} />
  );
}
