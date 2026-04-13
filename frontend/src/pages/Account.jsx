import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiCreditCard, FiDollarSign, FiTrendingUp, FiTrendingDown, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const Comptes = () => {
    const [comptes, setComptes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCompte, setEditingCompte] = useState(null);
    const [formData, setFormData] = useState({
        nom_compte: '',
        type_compte: 'BANK',
        solde_initial: 0,
        devise: ''
    });
    const navigate = useNavigate();
    useEffect(() => {
        fetchComptes();
    }, []);

    const fetchComptes = async () => {
        try {
        const response = await api.get('/comptes/all');

        setComptes(response.data);
        console.log('Data Response : ', response.data)
        } catch (error) {
        toast.error('Erreur lors du chargement des comptes');
        console.error(error);
        } finally {
        setLoading(false);
        }
    };

    const handleOpenModal = (compte = null) => {
        if (compte) {
        setEditingCompte(compte);
        setFormData({
            nom_compte: compte.nom_compte,
            type_compte: compte.type_compte,
            solde_initial: compte.solde,
        });
        } else {
        setEditingCompte(null);
        setFormData({
            nom_compte: '',
            type_compte: 'BANK',
            solde_initial: 0,
            devise: ''
        });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        if (editingCompte) {
            await api.put(`/comptes/${editingCompte.id_compte}`, {
            nom_compte: formData.nom_compte,
            type_compte: formData.type_compte
            });
            toast.success('Compte modifié avec succès');
        } else {
            await api.post('/comptes/create', {
                nom_compte: formData.nom_compte, 
                type_compte: formData.type_compte, 
                solde_initial: formData.solde_initial, 
                id_devise: formData.devise, 
                // id_menage: formData.nom_compte
            });
            toast.success('Compte créé avec succès');
        }
        setShowModal(false);
        fetchComptes();
        } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur');
        }
    };

    const handleDelete = async (id, nom) => {
        if (window.confirm(`Supprimer le compte "${nom}" ?`)) {
        try {
            await api.delete(`/comptes/${id}`);
            toast.success('Compte supprimé');
            fetchComptes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur');
        }
        }
    };

    const getTypeIcon = (type) => {
        switch(type) {
        case 'CASH': return '💵';
        case 'BANK': return '🏦';
        case 'MOBILE_MONEY': return '📱';
        default: return '💳';
        }
    };

    const getTypeLabel = (type) => {
        switch(type) {
        case 'CASH': return 'Espèces';
        case 'BANK': return 'Compte bancaire';
        case 'MOBILE_MONEY': return 'Mobile Money';
        default: return 'Autre';
        }
    };

    if (loading) {
        return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-16 h-16 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-white cursor-pointer text-blue-900 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-200 hover:text-black transition-colors"
                >
                    Retour
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mes comptes</h1>
                    <p className="text-gray-600 mt-2">Gérez tous vos comptes bancaires et portefeuilles</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-600 transition-colors"
                >
                    <FiPlus /> Nouveau compte
                </button>
            </div>

            {/* Solde total */}
            {/* <div className="bg-blue-900 rounded-2xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-white/80 text-sm">Solde total de tous les comptes</p>
                <p className="text-4xl font-bold mt-2">
                    {comptes.reduce((total, c) => total + parseFloat(c.solde), 0).toLocaleString()}
                </p>
                </div>
                <FiDollarSign className="text-5xl text-white/30" />
            </div>
            </div> */}

            {/* Grille des comptes */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(comptes) && comptes.map((compte) => (
                <div key={compte.id_compte} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{getTypeIcon(compte.type_compte)}</span>
                        <div>
                        <h3 className="font-bold text-lg text-gray-900">{compte.nom_compte}</h3>
                        <span className="text-xs text-gray-500">{getTypeLabel(compte.type_compte)}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                        onClick={() => handleOpenModal(compte)}
                        className="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                        >
                        <FiEdit2 />
                        </button>
                        <button
                        onClick={() => handleDelete(compte.id_compte, compte.nom_compte)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                        <FiTrash2 />
                        </button>
                    </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                    <p className="text-2xl font-bold text-gray-900">
                        {parseFloat(compte.solde).toLocaleString()} {compte.id_devise === 1 ? 'FC' : '$' }
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-green-50 rounded-lg p-2 text-center">
                        <FiTrendingUp className="inline text-green-500 mb-1" />
                        <p className="text-xs text-gray-500">Revenus (mois)</p>
                        <p className="text-sm font-semibold text-green-600">
                            {compte.revenus_mois?.toLocaleString() || 0} 
                        </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-2 text-center">
                        <FiTrendingDown className="inline text-red-500 mb-1" />
                        <p className="text-xs text-gray-500">Dépenses (mois)</p>
                        <p className="text-sm font-semibold text-red-600">
                            {compte.depenses_mois?.toLocaleString() || 0} 
                        </p>
                        </div>
                    </div>
                    </div>

                    {/* Dernières transactions */}
                    {compte.dernieres_transactions?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Dernières opérations</p>
                        <div className="space-y-2">
                        {compte.dernieres_transactions.slice(0, 3).map((trans, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 truncate max-w-[120px]">
                                {trans.description || trans.categorie}
                            </span>
                            <span className={trans.type_flux === 'Revenu' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {trans.type_flux === 'Revenu' ? '+' : '-'} {parseFloat(trans.montant).toLocaleString()}
                            </span>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}
                </div>
                </div>
            ))}
            </div>

            {comptes.length === 0 && (
            <div className="text-center py-12">
                <FiCreditCard className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun compte pour le moment</p>
                <button
                onClick={() => handleOpenModal()}
                className="mt-4 text-primary-500 hover:text-primary-600"
                >
                Créer votre premier compte
                </button>
            </div>
            )}
        </div>

        {/* Modal de création/modification */}
        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                    {editingCompte ? 'Modifier le compte' : 'Nouveau compte'}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <FiX className="w-6 h-6" />
                </button>
                </div>

                <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du compte
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.nom_compte}
                        onChange={(e) => setFormData({ ...formData, nom_compte: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ex: Compte courant, Portefeuille..."
                    />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type de compte
                        </label>
                        <select
                            value={formData.type_compte}
                            onChange={(e) => setFormData({ ...formData, type_compte: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="CASH">Espèces</option>
                            <option value="BANK">Compte bancaire</option>
                            <option value="MOBILE_MONEY">Mobile Money</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Devises
                        </label>
                        <select
                            value={formData.devise}
                            onChange={(e) => setFormData({ ...formData, type_compte: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="1">1. Francs Congolais</option>
                            <option value="2">2. Dollars Américains</option>
                        </select>
                    </div>

                    {!editingCompte && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                        Solde initial
                        </label>
                        <input
                        type="number"
                        step="0.01"
                        value={formData.solde_initial}
                        onChange={(e) => setFormData({ ...formData, solde_initial: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="0"
                        />
                    </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                    Annuler
                    </button>
                    <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                    {editingCompte ? 'Modifier' : 'Créer'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
};

export default Comptes;