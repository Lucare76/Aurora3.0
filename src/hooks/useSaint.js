import { useState, useEffect } from 'react';
import { getSaintOfTheDay } from '../data/saints.js';

const useSaint = () => {
  const [saint, setSaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchSaint = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ottieni la data corrente REALE
      const today = new Date();
      console.log('Data corrente:', today.toDateString());
      console.log('Mese:', today.getMonth() + 1, 'Giorno:', today.getDate());
      
      // Usa il database locale dei santi
      const todaySaint = getSaintOfTheDay(today);
      console.log('Santo trovato:', todaySaint);
      
      // Simula un piccolo delay per l'effetto loading
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setSaint(todaySaint);
    } catch (err) {
      console.error('Error fetching saint:', err);
      setError('Errore nel caricamento del santo del giorno');
      
      // Fallback saint con data corrente
      const today = new Date();
      setSaint({
        name: "Santo del Giorno",
        description: "Informazioni temporaneamente non disponibili",
        feast_day: today.toLocaleDateString('it-IT')
      });
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchSaint();
  };

  useEffect(() => {
    fetchSaint();
    
    // Aggiorna automaticamente a mezzanotte
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimer = setTimeout(() => {
      fetchSaint();
      
      // Imposta un intervallo per aggiornare ogni giorno
      const dailyInterval = setInterval(fetchSaint, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);
    
    return () => clearTimeout(midnightTimer);
  }, []);

  return {
    saint,
    loading,
    error,
    refresh,
    getTodayDate
  };
};

export default useSaint;