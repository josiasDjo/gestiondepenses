// components/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import { FiBell, FiBellOff } from 'react-icons/fi';
import api from '../services/api';

const Notification = () => {
    const [alertes, setAlertes] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    
    useEffect(() => {
        fetchAlertes();
        const interval = setInterval(fetchAlertes, 60000); // Vérifier chaque minute
        return () => clearInterval(interval);
    }, []);
    
    const fetchAlertes = async () => {
        try {
        const response = await api.get('/alertes/non-lues');
        setAlertes(response.data);
        } catch (error) {
        console.error('Erreur chargement alertes:', error);
        }
    };
    
    const marquerLue = async (id) => {
        await api.put(`/alertes/${id}/lue`);
        setAlertes(alertes.filter(a => a.id_alerte !== id));
    };
    
    return (
        <div className="relative">
        <button onClick={() => setShowDropdown(!showDropdown)} className="relative">
            {alertes.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {alertes.length}
            </span>
            )}
            <FiBell className="w-6 h-6 text-gray-600" />
        </button>
        
        {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
            <div className="p-3 border-b">
                <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {alertes.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Aucune notification</p>
                ) : (
                alertes.map(alerte => (
                    <div key={alerte.id_alerte} className="p-3 border-b hover:bg-gray-50">
                    <p className="text-sm text-gray-800">{alerte.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {new Date(alerte.date_creation).toLocaleString()}
                    </p>
                    <button onClick={() => marquerLue(alerte.id_alerte)} className="text-xs text-blue-500 mt-1">
                        Marquer comme lue
                    </button>
                    </div>
                ))
                )}
            </div>
            </div>
        )}
        </div>
    );
};

export default Notification