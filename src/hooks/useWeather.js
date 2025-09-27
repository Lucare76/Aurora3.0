import { useState, useEffect } from 'react';
import { useWidgetSettings } from '../contexts/WidgetSettingsContext';

const useWeather = () => {
  const { settings } = useWidgetSettings();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async (location = settings.weather.location) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock weather data based on location - formatted for OpenWeatherMap compatibility
      const weatherData = {
        'Milano, IT': {
          main: {
            temp: 22,
            feels_like: 24,
            humidity: 65,
            pressure: 1013,
            temp_min: 18,
            temp_max: 25
          },
          weather: [{
            main: 'Clouds',
            description: 'parzialmente nuvoloso'
          }],
          wind: {
            speed: 8
          },
          name: 'Milano'
        },
        'Roma, IT': {
          main: {
            temp: 26,
            feels_like: 28,
            humidity: 58,
            pressure: 1015,
            temp_min: 22,
            temp_max: 29
          },
          weather: [{
            main: 'Clear',
            description: 'soleggiato'
          }],
          wind: {
            speed: 6
          },
          name: 'Roma'
        },
        'Napoli, IT': {
          main: {
            temp: 24,
            feels_like: 26,
            humidity: 72,
            pressure: 1012,
            temp_min: 21,
            temp_max: 27
          },
          weather: [{
            main: 'Clear',
            description: 'sereno'
          }],
          wind: {
            speed: 12
          },
          name: 'Napoli'
        },
        'Torino, IT': {
          main: {
            temp: 19,
            feels_like: 21,
            humidity: 78,
            pressure: 1010,
            temp_min: 16,
            temp_max: 22
          },
          weather: [{
            main: 'Clouds',
            description: 'nuvoloso'
          }],
          wind: {
            speed: 4
          },
          name: 'Torino'
        },
        'Firenze, IT': {
          main: {
            temp: 23,
            feels_like: 25,
            humidity: 62,
            pressure: 1014,
            temp_min: 19,
            temp_max: 26
          },
          weather: [{
            main: 'Clear',
            description: 'parzialmente soleggiato'
          }],
          wind: {
            speed: 7
          },
          name: 'Firenze'
        },
        'Bologna, IT': {
          main: {
            temp: 21,
            feels_like: 23,
            humidity: 70,
            pressure: 1011,
            temp_min: 18,
            temp_max: 24
          },
          weather: [{
            main: 'Rain',
            description: 'variabile'
          }],
          wind: {
            speed: 9
          },
          name: 'Bologna'
        },
        'Venezia, IT': {
          main: {
            temp: 20,
            feels_like: 22,
            humidity: 85,
            pressure: 1009,
            temp_min: 17,
            temp_max: 23
          },
          weather: [{
            main: 'Mist',
            description: 'nebbioso'
          }],
          wind: {
            speed: 5
          },
          name: 'Venezia'
        },
        'Palermo, IT': {
          main: {
            temp: 27,
            feels_like: 30,
            humidity: 55,
            pressure: 1016,
            temp_min: 24,
            temp_max: 30
          },
          weather: [{
            main: 'Clear',
            description: 'soleggiato'
          }],
          wind: {
            speed: 14
          },
          name: 'Palermo'
        },
        'Genova, IT': {
          main: {
            temp: 22,
            feels_like: 24,
            humidity: 68,
            pressure: 1013,
            temp_min: 19,
            temp_max: 25
          },
          weather: [{
            main: 'Clear',
            description: 'sereno'
          }],
          wind: {
            speed: 11
          },
          name: 'Genova'
        },
        'Bari, IT': {
          main: {
            temp: 25,
            feels_like: 27,
            humidity: 64,
            pressure: 1014,
            temp_min: 22,
            temp_max: 28
          },
          weather: [{
            main: 'Clear',
            description: 'poco nuvoloso'
          }],
          wind: {
            speed: 13
          },
          name: 'Bari'
        },
        'Ischia, IT': {
          main: {
            temp: 24,
            feels_like: 26,
            humidity: 75,
            pressure: 1012,
            temp_min: 21,
            temp_max: 27
          },
          weather: [{
            main: 'Clear',
            description: 'soleggiato'
          }],
          wind: {
            speed: 10
          },
          name: 'Ischia'
        },
        'Capri, IT': {
          main: {
            temp: 23,
            feels_like: 25,
            humidity: 70,
            pressure: 1013,
            temp_min: 20,
            temp_max: 26
          },
          weather: [{
            main: 'Clear',
            description: 'sereno'
          }],
          wind: {
            speed: 12
          },
          name: 'Capri'
        }
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get weather for specified location
      const locationWeather = weatherData[location];
      
      if (!locationWeather) {
        throw new Error(`Località "${location}" non trovata`);
      }
      
      setWeather(locationWeather);
    } catch (err) {
      setError(err.message || 'Errore nel caricamento dei dati meteo');
      console.error('Weather API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (settings.weather.enabled) {
      fetchWeather(settings.weather.location);
    }
  }, [settings.weather.enabled, settings.weather.location]);

  useEffect(() => {
    if (!settings.weather.enabled) return;

    // Refresh weather data every 10 minutes
    const interval = setInterval(() => {
      fetchWeather(settings.weather.location);
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [settings.weather.enabled, settings.weather.location]);

  return {
    weather,
    loading,
    error,
    refresh: () => fetchWeather(settings.weather.location),
    enabled: settings.weather.enabled
  };
};

export default useWeather;