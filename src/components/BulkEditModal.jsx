import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Tag, 
  FileText, 
  AlertTriangle,
  Check,
  Edit3
} from 'lucide-react';

const BulkEditModal = ({ 
  isOpen, 
  onClose, 
  selectedTransactions, 
  onBulkUpdate,
  onBulkDelete,
  categories 
}) => {
  const [operation, setOperation] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = () => {
    if (!operation) return;
    
    if (operation === 'delete') {
      setShowConfirm(true);
      return;
    }

    const updates = {};
    if (operation === 'category' && newCategory) {
      updates.category = newCategory;
    }
    if (operation === 'note' && newNote) {
      updates.note = newNote;
    }

    onBulkUpdate(selectedTransactions.map(t => t.id), updates);
    handleClose();
  };

  const handleDelete = () => {
    onBulkDelete(selectedTransactions.map(t => t.id));
    handleClose();
  };

  const handleClose = () => {
    setOperation('');
    setNewCategory('');
    setNewNote('');
    setShowConfirm(false);
    onClose();
  };

  const totalAmount = selectedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const incomeCount = selectedTransactions.filter(t => t.amount > 0).length;
  const expenseCount = selectedTransactions.filter(t => t.amount < 0).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Edit3 className="w-5 h-5 mr-2 text-blue-600" />
            Operazioni Multiple
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showConfirm ? (
          <>
            {/* Summary */}
            <div className="p-6 border-b border-gray-100">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  📊 Transazioni Selezionate: {selectedTransactions.length}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700">
                      <span className="font-medium">Entrate:</span> {incomeCount}
                    </p>
                    <p className="text-blue-700">
                      <span className="font-medium">Uscite:</span> {expenseCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700">
                      <span className="font-medium">Totale:</span> €{totalAmount.toFixed(2)}
                    </p>
                    <p className={`font-medium ${totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalAmount >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operations */}
            <div className="p-6">
              <h3 className="font-medium text-gray-800 mb-4">Seleziona Operazione</h3>
              
              <div className="space-y-3">
                {/* Change Category */}
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    operation === 'category' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setOperation('category')}
                >
                  <div className="flex items-center mb-2">
                    <Tag className="w-5 h-5 mr-2 text-purple-600" />
                    <span className="font-medium text-gray-800">Cambia Categoria</span>
                  </div>
                  {operation === 'category' && (
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">Seleziona categoria...</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Add Note */}
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    operation === 'note' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setOperation('note')}
                >
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    <span className="font-medium text-gray-800">Aggiungi Note</span>
                  </div>
                  {operation === 'note' && (
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Inserisci una nota per tutte le transazioni selezionate..."
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>

                {/* Delete */}
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    operation === 'delete' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-red-200'
                  }`}
                  onClick={() => setOperation('delete')}
                >
                  <div className="flex items-center">
                    <Trash2 className="w-5 h-5 mr-2 text-red-600" />
                    <span className="font-medium text-gray-800">Elimina Transazioni</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    ⚠️ Questa operazione non può essere annullata
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleSubmit}
                disabled={!operation || (operation === 'category' && !newCategory) || (operation === 'note' && !newNote)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                {operation === 'delete' ? 'Elimina' : 'Applica Modifiche'}
              </button>
            </div>
          </>
        ) : (
          /* Confirmation Dialog */
          <div className="p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Conferma Eliminazione
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Sei sicuro di voler eliminare {selectedTransactions.length} transazioni?
                <br />
                <span className="font-medium text-red-600">
                  Questa operazione non può essere annullata.
                </span>
              </p>
              
              {/* Transaction preview */}
              <div className="bg-gray-50 p-3 rounded-lg mb-6 max-h-32 overflow-y-auto">
                {selectedTransactions.slice(0, 5).map((transaction, index) => (
                  <div key={transaction.id} className="flex justify-between items-center text-sm py-1">
                    <span className="text-gray-600 truncate">
                      {transaction.description || 'Transazione senza descrizione'}
                    </span>
                    <span className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                {selectedTransactions.length > 5 && (
                  <div className="text-xs text-gray-500 text-center mt-2">
                    ... e altre {selectedTransactions.length - 5} transazioni
                  </div>
                )}
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Elimina Definitivamente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkEditModal;