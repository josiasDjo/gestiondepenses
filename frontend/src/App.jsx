import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MenageProvider, useMenage } from './context/MenageContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Navbar from './components/common/Navbar';
import Comptes from './pages/Account';
import Rapport from './pages/Rapports';
import Transaction from './pages/Transaction';
import OAuthCallback from './pages/OAuthCallback';
import AccepterInvitation  from './pages/AccepterInvitation';

// Composant wrapper pour charger les ménages après connexion
const AppContent = () => {
  const { fetchMenages } = useMenage();
  const location = useLocation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Charger les ménages UNIQUEMENT si l'utilisateur est connecté
    // et qu'on est sur une page protégée
    if (token && location.pathname !== '/login' && location.pathname !== '/register') {
      fetchMenages();
    }
  }, [token, location.pathname]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Navbar />
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <PrivateRoute>
              <Navbar />
              <Comptes />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Navbar />
              <Transaction />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Navbar />
              <Rapport />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <MenageProvider>
      <AppContent />
    </MenageProvider>
  );
}

export default App;