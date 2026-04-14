import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import toast from 'react-hot-toast';
import api from '../services/api';
import TableTransaction from '../components/tableTransactions';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const getDeviseColor = (code) => {
  switch(code) {
    case 'CDF': return 'from-orange-500 to-red-500';
    case 'USD': return 'from-green-500 to-teal-500';
    default: return 'from-gray-500 to-gray-600';
  }
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    global: { totalBalance: 0, totalIncome: 0, totalExpense: 0 },
    parDevise: [],
    recentTransactions: [],
    depensesParCategorie: [],
    evolution: { labels: [], revenus: [], depenses: [] }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      // console.log('Dashboard response:', response.data);
      
      const data = response.data || {};
      
      setStats({
        global: data.global || { totalBalance: 0, totalIncome: 0, totalExpense: 0 },
        parDevise: data.parDevise || [],
        recentTransactions: data.recentTransactions || [],
        depensesParCategorie: data.depensesParCategorie || [],
        evolution: data.evolution || { labels: [], revenus: [], depenses: [] }
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        limit: 20,
        type: filters.type,
        categorie: filters.categorie
      });
      const response = await api.get(`/transactions?${params}`);
      setTransactions(response.data.transactions);
      setFilters(prev => ({ ...prev, totalPages: response.data.totalPages }));
      console.log('Transaction : ', response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: stats.evolution?.labels || [],
    datasets: [
      {
        label: 'Revenus',
        data: stats.evolution?.revenus || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Dépenses',
        data: stats.evolution?.depenses || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const doughnutData = {
    labels: (stats.depensesParCategorie || []).map(c => c.categorie || 'Non catégorisé'),
    datasets: [{
      data: (stats.depensesParCategorie || []).map(c => parseFloat(c.total) || 0),
      backgroundColor: ['#f58220', '#052846', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']
    }]
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">Bienvenue ! Voici un aperçu de vos finances</p>
        </div>

        {/* Stats par Devise */}
        {(stats.parDevise || []).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Par devise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stats.parDevise.map((devise) => (
                <div key={devise.id_devise} className={`bg-gradient-to-r ${getDeviseColor(devise.code_devise)} rounded-xl p-5 text-white shadow-lg`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{devise.code_devise}</h3>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{devise.nom_devise}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-lg p-2 text-center">
                      <p className="text-xs opacity-80">Solde</p>
                      <p className="text-lg font-bold">{(devise.solde || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2 text-center">
                      <p className="text-xs opacity-80">Revenus (mois)</p>
                      <p className="text-lg font-bold">{(devise.revenus || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2 text-center">
                      <p className="text-xs opacity-80">Dépenses (mois)</p>
                      <p className="text-lg font-bold">{(devise.depenses || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Évolution des finances</h3>
            {(stats.evolution?.labels || []).length > 0 ? (
              <Line data={lineChartData} options={options} />
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Dépenses par catégorie</h3>
            {(stats.depensesParCategorie || []).length > 0 ? (
              <div className="w-64 mx-auto">
                <Doughnut data={doughnutData} options={options} />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune dépense enregistrée</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <TableTransaction />
      </div>
    </div>
  );
};

export default Dashboard;