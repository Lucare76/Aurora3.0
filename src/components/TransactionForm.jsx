import React, { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

const TransactionForm = ({ isOpen, onClose, transaction = null }) => {
  const { addTransaction, updateTransaction, deleteTransaction, paymentMethods } = useFinance();
  const [formData, setFormData] = useState({
    date: '',
    amount: '',
    description: '',
    category: '',
    subcategory: '',
    paymentMethod: '',
    type: 'expense'
  });

  const categories = {
    income: {
      'Stipendio': ['Salario base', 'Straordinari', 'Bonus', 'Tredicesima', 'Quattordicesima'],
      'Freelance': ['Consulenza', 'Progetti', 'Servizi'],
      'Investimenti': ['Dividendi', 'Interessi', 'Capital gain'],
      'Altri': ['Regali', 'Rimborsi', 'Varie']
    },
    expense: {
      'Casa': ['Affitto', 'Mutuo', 'Bollette', 'Manutenzione', 'Arredamento'],
      'Trasporti': ['Carburante', 'Mezzi pubblici', 'Taxi', 'Manutenzione auto'],
      'Alimentari': ['Spesa', 'Ristoranti', 'Delivery', 'Bar'],
      'Salute': ['Medico', 'Farmaci', 'Palestra', 'Benessere'],
      'Intrattenimento': ['Cinema', 'Concerti', 'Viaggi', 'Hobby'],
      'Shopping': ['Abbigliamento', 'Elettronica', 'Libri', 'Regali'],
      'Servizi': ['Banca', 'Assicurazioni', 'Telefono', 'Internet'],
      'Altri': ['Tasse', 'Donazioni', 'Varie']
    }
  };

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
        amount: Math.abs(transaction.amount).toString(),
        description: transaction.description || '',
        category: transaction.category || '',
        subcategory: transaction.subcategory || '',
        paymentMethod: transaction.paymentMethod || '',
        type: transaction.amount >= 0 ? 'income' : 'expense'
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        category: '',
        subcategory: '',
        paymentMethod: paymentMethods.length > 0 ? paymentMethods[0].id : '',
        type: 'expense'
      });
    }
  }, [transaction, paymentMethods]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    const finalAmount = formData.type === 'expense' ? -amount : amount;
    
    const transactionData = {
      date: formData.date,
      amount: finalAmount,
      description: formData.description || 'Transazione', // Default description if empty
      category: formData.category,
      subcategory: formData.subcategory,
      paymentMethod: formData.paymentMethod,
      type: formData.type
    };

    if (transaction) {
      updateTransaction(transaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
    
    onClose();
  };

  const handleDelete = () => {
    if (transaction && window.confirm('Sei sicuro di voler eliminare questa transazione?')) {
      deleteTransaction(transaction.id);
      onClose();
    }
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      category,
      subcategory: '' // Reset subcategory when category changes
    }));
  };

  if (!isOpen) return null;

  const availableCategories = categories[formData.type] || {};
  const availableSubcategories = availableCategories[formData.category] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction ? 'Modifica Transazione' : 'Nuova Transazione'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, category: '', subcategory: '' }))}
                  className="mr-2"
                />
                <span className="text-green-600">Entrata</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, category: '', subcategory: '' }))}
                  className="mr-2"
                />
                <span className="text-red-600">Uscita</span>
              </label>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importo (€) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          {/* Description - Now Optional */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrizione
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrizione della transazione (opzionale)"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleziona categoria</option>
              {Object.keys(availableCategories).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          {formData.category && availableSubcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sottocategoria
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleziona sottocategoria</option>
                {availableSubcategories.map(subcategory => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metodo di Pagamento
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleziona metodo</option>
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>{method.name}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {transaction ? 'Aggiorna' : 'Salva'}
            </button>
            
            {transaction && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;