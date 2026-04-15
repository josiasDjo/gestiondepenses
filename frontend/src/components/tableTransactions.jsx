import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiDownload, FiX, FiSearch, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const TableTransaction = () => {
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
        // console.log('Comptes : ', response.data);
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
        // console.log('Transaction : ', response.data)
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



    return (
        <div>
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
                className="ml-auto bg-primary-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
            >
                <FiSearch /> Filtrer
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Compte / Devise</th>
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
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            {t.compte?.nom_compte || '-'}
                                            {t.compte?.devise?.code_devise && (
                                                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {t.compte.devise.code_devise}
                                                </span>
                                            )}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-sm text-right font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'income' ? '+' : '-'} {t.montant.toLocaleString()} {t.compte.devise.code_devise}
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
    )
}


export default TableTransaction;
