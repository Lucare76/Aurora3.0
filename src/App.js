import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LayoutDashboard from './components/LayoutDashboard';
import Dashboard from './pages/Dashboard';
import TransazioniPage from './pages/TransazioniPage';
import ContiPage from './pages/ContiPage';
import ObiettiviPage from './pages/ObiettiviPage';
import StatistichePage from './pages/StatistichePage';
import InfoGiornalieraPage from './pages/InfoGiornalieraPage';
import ImpostazioniDashboard from './pages/ImpostazioniDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Reindirizza / verso /dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Layout con sidebar */}
        <Route element={<LayoutDashboard />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transazioni" element={<TransazioniPage />} />
          <Route path="/conti" element={<ContiPage />} />
          <Route path="/obiettivi" element={<ObiettiviPage />} />
          <Route path="/statistiche" element={<StatistichePage />} />
          <Route path="/giornaliera" element={<InfoGiornalieraPage />} />
          <Route path="/impostazioni" element={<ImpostazioniDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
