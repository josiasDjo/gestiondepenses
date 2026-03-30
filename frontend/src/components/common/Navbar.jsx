import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome, FiPieChart, FiList, FiCreditCard } from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Tableau de bord' },
    { to: '/transactions', icon: FiList, label: 'Transactions' },
    { to: '/accounts', icon: FiCreditCard, label: 'Comptes' },
    { to: '/reports', icon: FiPieChart, label: 'Rapports' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg"></div>
              <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Gestion Dépenses
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 transition-colors duration-200"
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
            <div className="border-l pl-4 flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                <FiUser className="inline mr-1" /> {user.nom_utilisateur || 'Utilisateur'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                <FiLogOut />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center space-x-2 py-2 text-gray-700 hover:text-indigo-600"
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 py-2 text-red-600 w-full mt-2"
            >
              <FiLogOut />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;