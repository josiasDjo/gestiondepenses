import { useState, useEffect, useCallback } from 'react';
import { useMenage } from '../context/MenageContext';
import api from '../services/api';

export const useMenageData = (endpoint, options = {}) => {
    const { menageActif } = useMenage();
    const [data, setData] = useState(options.initialData || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!menageActif) return;
        
        setLoading(true);
        try {
        const params = new URLSearchParams();
        params.append('id_menage', menageActif.id_menage);
        
        if (options.params) {
            Object.keys(options.params).forEach(key => {
            params.append(key, options.params[key]);
            });
        }
        
        const url = params.toString() ? `${endpoint}?${params}` : endpoint;
        const response = await api.get(url);
        setData(response.data);
        setError(null);
        } catch (err) {
        console.error(`Erreur fetch ${endpoint}:`, err);
        setError(err.response?.data?.message || err.message);
        } finally {
        setLoading(false);
        }
    }, [endpoint, menageActif, options.params]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const handleMenageChange = () => {
        fetchData();
        };
        
        window.addEventListener('menageChanged', handleMenageChange);
        return () => window.removeEventListener('menageChanged', handleMenageChange);
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
};