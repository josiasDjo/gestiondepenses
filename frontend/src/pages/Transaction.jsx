import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiDownload, FiX, FiSearch, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import TableTransaction from '../components/tableTransactions';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [stats, setStats] = useState({
        global: { revenus: 0, depenses: 0, solde: 0 },
        parDevise: [],
        categories: []
    });
    const [filters, setFilters] = useState({
        type: 'all',
        categorie: 'all',
        page: 1,
        totalPages: 1
    });
    const [formData, setFormData] = useState({
        montant: '',
        description: '',
        type_flux: 'Depense',
        categorie: '',
        date_transaction: new Date().toISOString().split('T')[0],
        id_compte: ''
    });
    const [comptes, setComptes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchComptes();
        fetchTransactions();
        fetchStats();
    }, []);

    const fetchComptes = async () => {
        try {
        const response = await api.get('/comptes');
        setComptes(response.data);
        console.log('Comptes : ', response.data);
        if (response.data.length > 0) {
            setFormData(prev => ({ ...prev, id_compte: response.data[0].id_compte }));
        }
        } catch (error) {
        console.error('Erreur chargement comptes:', error);
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

    const fetchStats = async () => {
        try {
        const response = await api.get('/transactions/stats');
        setStats(response.data);
        } catch (error) {
        console.error('Erreur stats:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        if (editingTransaction) {
            await api.put(`/transactions/${editingTransaction.id}`, formData);
            toast.success('Transaction modifiée');
        } else {
            await api.post('/transactions/', formData);
            toast.success('Transaction ajoutée');
        }
        setShowModal(false);
        resetForm();
        fetchTransactions();
        fetchStats();
        fetchComptes();
        } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Supprimer cette transaction ?')) {
        try {
            await api.delete(`/transactions/${id}`);
            toast.success('Transaction supprimée');
            fetchTransactions();
            fetchStats();
            fetchComptes();
        } catch (error) {
            toast.error('Erreur lors de la suppression');
        }
        }
    };

    const resetForm = () => {
        setEditingTransaction(null);
        setFormData({
        montant: '',
        description: '',
        type_flux: 'Depense',
        categorie: '',
        date_transaction: new Date().toISOString().split('T')[0],
        id_compte: comptes[0]?.id_compte || ''
        });
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setFormData({
        montant: transaction.montant,
        description: transaction.description || '',
        type_flux: transaction.type === 'income' ? 'Revenu' : 'Depense',
        categorie: transaction.categorie,
        date_transaction: new Date(transaction.date).toISOString().split('T')[0],
        id_compte: transaction.compte?.id_compte || ''
        });
        setShowModal(true);
    };

    const exportCSV = async () => {
        try {
        window.open('/api/rapports/export/csv', '_blank');
        } catch (error) {
        toast.error('Erreur lors de l\'export');
        }
    };

    // Obtenir les couleurs pour les devises
    const getDeviseColor = (code) => {
        switch(code) {
        case 'FC': return 'from-gray-500 to-gray-600';
        case 'USD': return 'from-gray-500 to-gray-600';
        default: return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <button
            onClick={() => navigate(-1)}
            className="bg-white cursor-pointer text-blue-900 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-200 hover:text-black transition-colors mb-4"
            >
            Retour
            </button>

            <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                <p className="text-gray-600 mt-2">Gérez toutes vos opérations financières</p>
            </div>
            <div className="flex gap-3">
                <button
                onClick={exportCSV}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"
                >
                <FiDownload /> Exporter CSV
                </button>
                <button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-600"
                >
                <FiPlus /> Nouvelle transaction
                </button>
            </div>
            </div>



            {/* Stats par Devise */}
            {stats.parDevise && stats.parDevise.length > 0 && (
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Par devise</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.parDevise.map((devise) => (
                    <div key={devise.id_devise} className={`bg-gradient-to-r ${getDeviseColor(devise.code_devise)} rounded-xl p-5 text-white shadow-lg`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{devise.code_devise}</h3>
                        </div>
                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{devise.nom_devise}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/10 rounded-lg p-2 text-center">
                        <p className="text-xs opacity-80">Revenus</p>
                        <p className="text-lg font-bold">{devise.revenus.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2 text-center">
                        <p className="text-xs opacity-80">Dépenses</p>
                        <p className="text-lg font-bold">{devise.depenses.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2 text-center">
                        <p className="text-xs opacity-80">Solde</p>
                        <p className={`text-lg font-bold ${devise.solde >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {devise.solde.toLocaleString()}
                        </p>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}

            

            {/* Table Transaction */}
            <TableTransaction />

        </div>

        {/* Modal - inchangé */}
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                    {editingTransaction ? 'Modifier la transaction' : 'Nouvelle transaction'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400">
                    <FiX className="w-6 h-6" />
                </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                        <input
                        type="radio"
                        value="Revenu"
                        checked={formData.type_flux === 'Revenu'}
                        onChange={(e) => setFormData({ ...formData, type_flux: e.target.value })}
                        className="text-green-500"
                        />
                        Revenu
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                        type="radio"
                        value="Depense"
                        checked={formData.type_flux === 'Depense'}
                        onChange={(e) => setFormData({ ...formData, type_flux: e.target.value })}
                        className="text-red-500"
                        />
                        Dépense
                    </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Montant</label>
                    <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.montant}
                    onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Catégorie</label>
                    <input
                    type="text"
                    value={formData.categorie}
                    onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Alimentation, Transport, ..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Description optionnelle"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input
                    type="date"
                    required
                    value={formData.date_transaction}
                    onChange={(e) => setFormData({ ...formData, date_transaction: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Compte</label>
                    <select
                    required
                    value={formData.id_compte}
                    onChange={(e) => setFormData({ ...formData, id_compte: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                    {comptes.map(c => (
                        <option key={c.id_compte} value={c.id_compte}>
                        {c.nom_compte} {c.devise?.code_devise && `(${c.devise.code_devise})`}
                        </option>
                    ))}
                    </select>
                </div>

                <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg">
                    Annuler
                    </button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                    {editingTransaction ? 'Modifier' : 'Ajouter'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
};

export default Transactions;