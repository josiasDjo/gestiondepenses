import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrendingUp, FiTrendingDown, FiDollarSign, FiCreditCard, FiPieChart } from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import toast from 'react-hot-toast';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    recentTransactions: [],
    chartData: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Données d'exemple pour le graphique
  const lineChartData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Revenus',
        data: [1200, 1900, 1500, 1700, 2000, 1800, 2200],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Dépenses',
        data: [800, 1100, 900, 1300, 1200, 1400, 1100],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const doughnutData = {
    labels: ['Alimentation', 'Transport', 'Logement', 'Loisirs', 'Santé', 'Autres'],
    datasets: [{
      data: [35, 20, 25, 10, 5, 5],
      backgroundColor: [
        '#6366f1',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6',
        '#6b7280'
      ]
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-t-4 border-indigo-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">Bienvenue ! Voici un aperçu de vos finances</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Solde total</p>
                <p className="text-3xl font-bold mt-2">{stats.totalBalance.toLocaleString()} FCFA</p>
              </div>
              <FiDollarSign className="text-4xl text-indigo-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total revenus</p>
                <p className="text-3xl font-bold mt-2">{stats.totalIncome.toLocaleString()} FCFA</p>
              </div>
              <FiTrendingUp className="text-4xl text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Total dépenses</p>
                <p className="text-3xl font-bold mt-2">{stats.totalExpense.toLocaleString()} FCFA</p>
              </div>
              <FiTrendingDown className="text-4xl text-red-200" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Évolution des finances</h3>
            <Line data={lineChartData} options={options} />
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Dépenses par catégorie</h3>
            <div className="w-64 mx-auto">
              <Doughnut data={doughnutData} options={options} />
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Transactions récentes</h3>
            <button className="btn-primary text-sm flex items-center gap-2">
              <FiPlus /> Ajouter
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentTransactions.map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                        {transaction.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'} {transaction.amount.toLocaleString()} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;