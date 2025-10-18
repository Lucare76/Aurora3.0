// src/components/MeteoInput.jsx
import { useState, useEffect } from 'react';

const MeteoInput = () => {
  const [citta, setCitta] = useState('Ischia');
  const [meteo, setMeteo] = useState(null);
  const [errore, setErrore] = useState(false);

  useEffect(() => {
    const fetchMeteo = async () => {
      const apiKey = 'TUO_API_KEY'; // Inserisci la tua API key
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${citta},it&units=metric&lang=it&appid=${apiKey}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.cod !== 200) {
          setErrore(true);
          setMeteo(null);
        } else {
          setErrore(false);
          setMeteo({
            temp: data.main.temp,
            descrizione: data.weather[0].description,
            icona: data.weather[0].icon
          });
        }
      } catch (error) {
        console.error('Errore meteo:', error);
        setErrore(true);
        setMeteo(null);
      }
    };

    fetchMeteo();
  }, [citta]);

  return (
    <div className="card">
      <h3>🌤️ Meteo</h3>
      <input
        type="text"
        value={citta}
        onChange={(e) => setCitta(e.target.value)}
        placeholder="Scrivi una città..."
        style={{ marginBottom: '0.5rem' }}
      />
      {errore ? (
        <p>❌ Città non trovata</p>
      ) : meteo ? (
        <div>
          <p>{meteo.temp}°C — {meteo.descrizione}</p>
          <img src={`https://openweathermap.org/img/wn/${meteo.icona}@2x.png`} alt="Icona Meteo" />
        </div>
      ) : (
        <p>Caricamento meteo...</p>
      )}
    </div>
  );
};

export default MeteoInput;
