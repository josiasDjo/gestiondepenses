import React, { useState, useEffect } from 'react';
import { FiBell, FiUserPlus, FiCheck, FiX, FiHome } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useMenage } from '../context/MenageContext';

const NotificationBell = () => {
    const { refetchMenages } = useMenage();
    const [alertes, setAlertes] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
        const [alertesRes, invitationsRes] = await Promise.all([
            // api.get('/alertes/non-lues').catch(() => ({ data: [] })),
            api.get('/invitations/mes-invitations').catch(() => ({ data: [] }))
        ]);
        
        setAlertes(alertesRes.data || []);
        setInvitations(invitationsRes.data || []);
        } catch (error) {
        console.error('Erreur chargement notifications:', error);
        }
    };

    const totalNotifications = (alertes?.length || 0) + (invitations?.length || 0);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Rafraîchir toutes les 30s
        return () => clearInterval(interval);
    }, []);

    const marquerAlerteLue = async (id) => {
        try {
        await api.put(`/alertes/${id}/lue`);
        setAlertes(alertes.filter(a => a.id_alerte !== id));
        toast.success('Notification marquée comme lue');
        } catch (error) {
        console.error('Erreur:', error);
        }
    };

    const accepterInvitation = async (invitation) => {
        setLoading(true);
        try {
        await api.post(`/invitations/${invitation.id_invitation}/accepter`);
        setInvitations(invitations.filter(i => i.id_invitation !== invitation.id_invitation));
        toast.success(`Vous avez rejoint le ménage "${invitation.menage.nom_menage}"`);
        await refetchMenages(); // Rafraîchir la liste des ménages
        // Déclencher un événement pour rafraîchir les données du dashboard
        window.dispatchEvent(new CustomEvent('menageChanged', { detail: invitation.menage }));
        } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur lors de l\'acceptation');
        } finally {
        setLoading(false);
        }
    };

    const refuserInvitation = async (invitation) => {
        setLoading(true);
        try {
        await api.post(`/invitations/${invitation.id_invitation}/refuser`);
        setInvitations(invitations.filter(i => i.id_invitation !== invitation.id_invitation));
        toast.success('Invitation refusée');
        } catch (error) {
        toast.error(error.response?.data?.message || 'Erreur');
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="relative">
        <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
            {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {totalNotifications > 99 ? '99+' : totalNotifications}
            </span>
            )}
            <FiBell className="w-5 h-5 text-gray-600" />
        </button>

        {showDropdown && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 overflow-hidden">
            <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {totalNotifications > 0 && (
                <span className="text-xs text-gray-500">{totalNotifications} nouvelle(s)</span>
                )}
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
                {/* Invitations */}
                {invitations.length > 0 && (
                <div className="border-b">
                    <div className="p-2 bg-green-50">
                    <p className="text-xs font-semibold text-green-600 flex items-center gap-1">
                        <FiUserPlus /> Invitations en attente
                    </p>
                    </div>
                    {invitations.map((invitation) => (
                    <div key={invitation.id_invitation} className="p-4 border-b hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiHome className="text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                            Invitation à rejoindre "{invitation.menage.nom_menage}"
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                            De : {invitation.expediteur?.nom || invitation.expediteur?.email}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                            Rôle : {invitation.role === 'admin' ? 'Administrateur' : 'Membre'}
                            </p>
                            <p className="text-xs text-gray-400">
                            Expire le : {new Date(invitation.date_expiration).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => accepterInvitation(invitation)}
                                disabled={loading}
                                className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                            >
                                <FiCheck className="w-3 h-3" /> Accepter
                            </button>
                            <button
                                onClick={() => refuserInvitation(invitation)}
                                disabled={loading}
                                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1"
                            >
                                <FiX className="w-3 h-3" /> Refuser
                            </button>
                            </div>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                )}

                {/* Alertes budget */}
                {alertes.length > 0 && (
                <div>
                    <div className="p-2 bg-orange-50">
                    <p className="text-xs font-semibold text-orange-600">Alertes budget</p>
                    </div>
                    {alertes.map((alerte) => (
                    <div key={alerte.id_alerte} className="p-4 border-b hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiBell className="text-orange-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-800">{alerte.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                            {new Date(alerte.date_creation).toLocaleString()}
                            </p>
                            <button
                            onClick={() => marquerAlerteLue(alerte.id_alerte)}
                            className="text-xs text-blue-500 hover:text-blue-700 mt-2"
                            >
                            Marquer comme lue
                            </button>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                )}

                {/* Aucune notification */}
                {totalNotifications === 0 && (
                <div className="p-8 text-center">
                    <FiBell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Aucune notification</p>
                    <p className="text-xs text-gray-400 mt-1">
                    Les invitations et alertes apparaîtront ici
                    </p>
                </div>
                )}
            </div>

            {totalNotifications > 0 && (
                <div className="p-2 border-t bg-gray-50">
                <button
                    onClick={() => setShowDropdown(false)}
                    className="w-full text-center text-xs text-gray-500 hover:text-gray-700"
                >
                    Fermer
                </button>
                </div>
            )}
            </div>
        )}
        </div>
    );
};

export default NotificationBell;