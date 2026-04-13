import React, { useState, useEffect } from 'react';
import { FiCalendar, FiPieChart, FiBarChart2, FiDownload } from 'react-icons/fi';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import toast from 'react-hot-toast';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Rapports = () => {
  const [rapportMensuel, setRapportMensuel] = useState(null);
  const [rapportAnnuel, setRapportAnnuel] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMois, setSelectedMois] = useState(new Date().getMonth() + 1);
  const [selectedAnnee, setSelectedAnnee] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedMois, selectedAnnee]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mensuel, annuel, categoriesData] = await Promise.all([
        api.get(`/rapports/mensuel?mois=${selectedMois}&annee=${selectedAnnee}`),
        api.get(`/rapports/annuel?annee=${selectedAnnee}`),
        api.get('/rapports/categories')
      ]);
      setRapportMensuel(mensuel.data);
      setRapportAnnuel(annuel.data);
      setCategories(categoriesData.data.categories);
    } catch (error) {
      toast.error('Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    window.open('/api/rapports/export/csv', '_blank');
  };

  // Graphique mensuel (évolution journalière)
  const dailyChartData = rapportMensuel?.transactionsParJour && {
    labels: Object.keys(rapportMensuel.transactionsParJour || {}),
    datasets: [
      {
        label: 'Revenus',
        data: Object.values(rapportMensuel.transactionsParJour || {}).map(d => d.revenus),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      },
      {
        label: 'Dépenses',
        data: Object.values(rapportMensuel.transactionsParJour || {}).map(d => d.depenses),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      }
    ]
  };

  // Graphique annuel
  const annualChartData = rapportAnnuel?.mensuel && {
    labels: rapportAnnuel.mensuel.map(m => m.nomMois),
    datasets: [
      {
        label: 'Revenus',
        data: rapportAnnuel.mensuel.map(m => m.revenus),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'Dépenses',
        data: rapportAnnuel.mensuel.map(m => m.depenses),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  // Graphique catégories
  const pieChartData = {
    labels: categories.map(c => c.nom),
    datasets: [{
      data: categories.map(c => c.total),
      backgroundColor: ['#f58220', '#052846', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']
    }]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-t-4 border-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rapports financiers</h1>
            <p className="text-gray-600 mt-2">Analysez vos finances en détail</p>
          </div>
          <button
            onClick={exportCSV}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            <FiDownload /> Exporter CSV
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
          <FiCalendar className="text-gray-400" />
          <select
            value={selectedMois}
            onChange={(e) => setSelectedMois(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2024, m - 1, 1).toLocaleString('fr-FR', { month: 'long' })}</option>
            ))}
          </select>
          <select
            value={selectedAnnee}
            onChange={(e) => setSelectedAnnee(parseInt(e.target.value))}
            className="px-3 py-2 border rounded-lg"
          >
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
          <button
            onClick={fetchData}
            className="bg-primary-500 text-white px-4 py-2 rounded-lg"
          >
            Appliquer
          </button>
        </div>

        {/* Résumé mensuel */}
        {rapportMensuel && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <p className="text-green-600 text-sm">Revenus du mois</p>
              <p className="text-2xl font-bold text-green-700">{rapportMensuel.revenus.toLocaleString()} FCFA</p>
            </div>
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <p className="text-red-600 text-sm">Dépenses du mois</p>
              <p className="text-2xl font-bold text-red-700">{rapportMensuel.depenses.toLocaleString()} FCFA</p>
            </div>
            <div className={`rounded-xl p-6 border ${rapportMensuel.solde >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
              <p className="text-blue-600 text-sm">Économie du mois</p>
              <p className={`text-2xl font-bold ${rapportMensuel.solde >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {rapportMensuel.solde.toLocaleString()} FCFA
              </p>
            </div>
          </div>
        )}

        {/* Graphique journalier */}
        {rapportMensuel && Object.keys(rapportMensuel.transactionsParJour || {}).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Évolution quotidienne - {new Date(selectedAnnee, selectedMois - 1, 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
            <Bar data={dailyChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        )}

        {/* Graphique annuel */}
        {rapportAnnuel && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Évolution annuelle {selectedAnnee}</h3>
            <Line data={annualChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t">
              <div className="text-center">
                <p className="text-gray-500 text-sm">Total revenus {selectedAnnee}</p>
                <p className="text-xl font-bold text-green-600">{rapportAnnuel.totalRevenus?.toLocaleString()} FCFA</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Total dépenses {selectedAnnee}</p>
                <p className="text-xl font-bold text-red-600">{rapportAnnuel.totalDepenses?.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>
        )}

        {/* Graphique catégories */}
        {categories.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Dépenses par catégorie</h3>
              <div className="w-64 mx-auto">
                <Pie data={pieChartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Détail des catégories</h3>
              <div className="space-y-3">
                {categories.map((cat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat.nom}</span>
                      <span>{cat.total.toLocaleString()} FCFA ({cat.pourcentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${cat.pourcentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rapports;