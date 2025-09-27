import React from 'react';
import { FinanceProvider } from './contexts/FinanceContext';
import { BirthdaysProvider } from './contexts/BirthdaysContext';
import { WidgetSettingsProvider } from './contexts/WidgetSettingsContext';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <FinanceProvider>
      <BirthdaysProvider>
        <WidgetSettingsProvider>
          <Dashboard />
        </WidgetSettingsProvider>
      </BirthdaysProvider>
    </FinanceProvider>
  );
}

export default App;