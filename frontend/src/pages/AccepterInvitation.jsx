import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiHome, FiUserPlus, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const AccepterInvitation = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error, already_member, expired
    const [message, setMessage] = useState('');
    const [menage, setMenage] = useState(null);

    useEffect(() => {
        verifierInvitation();
    }, [token]);

    const verifierInvitation = async () => {
        try {
        const response = await api.post(`/invitations/verifier/${token}`);
        
        if (response.data.requireLogin) {
            // L'utilisateur n'est pas connecté, rediriger vers login
            localStorage.setItem('invitationToken', token);
            toast.info('Veuillez vous connecter pour accepter l\'invitation');
            navigate('/login');
            return;
        }
        
        if (response.data.success) {
            setStatus('success');
            setMessage(response.data.message);
            setMenage(response.data.menage);
            toast.success(response.data.message);
            
            // Rediriger vers le dashboard après 3 secondes
            setTimeout(() => {
            navigate('/dashboard');
            }, 3000);
        }
        } catch (error) {
        const errorData = error.response?.data;
        
        if (errorData?.requireLogin) {
            localStorage.setItem('invitationToken', token);
            toast.info('Veuillez vous connecter pour accepter l\'invitation');
            navigate('/login');
            return;
        }
        
        if (errorData?.message) {
            setMessage(errorData.message);
        }
        
        if (errorData?.alreadyMember) {
            setStatus('already_member');
        } else if (errorData?.expired) {
            setStatus('expired');
        } else {
            setStatus('error');
        }
        }
    };

    const handleRetour = () => {
        navigate('/dashboard');
    };

    if (status === 'loading') {
        return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-800">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
            <FiLoader className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Vérification de l'invitation...</h2>
            <p className="text-gray-500 mt-2">Veuillez patienter</p>
            </div>
        </div>
        );
    }

    if (status === 'success') {
        return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-800">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitation acceptée !</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            {menage && (
                <div className="bg-primary-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                    Vous avez rejoint <span className="font-semibold text-primary-600">{menage.nom_menage}</span>
                </p>
                </div>
            )}
            <p className="text-sm text-gray-400">Redirection vers le tableau de bord...</p>
            <button
                onClick={handleRetour}
                className="mt-4 text-primary-500 hover:text-primary-600"
            >
                Revenir maintenant
            </button>
            </div>
        </div>
        );
    }

    if (status === 'already_member') {
        return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-800">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHome className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Déjà membre</h2>
            <p className="text-gray-600 mb-6">{message || 'Vous êtes déjà membre de ce ménage'}</p>
            <button
                onClick={handleRetour}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
                Aller au tableau de bord
            </button>
            </div>
        </div>
        );
    }

    if (status === 'expired') {
        return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-800">
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiXCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitation expirée</h2>
            <p className="text-gray-600 mb-6">Cette invitation a expiré. Veuillez contacter l'administrateur du ménage.</p>
            <button
                onClick={handleRetour}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
                Retour à l'accueil
            </button>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-800">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiXCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitation invalide</h2>
            <p className="text-gray-600 mb-6">{message || 'Cette invitation n\'est pas valide'}</p>
            <button
            onClick={handleRetour}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
            Retour à l'accueil
            </button>
        </div>
        </div>
    );
};

export default AccepterInvitation;