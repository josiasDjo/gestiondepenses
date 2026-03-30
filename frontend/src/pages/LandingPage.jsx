import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiShield, FiUsers, FiArrowRight, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';

const LandingPage = () => {
  const features = [
    {
      icon: FiTrendingUp,
      title: 'Suivi des dépenses',
      description: 'Suivez toutes vos dépenses en temps réel et identifiez vos habitudes de consommation'
    },
    {
      icon: FiBarChart2,
      title: 'Statistiques détaillées',
      description: 'Visualisez vos finances avec des graphiques et rapports personnalisés'
    },
    {
      icon: FiUsers,
      title: 'Gestion familiale',
      description: 'Ajoutez plusieurs membres et gérez les finances de toute la famille'
    }
  ];

  return (
    <div className="max-h-screen relative">
      <div className="h-96 overflow-hidden style={{ background: 'var(--gradient-hero)' }} text-white realtive">
      {/* <div className="h-96 overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white realtive"> */}
        <div className="absolute inset-0 bg-black opacity-20 top-0"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center h-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Gérez vos dépenses comme un pro
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              L'application intelligente qui vous aide à maîtriser votre budget et à atteindre vos objectifs financiers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
              >
                Commencer gratuitement <FiArrowRight />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-200"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      <div className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir notre solution ?
            </h2>
            <p className="text-xl text-gray-600">
              Des fonctionnalités puissantes pour une gestion financière optimale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors duration-300">
                  <feature.icon className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* <div className="style={{ background: 'var(--gradient-hero)' }}"> */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">

        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à maîtriser vos finances ?
          </h2>
          <p className="text-xl text-white opacity-90 mb-8">
            Rejoignez des milliers d'utilisateurs qui ont déjà amélioré leur gestion financière
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
          >
            Créer un compte gratuitement <FiCheckCircle />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;