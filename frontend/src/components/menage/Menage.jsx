import React, { useState } from 'react';
import { FiX, FiMail, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const InvitationModal = ({ menageId, menageNom, onClose }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [loading, setLoading] = useState(false);

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!email) {
        toast.error('Email requis');
        return;
        }
        
        setLoading(true);
        try {
        await api.post('/invitations', {
            email,
            id_menage: menageId,
            role
        });
        toast.success(`Invitation envoyée à ${email}`);
        setEmail('');
        onClose();
        } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'invitation');
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Inviter un membre</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-6 h-6" />
            </button>
            </div>
            
            <p className="text-gray-600 mb-4">
            Inviter dans <span className="font-semibold">{menageNom}</span>
            </p>
            
            <form onSubmit={handleInvite}>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email du membre</label>
                <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="membre@exemple.com"
                />
                </div>
            </div>
            
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Rôle</label>
                <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                <option value="member">Membre (peut voir et ajouter des transactions)</option>
                <option value="admin">Administrateur (peut aussi inviter des membres)</option>
                </select>
            </div>
            
            <div className="flex gap-3">
                <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                Annuler
                </button>
                <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-500 text-white rounded-lg px-4 py-2 hover:bg-primary-600 flex items-center justify-center gap-2"
                >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                    <FiSend /> Inviter
                    </>
                )}
                </button>
            </div>
            </form>
        </div>
        </div>
    );
};

export default InvitationModal;