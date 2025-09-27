import { useFinance } from '../contexts/FinanceContext';
import { Download, FileText, Calendar } from 'lucide-react';

const ExportManager = () => {
  const { transactions } = useFinance();

  const exportToCSV = () => {
    const headers = ['Data', 'Descrizione', 'Tipo', 'Importo', 'Categoria'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        new Date(t.date).toLocaleDateString('it-IT'),
        `"${t.description}"`,
        t.type === 'income' ? 'Entrata' : 'Spesa',
        t.amount.toFixed(2),
        `"${t.category}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `aurora-transactions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `aurora-transactions-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="aurora-card">
      <div className="flex items-center gap-3 mb-6">
        <Download className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Esporta Dati</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={exportToCSV}
          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FileText className="h-5 w-5 text-green-600" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">Esporta CSV</h3>
            <p className="text-sm text-gray-600">Per Excel e fogli di calcolo</p>
          </div>
        </button>

        <button
          onClick={exportToJSON}
          className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Calendar className="h-5 w-5 text-blue-600" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">Esporta JSON</h3>
            <p className="text-sm text-gray-600">Per backup e sviluppatori</p>
          </div>
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>{transactions.length}</strong> transazioni disponibili per l'esportazione
        </p>
      </div>
    </div>
  );
};

export default ExportManager;