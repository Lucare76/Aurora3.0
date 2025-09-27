import React, { useState, useMemo } from 'react';
import { Plus, Download, Filter, ChevronDown } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import TransactionForm from '../TransactionForm';
import ImportUnifiedButton from '../ImportUnifiedButton';

const MovementsPage = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Mensile');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [viewMode, setViewMode] = useState('Mensile'); // Mensile o Personalizzato

  // Mesi per la visualizzazione
  const months = [
    { key: '01', label: 'Gen' },
    { key: '02', label: 'Feb' },
    { key: '03', label: 'Mar' },
    { key: '04', label: 'Apr' },
    { key: '05', label: 'Mag' },
    { key: '06', label: 'Giu' },
    { key: '07', label: 'Lug' },
    { key: '08', label: 'Ago' },
    { key: '09', label: 'Set' },
    { key: '10', label: 'Ott' },
    { key: '11', label: 'Nov' },
    { key: '12', label: 'Dic' }
  ];

  const filteredTransactions = useMemo(() => {
    if (!selectedMonth) return transactions;
    
    return transactions.filter(transaction => {
      const transactionMonth = transaction.date.slice(5, 7); // Estrae MM da YYYY-MM-DD
      return transactionMonth === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  const handleSubmit = (formData) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, formData);
      setEditingTransaction(null);
    } else {
      addTransaction(formData);
    }
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Alimentari': '🍕',
      'Trasporti': '🚗',
      'Casa': '🏠',
      'Shopping': '🛍️',
      'Salute': '⚕️',
      'Intrattenimento': '🎬',
      'Stipendio': '💼',
      'Altri': '📊'
    };
    return icons[category] || '📊';
  };

  return (
    <div className="space-y-6">
      {/* Header - Layout Originale */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimenti</h1>
        </div>
        
        <div className="flex gap-3">
          {/* Tasto Importa - NUOVO */}
          <ImportUnifiedButton />
          
          {/* Esporta PDF - Originale */}
          <button className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Esporta PDF
          </button>
          
          {/* Nuovo Movimento - Originale */}
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Movimento
          </button>
        </div>
      </div>

      {/* Filtri Periodo - Layout Originale */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Seleziona il periodo:</span>
          </div>
          
          <div className="relative">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Mensile">Mensile</option>
              <option value="Personalizzato">Personalizzato</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Mesi Cliccabili - Layout Originale */}
        <div className="flex gap-2 flex-wrap">
          {months.map((month) => (
            <button
              key={month.key}
              onClick={() => setSelectedMonth(selectedMonth === month.key ? '' : month.key)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedMonth === month.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {month.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabella Transazioni - Layout Originale */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header Tabella */}
        <div className="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">
          <div>DATA</div>
          <div>CATEGORIA</div>
          <div>DESCRIZIONE</div>
          <div>RISORSA</div>
          <div>ENTRATA</div>
          <div>USCITA</div>
          <div>SALDO</div>
        </div>

        {/* Righe Transazioni */}
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Nessuna transazione trovata per il periodo selezionato.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction, index) => (
              <div key={transaction.id} className="grid grid-cols-7 gap-4 p-4 text-sm hover:bg-gray-50">
                <div className="text-gray-900">
                  {formatDate(transaction.date)}
                </div>
                <div className="flex items-center">
                  <span className="mr-2">{getCategoryIcon(transaction.category)}</span>
                  <span className="text-gray-700">{transaction.category || 'Altri'}</span>
                </div>
                <div className="text-gray-900">
                  {transaction.description}
                </div>
                <div className="text-gray-600">
                  {transaction.paymentMethod || 'N/A'}
                </div>
                <div className="text-green-600 font-medium">
                  {transaction.amount > 0 ? `€${transaction.amount.toFixed(2)}` : ''}
                </div>
                <div className="text-red-600 font-medium">
                  {transaction.amount < 0 ? `€${Math.abs(transaction.amount).toFixed(2)}` : ''}
                </div>
                <div className={`font-medium ${
                  transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  €{transaction.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form - Mantieni originale */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <TransactionForm
              transaction={editingTransaction}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTransaction(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementsPage;