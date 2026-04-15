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
    const [initialized, setInitialized] = useState(false);

    const fetchMenages = async () => {
        try {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        
        const response = await api.get('/menages/utilisateur/menages');
        
        const menagesData = response.data || [];
        
        console.log('✅ Ménages récupérés:', menagesData.length);
        console.log('📋 Données:', menagesData);
        
        setMenages(menagesData);
        
        if (menagesData.length > 0) {
            const savedMenage = localStorage.getItem('menageActif');
            if (savedMenage) {
            try {
                const parsed = JSON.parse(savedMenage);
                const stillExists = menagesData.find(m => m.id_menage === parsed.id_menage);
                if (stillExists) {
                console.log('📌 Ménage actif restauré:', stillExists.nom_menage);
                setMenageActif(stillExists);
                } else {
                console.log('📌 Premier ménage sélectionné par défaut');
                setMenageActif(menagesData[0]);
                }
            } catch (e) {
                setMenageActif(menagesData[0]);
            }
            } else {
            console.log('📌 Premier ménage sélectionné par défaut');
            setMenageActif(menagesData[0]);
            }
        } else {
            console.warn('⚠️ Aucun ménage trouvé pour cet utilisateur');
            setMenageActif(null);
        }
        } catch (error) {
        console.error('❌ Erreur chargement ménages:', error);
        console.error('Détails:', error.response?.data || error.message);
        setMenageActif(null);
        } finally {
        setLoading(false);
        setInitialized(true);
        }
    };

    const changerMenage = (menage) => {
        console.log('🔄 Changement de ménage:', menage.nom_menage);
        setMenageActif(menage);
        localStorage.setItem('menageActif', JSON.stringify(menage));
    };

    useEffect(() => {
        fetchMenages();
    }, []);

    return (
        <MenageContext.Provider value={{
        menages,
        menageActif,
        loading,
        initialized,
        changerMenage,
        fetchMenages,
        refetchMenages: fetchMenages
        }}>
        {children}
        </MenageContext.Provider>
    );
};