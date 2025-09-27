import { createContext, useContext, useState, useEffect } from 'react';

const WidgetSettingsContext = createContext();

export const useWidgetSettings = () => {
  const context = useContext(WidgetSettingsContext);
  if (!context) {
    throw new Error('useWidgetSettings must be used within a WidgetSettingsProvider');
  }
  return context;
};

export const WidgetSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    weather: {
      enabled: true,
      location: 'Milano, IT',
      autoLocation: false
    },
    saint: {
      enabled: true
    },
    birthdays: {
      enabled: false,
      showUpcoming: true,
      daysAhead: 30
    }
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('aurora-widget-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading widget settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aurora-widget-settings', JSON.stringify(settings));
  }, [settings]);

  const updateWeatherSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      weather: { ...prev.weather, ...newSettings }
    }));
  };

  const updateSaintSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      saint: { ...prev.saint, ...newSettings }
    }));
  };

  const updateBirthdaySettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      birthdays: { ...prev.birthdays, ...newSettings }
    }));
  };

  const toggleWidget = (widgetName) => {
    setSettings(prev => ({
      ...prev,
      [widgetName]: {
        ...prev[widgetName],
        enabled: !prev[widgetName].enabled
      }
    }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      weather: {
        enabled: true,
        location: 'Milano, IT',
        autoLocation: false
      },
      saint: {
        enabled: true
      },
      birthdays: {
        enabled: false,
        showUpcoming: true,
        daysAhead: 30
      }
    };
    setSettings(defaultSettings);
  };

  const value = {
    settings,
    updateWeatherSettings,
    updateSaintSettings,
    updateBirthdaySettings,
    toggleWidget,
    resetSettings
  };

  return (
    <WidgetSettingsContext.Provider value={value}>
      {children}
    </WidgetSettingsContext.Provider>
  );
};