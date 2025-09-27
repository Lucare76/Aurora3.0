import React from 'react';
import { X, Check, Edit } from 'lucide-react';

const AutoCategorizationModal = ({ isOpen, transactions, onApply, onClose }) => {
  if (!isOpen) return null;

  const categories = ['Alimentari', 'Trasporti', 'Casa', 'Shopping', 'Salute', 'Intrattenimento', 'Stipendio', 'Altri'];

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Categorizzazione Automatica</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <p className="text-gray-600 mb-4">
            Rivedi le categorie suggerite per le tue transazioni:
          </p>

          <div className="space-y-3">
            {transactions?.map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center flex-1">
                  <span className="text-2xl mr-3">{getCategoryIcon(transaction.suggestedCategory)}</span>
                  <div className="flex-1">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      €{Math.abs(transaction.amount).toFixed(2)} • {new Date(transaction.date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <select 
                    value={transaction.suggestedCategory}
                    onChange={(e) => {
                      transaction.suggestedCategory = e.target.value;
                    }}
                    className="border border-gray-300 rounded px-3 py-1"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <span className="text-sm text-green-600 font-medium">
                    {transaction.confidence}% sicuro
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annulla
          </button>
          <button
            onClick={() => onApply(transactions)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            Applica Categorie
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoCategorizationModal;