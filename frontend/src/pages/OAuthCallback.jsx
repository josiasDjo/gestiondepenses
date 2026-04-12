import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        toast.success('Connexion avec Google réussie !');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Erreur lors de la connexion');
        navigate('/login');
      }
    } else {
      const error = params.get('error');
      if (error) {
        toast.error('Échec de l\'authentification Google');
      }
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-primary">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;