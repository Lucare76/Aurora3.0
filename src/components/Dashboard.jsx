import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Heart, Upload, Brain } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import useSaint from '../hooks/useSaint';
import CategorySpendingChart from './charts/CategorySpendingChart';
import MonthlyTrendChart from './charts/MonthlyTrendChart';
import TopCategoriesWidget from './widgets/TopCategoriesWidget';
import FinancialSummaryWidget from './widgets/FinancialSummaryWidget';
import ImportUnifiedButton from './ImportUnifiedButton';
import AutoCategorizationModal from './AutoCategorizationModal';
import { useAutoCategorization } from '../hooks/useAutoCategorization';

const Dashboard = () => {
  const { transactions } = useFinance();
  const { saint, loading: saintLoading, getTodayDate } = useSaint();

  const {
    showModal: showAutoCategorizationModal,
    categorizedTransactions,
    startCategorization,
    applyChanges,
    closeModal,
    learnFromCorrection
  } = useAutoCategorization();

  // Safe calculations with fallbacks
  const totalBalance = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalIncome = transactions.filter(t => (t.amount || 0) > 0).reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpenses = Math.abs(transactions.filter(t => (t.amount || 0) < 0).reduce((sum, t) => sum + (t.amount || 0), 0));

  // Get current month transactions
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthTransactions = transactions.filter(t => t.date && t.date.startsWith(currentMonth));
  const monthlyBalance = currentMonthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  // Recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 5);

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '€0.00';
    }
    return `€${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data non disponibile';
    try {
      return new Date(dateString).toLocaleDateString('it-IT');
    } catch (error) {
      return 'Data non valida';
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

  return (
    <div className="space-y-6">
      {/* Header con tasti Importa e Auto Categorizza */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Panoramica del tuo budget personale</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <div className="text-sm text-gray-500">
            {getTodayDate()}
          </div>
          
          {/* Tasto Importa Verde */}
          <ImportUnifiedButton onImportComplete={startCategorization} />
          
          {/* Tasto Auto Categorizza Viola */}
          <button
            onClick={() => startCategorization(transactions)}
            disabled={transactions.length === 0}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:bg-gray-300"
          >
            <Brain className="w-4 h-4 mr-2" />
            Auto Categorizza
          </button>
        </div>
      </div>

      {/* Santo del Giorno */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Heart className="w-5 h-5 text-red-500 mr-3" />
          <div>
            <h3 className="font-medium text-gray-900">
              {saintLoading ? 'Caricamento...' : (saint ? saint.name : 'Santo del Giorno')}
            </h3>
            <p className="text-sm text-gray-600">
              {saintLoading ? 'Caricamento santo del giorno...' : (saint ? saint.description : 'Informazioni non disponibili')}
            </p>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Totale</p>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${totalBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`w-6 h-6 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entrate</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uscite</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Questo Mese</p>
              <p className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlyBalance)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${monthlyBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Calendar className={`w-6 h-6 ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spending Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spese per Categoria</h3>
          <CategorySpendingChart transactions={transactions} />
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Mensile</h3>
          <MonthlyTrendChart transactions={transactions} />
        </div>
      </div>

      {/* Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Summary Widget */}
        <FinancialSummaryWidget transactions={transactions} />

        {/* Top Categories Widget */}
        <TopCategoriesWidget transactions={transactions} />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transazioni Recenti</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentTransactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Nessuna transazione disponibile</p>
              <p className="text-sm mt-1">Aggiungi la tua prima transazione per iniziare</p>
            </div>
          ) : (
            recentTransactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getCategoryIcon(transaction.category)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description || 'Descrizione non disponibile'}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{transaction.category || 'Senza categoria'}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-lg font-semibold ${
                    (transaction.amount || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(transaction.amount || 0) >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Auto Categorization Modal */}
      <AutoCategorizationModal
        isOpen={showAutoCategorizationModal}
        transactions={categorizedTransactions}
        onApply={applyChanges}
        onClose={closeModal}
      />
    </div>
  );
};

export default Dashboard;