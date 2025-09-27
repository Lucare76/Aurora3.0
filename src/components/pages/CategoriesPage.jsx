import { useState } from 'react';
import { useFinance } from '../../contexts/FinanceContext';
import { Tag, Plus, Trash2, Edit3 } from 'lucide-react';

const CategoriesPage = () => {
  const { transactions } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getCategoryStats = () => {
    const stats = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category || 'Altro';
      const type = transaction.type;
      
      if (!stats[category]) {
        stats[category] = { income: 0, expense: 0, count: 0 };
      }
      
      stats[category][type] += transaction.amount;
      stats[category].count += 1;
    });

    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data,
      total: data.income - data.expense
    }));
  };

  const categoryStats = getCategoryStats();

  const defaultCategories = {
    income: ['Stipendio', 'Freelance', 'Investimenti', 'Regalo', 'Altro'],
    expense: ['Alimentari', 'Trasporti', 'Bollette', 'Svago', 'Salute', 'Shopping', 'Altro']
  };

  return (
    <div className="animate-slide-up">
      <div className="aurora-page-header">
        <h1 className="aurora-page-title">Categorie</h1>
        <p className="aurora-page-subtitle">Gestisci le categorie delle tue transazioni</p>
      </div>

      {/* Categories Stats */}
      <div className="aurora-card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Statistiche Categorie</h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuova Categoria
          </button>
        </div>

        {categoryStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((category) => (
              <div key={category.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-500 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transazioni:</span>
                    <span className="font-medium">{category.count}</span>
                  </div>
                  {category.income > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Entrate:</span>
                      <span className="text-green-600">{formatCurrency(category.income)}</span>
                    </div>
                  )}
                  {category.expense > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Spese:</span>
                      <span className="text-red-600">{formatCurrency(category.expense)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Totale:</span>
                    <span className={`font-semibold ${category.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(category.total)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nessuna categoria utilizzata ancora
          </div>
        )}
      </div>

      {/* Default Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aurora-card">
          <h3 className="text-lg font-semibold mb-4 text-green-600">Categorie Entrate</h3>
          <div className="space-y-2">
            {defaultCategories.income.map(category => (
              <div key={category} className="flex items-center gap-3 p-2 border rounded-lg">
                <Tag className="h-4 w-4 text-green-600" />
                <span>{category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="aurora-card">
          <h3 className="text-lg font-semibold mb-4 text-red-600">Categorie Spese</h3>
          <div className="space-y-2">
            {defaultCategories.expense.map(category => (
              <div key={category} className="flex items-center gap-3 p-2 border rounded-lg">
                <Tag className="h-4 w-4 text-red-600" />
                <span>{category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;