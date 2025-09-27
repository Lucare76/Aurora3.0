import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

const TopCategoriesWidget = ({ limit = 5, timeRange = 'month' }) => {
  const { transactions } = useFinance();

  const categoryStats = useMemo(() => {
    // Filtra transazioni per periodo
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setFullYear(2000); // All time
    }

    const filteredTransactions = transactions.filter(t => 
      new Date(t.date) >= startDate
    );

    // Raggruppa per categoria
    const categoryTotals = {};
    const categoryCounts = {};
    
    filteredTransactions.forEach(transaction => {
      const category = transaction.category || 'Altri';
      const amount = Math.abs(transaction.amount);
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = { income: 0, expenses: 0, net: 0 };
        categoryCounts[category] = { income: 0, expenses: 0, total: 0 };
      }
      
      if (transaction.amount > 0) {
        categoryTotals[category].income += amount;
        categoryCounts[category].income++;
      } else {
        categoryTotals[category].expenses += amount;
        categoryCounts[category].expenses++;
      }
      
      categoryTotals[category].net = categoryTotals[category].income - categoryTotals[category].expenses;
      categoryCounts[category].total++;
    });

    // Converti in array e ordina per spese (più rilevante)
    return Object.entries(categoryTotals)
      .map(([category, totals]) => ({
        category,
        ...totals,
        count: categoryCounts[category].total,
        avgTransaction: totals.expenses > 0 ? totals.expenses / categoryCounts[category].expenses : 0
      }))
      .sort((a, b) => b.expenses - a.expenses)
      .slice(0, limit);
  }, [transactions, limit, timeRange]);

  const totalExpenses = categoryStats.reduce((sum, cat) => sum + cat.expenses, 0);

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week': return 'Ultima settimana';
      case 'month': return 'Ultimo mese';
      case '3months': return 'Ultimi 3 mesi';
      case '6months': return 'Ultimi 6 mesi';
      case 'year': return 'Ultimo anno';
      default: return 'Tutti i periodi';
    }
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

  if (categoryStats.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Top Categorie
          </h3>
          <span className="text-sm text-gray-500">{getTimeRangeLabel()}</span>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>Nessuna spesa nel periodo selezionato</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Top {limit} Categorie
        </h3>
        <span className="text-sm text-gray-500">{getTimeRangeLabel()}</span>
      </div>

      <div className="space-y-4">
        {categoryStats.map((category, index) => {
          const percentage = totalExpenses > 0 ? (category.expenses / totalExpenses) * 100 : 0;
          const isTopCategory = index === 0;
          
          return (
            <div key={category.category} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{getCategoryIcon(category.category)}</span>
                  <div>
                    <span className="font-medium text-gray-800">
                      {category.category}
                    </span>
                    {isTopCategory && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Top
                      </span>
                    )}
                    <p className="text-xs text-gray-500">
                      {category.count} transazioni • Media €{category.avgTransaction.toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">
                    €{category.expenses.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isTopCategory ? 'bg-blue-600' : 'bg-blue-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {/* Net balance indicator */}
              {category.net !== 0 && (
                <div className="flex items-center justify-end mt-1">
                  {category.net > 0 ? (
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +€{category.net.toFixed(0)}
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-red-600">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      €{category.net.toFixed(0)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Totale Top {categoryStats.length} Categorie
          </span>
          <span className="font-semibold text-gray-800">
            €{totalExpenses.toFixed(2)}
          </span>
        </div>
        {categoryStats.length > 0 && (
          <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
            <span>
              Media per categoria: €{(totalExpenses / categoryStats.length).toFixed(0)}
            </span>
            <span>
              {categoryStats.reduce((sum, cat) => sum + cat.count, 0)} transazioni totali
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCategoriesWidget;