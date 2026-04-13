import React from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiShield, FiUsers, FiArrowRight, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

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
      <div className="h-auto overflow-hidden bg-blue-900 text-white relative">
        <div className="absolute inset-0 bg-black opacity-20 top-0"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 ">
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
                className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 inline-flex items-center gap-2"
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
      </div>


      {/* Section Statistiques clés */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10k+', label: 'Utilisateurs actifs', icon: FiUsers },
              { value: '₵50M+', label: 'Dépenses suivies', icon: FiTrendingUp },
              { value: '98%', label: 'Satisfaction client', icon: FiCheckCircle },
              { value: '24/7', label: 'Support disponible', icon: FiShield }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-secondary-800">{stat.value}</div>
                <div className="text-text-secondary mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

            {/* Section Pourquoi choisir notre solution*/}
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


      {/* Section Comment ça fonctionne */}
      <div className="py-20" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-800">
              Comment ça fonctionne ?
            </h2>
            <p className="text-xl text-text-secondary mt-4">
              Commencez en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              { 
                step: '1', 
                title: 'Créez votre compte', 
                desc: 'Inscrivez-vous gratuitement en quelques secondes',
                icon: FiUsers
              },
              { 
                step: '2', 
                title: 'Ajoutez vos dépenses', 
                desc: 'Saisissez vos transactions et catégorisez-les',
                icon: FiTrendingUp
              },
              { 
                step: '3', 
                title: 'Analysez & Optimisez', 
                desc: 'Visualisez vos habitudes et économisez plus',
                icon: FiBarChart2
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all">
                  <div className="w-16 h-16 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <item.icon className="w-10 h-10 text-primary-500 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-secondary-800 mb-2">{item.title}</h3>
                  <p className="text-text-secondary">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Section Aperçu Dashboard */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-800 mb-4">
                Une interface intuitive et puissante
              </h2>
              <p className="text-text-secondary text-lg mb-6">
                Accédez à tous vos outils financiers depuis un seul tableau de bord.
                Visualisez vos dépenses, suivez vos objectifs et prenez le contrôle de vos finances.
              </p>
              <ul className="space-y-3">
                {[
                  'Graphiques interactifs en temps réel',
                  'Catégorisation automatique des dépenses',
                  'Rapports personnalisables',
                  'Export de données en CSV/PDF'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FiCheckCircle className="text-primary-500 w-5 h-5" />
                    <span className="text-text-primary">{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn-primary inline-block mt-8">
                Essayer gratuitement
              </Link>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-secondary-800 to-primary-600 rounded-2xl p-1 shadow-2xl">
                <div className="bg-white rounded-xl overflow-hidden">
                  <div className="bg-gray-100 p-4 border-b">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="p-6">
                    {/* Mockup du dashboard */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg"></div>
                        <div className="h-24 bg-gradient-to-br from-secondary-800 to-secondary-700 rounded-lg"></div>
                        <div className="h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-lg"></div>
                      </div>
                      <div className="h-48 bg-gray-100 rounded-lg"></div>
                      <div className="h-32 bg-gray-50 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-500 rounded-full blur-2xl opacity-30 -z-10"></div>
            </div>
          </div>
        </div>
      </div>
      

      {/* Section Témoignages */}
      <div className="py-20" style={{ background: 'var(--gradient-subtle)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-800">
              Ce que nos utilisateurs disent
            </h2>
            <p className="text-xl text-text-secondary mt-4">
              Ils ont transformé leurs finances grâce à notre application
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Jean Ilunga',
                role: 'Chef d\'entreprise',
                content: 'Cette application m\'a permis de réduire mes dépenses de 30% en seulement 3 mois. Un outil indispensable !',
                rating: 5
              },
              {
                name: 'Robert Mutombo',
                role: 'Étudiant',
                content: 'Simple, efficace et gratuit. Je recommande à tous mes amis pour mieux gérer leur budget étudiant.',
                rating: 5
              },
              {
                name: 'Aïssa Kabongo',
                role: 'Freelance',
                content: 'Enfin une application qui me permet de suivre mes revenus et dépenses professionnelles facilement.',
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="card hover:shadow-2xl transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-text-primary mb-4 italic">"{testimonial.content}"</p>
                <div className="">
                  <p className="font-semibold text-secondary-800">{testimonial.name}</p>
                  <p className="text-sm text-text-secondary">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      

      {/* Section FAQ */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {/* <h2 className="text-3xl md:text-4xl font-bold text-secondary-800">
              Foire aux questions
            </h2> */}
            <p className="text-xl text-text-secondary mt-4">
              Tout ce que vous devez savoir
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'L\'application est-elle vraiment gratuite ?',
                a: 'Oui, nous proposons une version gratuite avec toutes les fonctionnalités essentielles. Des options premium sont disponibles pour les utilisateurs avancés.'
              },
              {
                q: 'Mes données sont-elles sécurisées ?',
                a: 'Absolument ! Nous utilisons un cryptage de bout en bout et nous ne partageons jamais vos données avec des tiers.'
              },
              {
                q: 'Puis-je utiliser l\'application sur plusieurs appareils ?',
                a: 'Oui, votre compte est synchronisé sur tous vos appareils (web, mobile, tablette).'
              },
              {
                q: 'Comment importer mes transactions bancaires ?',
                a: 'Vous pouvez importer manuellement vos relevés au format CSV ou les saisir une par une facilement.'
              }
            ].map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer p-6 font-semibold text-secondary-800 hover:bg-gray-50">
                    {faq.q}
                  </summary>
                  <div className="p-6 pt-0 text-text-secondary">
                    {faq.a}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Gestion Dépenses</h3>
              <p className="text-gray-400 text-sm">
                L'application qui vous aide à maîtriser votre budget et à atteindre vos objectifs financiers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Liens rapides</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-primary-500">Accueil</Link></li>
                <li><Link to="/about" className="hover:text-primary-500">À propos</Link></li>
                <li><Link to="/contact" className="hover:text-primary-500">Contact</Link></li>
                <li><Link to="/blog" className="hover:text-primary-500">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Légal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/privacy" className="hover:text-primary-500">Confidentialité</Link></li>
                <li><Link to="/terms" className="hover:text-primary-500">Conditions d'utilisation</Link></li>
                <li><Link to="/cookies" className="hover:text-primary-500">Cookies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Suivez-nous</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"><FaFacebook /></a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"><FaTwitter /></a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"><FaInstagram /></a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-500 transition-colors"><FaLinkedin /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 Gestion Dépenses. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;