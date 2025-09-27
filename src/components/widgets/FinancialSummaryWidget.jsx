import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  PiggyBank,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';

const FinancialSummaryWidget = ({ timeRange = 'month' }) => {
  const { transactions } = useFinance();

  const financialStats = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    
    // Calcola periodo corrente
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
        startDate.setFullYear(2000);
    }

    // Periodo precedente per confronto
    const previousStartDate = new Date(startDate);
    const periodLength = now.getTime() - startDate.getTime();
    previousStartDate.setTime(startDate.getTime() - periodLength);

    const currentTransactions = transactions.filter(t => 
      new Date(t.date) >= startDate && new Date(t.date) <= now
    );
    
    const previousTransactions = transactions.filter(t => 
      new Date(t.date) >= previousStartDate && new Date(t.date) < startDate
    );

    // Calcola statistiche periodo corrente
    const currentIncome = currentTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentExpenses = currentTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const currentNet = currentIncome - currentExpenses;

    // Calcola statistiche periodo precedente
    const previousIncome = previousTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const previousExpenses = previousTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const previousNet = previousIncome - previousExpenses;

    // Calcola variazioni percentuali
    const incomeChange = previousIncome > 0 ? 
      ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
    
    const expenseChange = previousExpenses > 0 ? 
      ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0;

    const netChange = previousNet !== 0 ? 
      ((currentNet - previousNet) / Math.abs(previousNet)) * 100 : 0;

    // Statistiche aggiuntive
    const avgTransactionValue = currentTransactions.length > 0 ? 
      Math.abs(currentTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)) / currentTransactions.length : 0;

    const transactionCount = currentTransactions.length;
    const previousTransactionCount = previousTransactions.length;
    const transactionCountChange = previousTransactionCount > 0 ? 
      ((transactionCount - previousTransactionCount) / previousTransactionCount) * 100 : 0;

    // Calcola saldo totale (tutte le transazioni)
    const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Categoria più spesa
    const categoryExpenses = {};
    currentTransactions.filter(t => t.amount < 0).forEach(t => {
      const category = t.category || 'Altri';
      categoryExpenses[category] = (categoryExpenses[category] || 0) + Math.abs(t.amount);
    });
    
    const topCategory = Object.entries(categoryExpenses)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      currentIncome,
      currentExpenses,
      currentNet,
      incomeChange,
      expenseChange,
      netChange,
      avgTransactionValue,
      transactionCount,
      transactionCountChange,
      totalBalance,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null
    };
  }, [transactions, timeRange]);

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

  const StatCard = ({ icon: Icon, title, value, change, color, prefix = '€' }) => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        {change !== undefined && (
          <div className={`flex items-center text-xs ${
            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {change > 0 ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : change < 0 ? (
              <TrendingDown className="w-3 h-3 mr-1" />
            ) : null}
            {change !== 0 ? `${change > 0 ? '+' : ''}${change.toFixed(1)}%` : '0%'}
          </div>
        )}
      </div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-lg font-semibold text-gray-800">
        {prefix}{typeof value === 'number' ? value.toFixed(2) : value}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Riepilogo Finanziario
        </h3>
        <span className="text-sm text-gray-500">{getTimeRangeLabel()}</span>
      </div>

      {/* Statistiche principali */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          title="Entrate"
          value={financialStats.currentIncome}
          change={financialStats.incomeChange}
          color="text-green-600"
        />
        <StatCard
          icon={TrendingDown}
          title="Uscite"
          value={financialStats.currentExpenses}
          change={financialStats.expenseChange}
          color="text-red-600"
        />
        <StatCard
          icon={DollarSign}
          title="Saldo Netto"
          value={financialStats.currentNet}
          change={financialStats.netChange}
          color={financialStats.currentNet >= 0 ? "text-green-600" : "text-red-600"}
        />
        <StatCard
          icon={PiggyBank}
          title="Saldo Totale"
          value={financialStats.totalBalance}
          color={financialStats.totalBalance >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      {/* Statistiche secondarie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={CreditCard}
          title="Transazioni"
          value={financialStats.transactionCount}
          change={financialStats.transactionCountChange}
          color="text-blue-600"
          prefix=""
        />
        <StatCard
          icon={Target}
          title="Media Transazione"
          value={financialStats.avgTransactionValue}
          color="text-purple-600"
        />
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-sm text-gray-600 mb-1">Top Categoria</div>
          <div className="text-lg font-semibold text-gray-800">
            {financialStats.topCategory ? (
              <div>
                <div>{financialStats.topCategory.name}</div>
                <div className="text-sm text-gray-600">
                  €{financialStats.topCategory.amount.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Nessuna spesa</div>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-600 mb-3">💡 Insights</h4>
        <div className="space-y-2 text-sm text-gray-600">
          {financialStats.currentNet > 0 ? (
            <p className="flex items-center text-green-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Ottimo! Hai un saldo positivo di €{financialStats.currentNet.toFixed(2)}
            </p>
          ) : (
            <p className="flex items-center text-red-600">
              <TrendingDown className="w-4 h-4 mr-2" />
              Attenzione: saldo negativo di €{Math.abs(financialStats.currentNet).toFixed(2)}
            </p>
          )}
          
          {financialStats.incomeChange > 10 && (
            <p className="text-green-600">
              📈 Le tue entrate sono aumentate del {financialStats.incomeChange.toFixed(1)}%
            </p>
          )}
          
          {financialStats.expenseChange > 20 && (
            <p className="text-orange-600">
              ⚠️ Le spese sono aumentate del {financialStats.expenseChange.toFixed(1)}%
            </p>
          )}
          
          {financialStats.transactionCount > 50 && (
            <p className="text-blue-600">
              🔄 Hai effettuato {financialStats.transactionCount} transazioni nel periodo
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryWidget;