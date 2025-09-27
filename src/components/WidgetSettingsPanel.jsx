import { useState } from 'react';
import { useWidgetSettings } from '../contexts/WidgetSettingsContext';
import { 
  Settings, 
  X, 
  Cloud, 
  User, 
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  RotateCcw,
  Save
} from 'lucide-react';

const WidgetSettingsPanel = ({ isOpen, onClose }) => {
  const { 
    settings, 
    updateWeatherSettings, 
    updateSaintSettings, 
    updateBirthdaySettings,
    toggleWidget,
    resetSettings 
  } = useWidgetSettings();

  const [tempLocation, setTempLocation] = useState(settings.weather.location);

  const handleSaveWeatherLocation = () => {
    updateWeatherSettings({ location: tempLocation });
  };

  const popularCities = [
    'Milano, IT',
    'Roma, IT',
    'Napoli, IT',
    'Torino, IT',
    'Firenze, IT',
    'Bologna, IT',
    'Venezia, IT',
    'Palermo, IT',
    'Genova, IT',
    'Bari, IT',
    'Ischia, IT',
    'Capri, IT'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Impostazioni Widget</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Weather Widget Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cloud className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-medium text-gray-900">Widget Meteo</h3>
              </div>
              <button
                onClick={() => toggleWidget('weather')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.weather.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.weather.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.weather.enabled && (
              <div className="ml-8 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Località
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempLocation}
                      onChange={(e) => setTempLocation(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Es: Ischia, IT"
                    />
                    <button
                      onClick={handleSaveWeatherLocation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Usa il formato: "NomeCittà, IT" (es: Ischia, IT)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Città Popolari
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {popularCities.map(city => (
                      <button
                        key={city}
                        onClick={() => {
                          setTempLocation(city);
                          updateWeatherSettings({ location: city });
                        }}
                        className={`p-2 text-sm rounded-lg border transition-colors ${
                          settings.weather.location === city
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {city.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Saint Widget Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-medium text-gray-900">Widget Santo del Giorno</h3>
              </div>
              <button
                onClick={() => toggleWidget('saint')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.saint.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.saint.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.saint.enabled && (
              <div className="ml-8 space-y-3">
                <p className="text-sm text-gray-600">
                  Il widget mostra il santo del giorno con nome, festa e descrizione.
                </p>
              </div>
            )}
          </div>

          {/* Birthday Widget Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-pink-500" />
                <h3 className="text-lg font-medium text-gray-900">Widget Compleanni</h3>
              </div>
              <button
                onClick={() => toggleWidget('birthdays')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.birthdays.enabled ? 'bg-pink-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.birthdays.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.birthdays.enabled && (
              <div className="ml-8 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giorni di anticipo per notifiche
                  </label>
                  <select
                    value={settings.birthdays.daysAhead}
                    onChange={(e) => updateBirthdaySettings({ daysAhead: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value={7}>7 giorni</option>
                    <option value={14}>14 giorni</option>
                    <option value={30}>30 giorni</option>
                    <option value={60}>60 giorni</option>
                  </select>
                </div>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.birthdays.showUpcoming}
                    onChange={(e) => updateBirthdaySettings({ showUpcoming: e.target.checked })}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">Mostra compleanni in arrivo</span>
                </label>
              </div>
            )}
          </div>

          {/* Reset Settings */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                resetSettings();
                setTempLocation('Milano, IT');
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Ripristina impostazioni predefinite
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetSettingsPanel;