import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Navbar from './components/common/Navbar';
import Comptes from './pages/Account';
import Rapport from './pages/Rapports';
import Transaction from './pages/Transaction';
import OAuthCallback from './pages/OAuthCallback';
import { MenageProvider } from './context/MenageContext';
import AccepterInvitation  from './pages/AccepterInvitation';

// Route protection
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <MenageProvider> {/* ← ENVELOPPER TOUTE L'APPLICATION */}
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        
        {/* Routes protégées */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <Dashboard />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <Comptes />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <Transaction />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <>
                <Navbar />
                <Rapport />
              </>
            </PrivateRoute>
          }
        />
        <Route path="/invitations/accepter/:token" element={<AccepterInvitation />} />
      </Routes>
    </MenageProvider>
  );
}

export default App;