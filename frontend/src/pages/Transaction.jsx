import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiDownload, FiX, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [stats, setStats] = useState({ revenus: 0, depenses: 0, solde: 0 });
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

    useEffect(() => {
        fetchComptes();
        fetchTransactions();
        fetchStats();
    }, []);

    const fetchComptes = async () => {
        try {
            const response = await api.get('/comptes');
            setComptes(response.data);
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
            await api.post('/transactions', formData);
            toast.success('Transaction ajoutée');
        }
        setShowModal(false);
        resetForm();
        fetchTransactions();
        fetchStats();
        fetchComptes(); // Rafraîchir les soldes des comptes
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <p className="text-green-600 text-sm">Total revenus</p>
                <p className="text-2xl font-bold text-green-700">{stats.revenus.toLocaleString()} FCFA</p>
            </div>
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                <p className="text-red-600 text-sm">Total dépenses</p>
                <p className="text-2xl font-bold text-red-700">{stats.depenses.toLocaleString()} FCFA</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <p className="text-blue-600 text-sm">Solde</p>
                <p className="text-2xl font-bold text-blue-700">{stats.solde.toLocaleString()} FCFA</p>
            </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
            <FiFilter className="text-gray-400" />
            <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
                className="px-3 py-2 border rounded-lg text-sm"
            >
                <option value="all">Tous les types</option>
                <option value="income">Revenus</option>
                <option value="expense">Dépenses</option>
            </select>
            <select
                value={filters.categorie}
                onChange={(e) => setFilters({ ...filters, categorie: e.target.value, page: 1 })}
                className="px-3 py-2 border rounded-lg text-sm"
            >
                <option value="all">Toutes les catégories</option>
                <option value="Alimentation">Alimentation</option>
                <option value="Transport">Transport</option>
                <option value="Logement">Logement</option>
                <option value="Loisirs">Loisirs</option>
                <option value="Santé">Santé</option>
            </select>
            <button
                onClick={fetchTransactions}
                className="ml-auto bg-primary-500 text-white px-4 py-2 rounded-lg text-sm"
            >
                <FiSearch className="inline mr-1" /> Filtrer
            </button>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Catégorie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Compte</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Montant</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {loading ? (
                    <tr>
                    <td colSpan="6" className="text-center py-8">
                        <div className="w-8 h-8 border-t-2 border-primary-500 rounded-full animate-spin mx-auto"></div>
                    </td>
                    </tr>
                ) : transactions.length === 0 ? (
                    <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                        Aucune transaction
                    </td>
                    </tr>
                ) : (
                    transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(t.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{t.description || '-'}</td>
                        <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {t.categorie}
                        </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{t.compte?.nom_compte || '-'}</td>
                        <td className={`px-6 py-4 text-sm text-right font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'} {t.montant.toLocaleString()} FCFA
                        </td>
                        <td className="px-6 py-4 text-center">
                        <button onClick={() => handleEdit(t)} className="text-blue-500 hover:text-blue-700 mr-3">
                            <FiEdit2 className="inline" />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700">
                            <FiTrash2 className="inline" />
                        </button>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
            </div>

            {/* Pagination */}
            {filters.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
                <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
                >
                Précédent
                </button>
                <span className="px-3 py-1">Page {filters.page} / {filters.totalPages}</span>
                <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page === filters.totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
                >
                Suivant
                </button>
            </div>
            )}
        </div>

        {/* Modal */}
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
                        <option key={c.id_compte} value={c.id_compte}>{c.nom_compte}</option>
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