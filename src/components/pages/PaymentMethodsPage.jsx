import { useState } from 'react';
import { Plus, Edit3, Trash2, CreditCard, Wallet, Building, Eye, EyeOff, Star } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

const PaymentMethodsPage = () => {
  const { 
    paymentMethods, 
    addPaymentMethod, 
    updatePaymentMethod, 
    deletePaymentMethod, 
    toggleMethodStatus, 
    setPrimaryMethod 
  } = useFinance();
  
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getMethodIcon = (type) => {
    switch (type) {
      case 'bank': return Building;
      case 'credit': return CreditCard;
      case 'cash': return Wallet;
      default: return Wallet;
    }
  };

  const getMethodColor = (type) => {
    switch (type) {
      case 'bank': return '#3b82f6';
      case 'credit': return '#ef4444';
      case 'cash': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getMethodTypeName = (type) => {
    switch (type) {
      case 'bank': return 'Conto Bancario';
      case 'credit': return 'Carta di Credito';
      case 'cash': return 'Contanti';
      default: return 'Altro';
    }
  };

  const handleAddMethod = (methodData) => {
    addPaymentMethod(methodData);
  };

  const handleEditMethod = (methodData) => {
    updatePaymentMethod(editingMethod.id, methodData);
  };

  const handleDeleteMethod = (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo metodo di pagamento?')) {
      deletePaymentMethod(id);
    }
  };

  const totalBalance = paymentMethods.reduce((sum, method) => sum + method.balance, 0);
  const activeMethodsCount = paymentMethods.filter(m => m.active).length;

  return (
    <div className="animate-slide-up">
      {/* Page Header */}
      <div className="aurora-page-header">
        <h1 className="aurora-page-title">Metodi di Pagamento</h1>
        <p className="aurora-page-subtitle">Gestisci i tuoi conti e metodi di pagamento</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="aurora-card text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">{formatCurrency(totalBalance)}</div>
          <div className="text-sm text-gray-600">Bilancio Totale</div>
        </div>
        <div className="aurora-card text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">{activeMethodsCount}</div>
          <div className="text-sm text-gray-600">Metodi Attivi</div>
        </div>
        <div className="aurora-card text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">{paymentMethods.length}</div>
          <div className="text-sm text-gray-600">Metodi Configurati</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="aurora-card mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">{paymentMethods.length}</span> metodi di pagamento totali
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuovo Metodo
          </button>
        </div>
      </div>

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            formatCurrency={formatCurrency}
            getMethodIcon={getMethodIcon}
            getMethodColor={getMethodColor}
            getMethodTypeName={getMethodTypeName}
            onEdit={() => {
              setEditingMethod(method);
              setShowForm(true);
            }}
            onDelete={() => handleDeleteMethod(method.id)}
            onToggleStatus={() => toggleMethodStatus(method.id)}
            onSetPrimary={() => setPrimaryMethod(method.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {paymentMethods.length === 0 && (
        <div className="aurora-card text-center py-12">
          <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nessun metodo di pagamento</h3>
          <p className="text-gray-600 mb-6">Aggiungi il tuo primo metodo di pagamento per iniziare</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Aggiungi Metodo
          </button>
        </div>
      )}

      {/* Payment Method Form Modal */}
      {showForm && (
        <PaymentMethodModal
          method={editingMethod}
          onClose={() => {
            setShowForm(false);
            setEditingMethod(null);
          }}
          onSubmit={editingMethod ? handleEditMethod : handleAddMethod}
        />
      )}
    </div>
  );
};

// Payment Method Card Component
const PaymentMethodCard = ({ 
  method, 
  formatCurrency, 
  getMethodIcon, 
  getMethodColor, 
  getMethodTypeName,
  onEdit, 
  onDelete, 
  onToggleStatus, 
  onSetPrimary 
}) => {
  const Icon = getMethodIcon(method.type);
  const color = getMethodColor(method.type);

  return (
    <div className={`aurora-card relative ${!method.active ? 'opacity-60' : ''}`}>
      {method.primary && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Star className="h-3 w-3" />
            Principale
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20`, color: color }}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{method.name}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {getMethodTypeName(method.type)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleStatus}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={method.active ? 'Disattiva' : 'Attiva'}
          >
            {method.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          <button
            onClick={onEdit}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="Modifica"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:text-red-800 transition-colors"
            title="Elimina"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-center">
          <div className={`text-2xl font-bold ${method.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(method.balance)}
          </div>
          <div className="text-sm text-gray-600">Saldo Disponibile</div>
        </div>

        <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
          {method.details}
        </div>

        {!method.primary && (
          <button
            onClick={onSetPrimary}
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Imposta come principale
          </button>
        )}
      </div>
    </div>
  );
};

// Payment Method Modal Component
const PaymentMethodModal = ({ method, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: method?.name || '',
    type: method?.type || 'bank',
    balance: method?.balance?.toString() || '0',
    details: method?.details || ''
  });

  const methodTypes = [
    { value: 'bank', label: 'Conto Bancario', icon: Building },
    { value: 'credit', label: 'Carta di Credito', icon: CreditCard },
    { value: 'cash', label: 'Contanti', icon: Wallet }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSubmit({
      ...formData,
      balance: parseFloat(formData.balance) || 0
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {method ? 'Modifica Metodo' : 'Nuovo Metodo di Pagamento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="Nome del metodo di pagamento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <div className="space-y-2">
              {methodTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <label key={type.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mr-3"
                    />
                    <Icon className="h-5 w-5 mr-2 text-gray-600" />
                    <span>{type.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Saldo Iniziale (€)</label>
            <input
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dettagli {formData.type === 'bank' ? '(IBAN)' : formData.type === 'credit' ? '(Ultime 4 cifre)' : '(Descrizione)'}
            </label>
            <input
              type="text"
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                formData.type === 'bank' ? 'IT60 X054 2811 1010 0000 0123 456' :
                formData.type === 'credit' ? '**** **** **** 1234' :
                'Descrizione...'
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {method ? 'Aggiorna' : 'Crea'} Metodo
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodsPage;