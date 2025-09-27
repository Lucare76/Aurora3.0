import React, { useState, useRef } from 'react';
import { Upload, ChevronDown } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { parsePosteItalianeCSV, parseIntesaSanpaoloCSV } from '../utils/csvParser';

const ImportUnifiedButton = ({ onImportComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { addTransactions } = useFinance();

  const banks = [
    { id: 'poste', name: 'Poste Italiane', parser: parsePosteItalianeCSV },
    { id: 'intesa', name: 'Intesa Sanpaolo', parser: parseIntesaSanpaoloCSV }
  ];

  const handleBankSelect = (bank) => {
    setIsOpen(false);
    fileInputRef.current?.click();
    fileInputRef.current.dataset.bankId = bank.id;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const bankId = event.target.dataset.bankId;
    const bank = banks.find(b => b.id === bankId);
    
    if (!bank) {
      alert('Banca non supportata');
      return;
    }

    setIsLoading(true);

    try {
      const text = await file.text();
      const transactions = bank.parser(text);
      
      if (transactions.length === 0) {
        alert('Nessuna transazione trovata nel file CSV');
        return;
      }

      addTransactions(transactions);
      
      if (onImportComplete) {
        onImportComplete(transactions);
      }
      
      alert(`${transactions.length} transazioni importate con successo!`);
    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      alert('Errore durante l\'importazione del file CSV');
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:bg-gray-300"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isLoading ? 'Importando...' : 'Importa'}
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {banks.map((bank) => (
            <button
              key={bank.id}
              onClick={() => handleBankSelect(bank)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
            >
              {bank.name}
            </button>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default ImportUnifiedButton;