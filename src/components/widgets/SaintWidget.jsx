import { RefreshCw, Calendar } from 'lucide-react';
import useSaint from '../../hooks/useSaint';
import { useWidgetSettings } from '../../contexts/WidgetSettingsContext';

const SaintWidget = () => {
  const { saint, loading, error, refresh, getTodayDate } = useSaint();
  const { settings } = useWidgetSettings();

  // Don't render if widget is disabled
  if (!settings.saint.enabled) {
    return null;
  }

  if (loading) {
    return (
      <div className="aurora-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Santo del Giorno</h3>
          <div className="animate-spin">
            <RefreshCw className="h-4 w-4 text-purple-500" />
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

  if (error) {
    return (
      <div className="aurora-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Santo del Giorno</h3>
          <button
            onClick={refresh}
            className="p-1 text-purple-500 hover:text-purple-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⛪</div>
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <button
            onClick={refresh}
            className="text-xs text-purple-600 hover:text-purple-800"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!saint) return null;

  return (
    <div className="aurora-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Santo del Giorno</h3>
        <button
          onClick={refresh}
          className="p-1 text-purple-500 hover:text-purple-700 transition-colors"
          title="Aggiorna"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Date */}
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600 capitalize">{getTodayDate()}</span>
      </div>

      {/* Saint Main Info */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-4 animate-pulse">
          👼
        </div>
        <h4 className="text-2xl font-bold text-gray-800 mb-3">
          {saint.name}
        </h4>
        <p className="text-sm text-gray-600 mb-4">
          {saint.description}
        </p>
        <div className="inline-flex items-center gap-1 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          ✨ Festa: {saint.feast_day}
        </div>
      </div>
    </div>
  );
};

export default SaintWidget;