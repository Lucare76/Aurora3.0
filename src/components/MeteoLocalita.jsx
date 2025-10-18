// src/components/MeteoLocalita.jsx
import { useEffect, useState } from 'react';

const MeteoLocalita = () => {
  const [citta, setCitta] = useState('Ischia');
  const [meteo, setMeteo] = useState(null);

  useEffect(() => {
    const fetchMeteo = async () => {
      const apiKey = 'TUO_API_KEY'; // Inserisci la tua API key
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${citta},it&units=metric&lang=it&appid=${apiKey}`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setMeteo({
          temp: data.main.temp,
          descrizione: data.weather[0].description,
          icona: data.weather[0].icon
        });
      } catch (error) {
        console.error('Errore meteo:', error);
        setMeteo(null);
      }
    };

    fetchMeteo();
  }, [citta]);

  return (
    <div className="card">
      <h3>🌤️ Meteo</h3>
      <label>
        Località:
        <select value={citta} onChange={(e) => setCitta(e.target.value)}>
          <option value="Ischia">Ischia</option>
          <option value="Napoli">Napoli</option>
          <option value="Milano">Milano</option>
          <option value="Roma">Roma</option>
          <option value="Torino">Torino</option>
        </select>
      </label>
      {meteo ? (
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

export default MeteoLocalita;
