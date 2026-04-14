import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const MenageContext = createContext();

export const useMenage = () => {
    const context = useContext(MenageContext);
    if (!context) {
        throw new Error('useMenage must be used within MenageProvider');
    }
    return context;
    };

    export const MenageProvider = ({ children }) => {
    const [menages, setMenages] = useState([]);
    const [menageActif, setMenageActif] = useState(null);
    const [loading, setLoading] = useState(true);

    // Charger la liste des ménages de l'utilisateur
    const fetchMenages = async () => {
        try {
        const response = await api.get('menages/utilisateur/menages');
        setMenages(response.data);
        
        // Récupérer le dernier ménage actif depuis localStorage
        const savedMenage = localStorage.getItem('menageActif');
        if (savedMenage && response.data.length > 0) {
            const parsed = JSON.parse(savedMenage);
            const stillExists = response.data.find(m => m.id_menage === parsed.id_menage);
            if (stillExists) {
            setMenageActif(stillExists);
            } else {
            setMenageActif(response.data[0]);
            }
        } else if (response.data.length > 0) {
            setMenageActif(response.data[0]);
        }
        } catch (error) {
        console.error('Erreur chargement ménages:', error);
        } finally {
        setLoading(false);
        }
    };

    // Changer de ménage actif
    const changerMenage = (menage) => {
        setMenageActif(menage);
        localStorage.setItem('menageActif', JSON.stringify(menage));
        // Déclencher un événement pour rafraîchir les données
        window.dispatchEvent(new CustomEvent('menageChanged', { detail: menage }));
    };

    useEffect(() => {
        fetchMenages();
    }, []);

    return (
        <MenageContext.Provider value={{
        menages,
        menageActif,
        loading,
        changerMenage,
        refetchMenages: fetchMenages
        }}>
        {children}
        </MenageContext.Provider>
    );
};