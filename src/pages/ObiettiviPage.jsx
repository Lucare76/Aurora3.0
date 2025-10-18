// src/pages/ObiettiviPage.jsx
import AggiungiObiettivo from '../components/AggiungiObiettivo';
import ObiettiviList from '../components/ObiettiviList';

const ObiettiviPage = () => {
  return (
    <div className="page-layout">
      <h2>🎯 Obiettivi di Risparmio</h2>
      <AggiungiObiettivo />
      <ObiettiviList />
    </div>
  );
};

export default ObiettiviPage;
