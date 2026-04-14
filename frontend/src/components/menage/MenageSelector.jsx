import React, { useState, useCallback } from 'react';
import { FiChevronDown, FiHome, FiCheck } from 'react-icons/fi';
import { useMenage } from '../../context/MenageContext';

const MenageSelector = () => {
    const { menages, menageActif, changerMenage, loading } = useMenage();
    const [isOpen, setIsOpen] = useState(false);

    const handleMenageClick = useCallback((menage) => {
        changerMenage(menage);
        setIsOpen(false);
    }, [changerMenage]);

    if (loading) {
        return (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500">Chargement...</span>
        </div>
        );
    }

    if (!menageActif) {
        return null;
    }

    return (
        <div className="relative">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
            <FiHome className="text-primary-500" />
            <span className="font-medium text-gray-700">{menageActif.nom_menage}</span>
            <FiChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-50 overflow-hidden">
            <div className="p-2 border-b bg-gray-50">
                <p className="text-xs text-gray-500">Vos ménages</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {menages.map((menage) => (
                <button
                    key={menage.id_menage}
                    onClick={() => handleMenageClick(menage)}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                    menageActif.id_menage === menage.id_menage ? 'bg-primary-50' : ''
                    }`}
                >
                    <div className="flex items-center gap-3">
                    <FiHome className={menageActif.id_menage === menage.id_menage ? 'text-primary-500' : 'text-gray-400'} />
                    <div className="text-left">
                        <p className="text-sm font-medium text-gray-700">{menage.nom_menage}</p>
                        <p className="text-xs text-gray-400">
                        {menage.role === 'admin' ? 'Administrateur' : 'Membre'}
                        </p>
                    </div>
                    </div>
                    {menageActif.id_menage === menage.id_menage && (
                    <FiCheck className="text-primary-500" />
                    )}
                </button>
                ))}
            </div>
            </div>
        )}
        </div>
    );
};

export default MenageSelector;