import { Cloud, Sun, CloudRain, Snowflake, RefreshCw, MapPin, AlertCircle } from 'lucide-react';
import useWeather from '../../hooks/useWeather';
import { useWidgetSettings } from '../../contexts/WidgetSettingsContext';

const WeatherWidget = () => {
  const { settings } = useWidgetSettings();
  const { weather, loading, error, refresh } = useWeather(settings.weather.location);

  // Don't render if widget is disabled
  if (!settings.weather.enabled) {
    return null;
  }

  const getWeatherIcon = (condition, size = 'h-8 w-8') => {
    const iconClass = `${size} text-blue-500`;
    
    if (condition?.includes('rain') || condition?.includes('drizzle')) {
      return <CloudRain className={iconClass} />;
    }
    if (condition?.includes('snow')) {
      return <Snowflake className={iconClass} />;
    }
    if (condition?.includes('cloud')) {
      return <Cloud className={iconClass} />;
    }
    return <Sun className={iconClass} />;
  };

  const formatLocation = (location) => {
    return location.split(',')[0]; // Show only city name
  };

  const getLocationSuggestions = (location) => {
    const cityName = location.split(',')[0].toLowerCase();
    
    const suggestions = {
      'ischia': ['Ischia, IT', 'Ischia Porto, IT', 'Forio, IT'],
      'capri': ['Capri, IT', 'Anacapri, IT'],
      'procida': ['Procida, IT'],
      'sorrento': ['Sorrento, IT'],
      'amalfi': ['Amalfi, IT', 'Positano, IT', 'Ravello, IT']
    };

    return suggestions[cityName] || [`${location}, IT`];
  };

  if (loading) {
    return (
      <div className="aurora-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Meteo</h3>
          <div className="animate-spin">
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-16 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !weather || !weather.main || !weather.weather) {
    const suggestions = getLocationSuggestions(settings.weather.location);
    
    return (
      <div className="aurora-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Meteo</h3>
          <button
            onClick={refresh}
            className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center py-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 text-sm mb-3">
            {error || `Località "${formatLocation(settings.weather.location)}" non trovata`}
          </p>
          <div className="text-xs text-gray-600 mb-3">
            💡 Prova con:
          </div>
          <div className="space-y-1 mb-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {suggestion}
              </div>
            ))}
          </div>
          <button
            onClick={refresh}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  // Additional safety checks
  const temp = weather.main?.temp ?? 0;
  const feelsLike = weather.main?.feels_like ?? temp;
  const humidity = weather.main?.humidity ?? 0;
  const pressure = weather.main?.pressure ?? 0;
  const tempMin = weather.main?.temp_min ?? temp;
  const tempMax = weather.main?.temp_max ?? temp;
  const windSpeed = weather.wind?.speed ?? 0;
  const weatherDescription = weather.weather?.[0]?.description ?? 'N/A';
  const weatherMain = weather.weather?.[0]?.main ?? 'Clear';

  return (
    <div className="aurora-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Meteo</h3>
        <button
          onClick={refresh}
          className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
          title="Aggiorna"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">{formatLocation(settings.weather.location)}</span>
      </div>

      {/* Current Weather */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {Math.round(temp)}°C
          </div>
          <div className="text-sm text-gray-600 capitalize">
            {weatherDescription}
          </div>
        </div>
        <div className="text-right">
          {getWeatherIcon(weatherMain.toLowerCase(), 'h-12 w-12')}
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Percepita</span>
          <span className="font-medium">{Math.round(feelsLike)}°C</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Umidità</span>
          <span className="font-medium">{humidity}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Vento</span>
          <span className="font-medium">{Math.round(windSpeed)} km/h</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Pressione</span>
          <span className="font-medium">{pressure} hPa</span>
        </div>
      </div>

      {/* Min/Max Temperature */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm">
          <span className="text-gray-500">Min: </span>
          <span className="font-medium text-blue-600">{Math.round(tempMin)}°C</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Max: </span>
          <span className="font-medium text-red-600">{Math.round(tempMax)}°C</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;