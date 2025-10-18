// src/pages/ContiPage.jsx
import AggiungiConto from '../components/AggiungiConto';
import ContiList from '../components/ContiList';

const ContiPage = () => {
  return (
    <div className="page-layout">
      <h2>🏦 Gestione Conti</h2>
      <AggiungiConto />
      <ContiList />
    </div>
  );
};

export default ContiPage;
