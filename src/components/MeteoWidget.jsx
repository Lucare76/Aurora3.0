import { useEffect, useState } from 'react';

const MeteoWidget = () => {
  const [meteo, setMeteo] = useState(null);
  const [errore, setErrore] = useState(null);

  useEffect(() => {
    const fetchMeteo = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Casamicciola%20Terme,it&units=metric&lang=it&appid=5101464bb708304b700711cf434ca908`
        );
        if (!response.ok) throw new Error('Errore nella richiesta meteo');
        const data = await response.json();
        setMeteo(data);
      } catch (err) {
        setErrore(err.message);
      }
    };

    fetchMeteo();
  }, []);

  if (errore) return <div>🌦️ Meteo: Errore nel caricamento</div>;
  if (!meteo) return <div>🌦️ Meteo: Caricamento...</div>;

  const { main, weather, name } = meteo;
  const temperatura = Math.round(main.temp);
  const condizione = weather[0].description;
  const icona = weather[0].icon;

  return (
    <div>
      <h4>🌤️ Meteo a {name}</h4>
      <img
        src={`https://openweathermap.org/img/wn/${icona}@2x.png`}
        alt={condizione}
        style={{ verticalAlign: 'middle' }}
      />
      <span style={{ fontSize: '1.2rem' }}>
        {temperatura}°C — {condizione}
      </span>
    </div>
  );
};

export default MeteoWidget;
