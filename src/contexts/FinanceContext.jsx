import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Default categories
const DEFAULT_CATEGORIES = [
  'Shopping', 'Trasporti', 'Ristoranti', 'Servizi', 'Tecnologia', 
  'Casa', 'Salute', 'Intrattenimento', 'Altri'
];

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([
    { 
      id: 1, 
      name: 'Conto Corrente Principale', 
      type: 'bank', 
      balance: 2500.00, 
      active: true, 
      primary: true,
      details: 'IT60 X054 2811 1010 0000 0123 456'
    },
    { 
      id: 2, 
      name: 'Carta di Credito Visa', 
      type: 'credit', 
      balance: -450.00, 
      active: true, 
      primary: false,
      details: '**** **** **** 1234'
    },
    { 
      id: 3, 
      name: 'Contanti', 
      type: 'cash', 
      balance: 150.00, 
      active: true, 
      primary: false,
      details: 'Portafoglio'
    }
  ]);
  const [categories] = useState(DEFAULT_CATEGORIES);
  const [balance, setBalance] = useState(0);
  const [totalResources, setTotalResources] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Clear all localStorage data on initialization
  useEffect(() => {
    try {
      // Clear all existing data
      localStorage.removeItem('aurora2-transactions');
      localStorage.removeItem('aurora2-payment-methods');
      localStorage.removeItem('aurora-transactions');
      localStorage.removeItem('aurora-payment-methods');
      
      console.log('🗑️ Cleared all localStorage data - fresh start');
      
      // Initialize with empty transactions
      setTransactions([]);
      
    } catch (error) {
      console.error('Error clearing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate balances whenever transactions or payment methods change
  useEffect(() => {
    if (!isLoading) {
      calculateBalances();
      
      // Save to localStorage only if we have data
      try {
        localStorage.setItem('aurora2-transactions', JSON.stringify(transactions));
      } catch (error) {
        console.error('Error saving transactions:', error);
      }
    }
  }, [transactions, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      calculateBalances();
      
      // Save to localStorage
      try {
        localStorage.setItem('aurora2-payment-methods', JSON.stringify(paymentMethods));
      } catch (error) {
        console.error('Error saving payment methods:', error);
      }
    }
  }, [paymentMethods, isLoading]);

  const calculateBalances = useCallback(() => {
    // Calculate transaction balance (income - expenses)
    const transactionBalance = transactions.reduce((sum, transaction) => {
      return transaction.type === 'income' 
        ? sum + (transaction.amount || 0)
        : sum - Math.abs(transaction.amount || 0);
    }, 0);
    
    // Calculate initial balance from payment methods
    const initialMethodsBalance = paymentMethods.reduce((sum, method) => {
      return method.active ? sum + (method.balance || 0) : sum;
    }, 0);
    
    // Total resources = initial payment methods balance + transaction balance
    const calculatedTotalResources = initialMethodsBalance + transactionBalance;
    
    setBalance(transactionBalance);
    setTotalResources(calculatedTotalResources);
  }, [transactions, paymentMethods]);

  // Transaction methods
  const addTransaction = useCallback((transaction) => {
    const newTransaction = {
      id: transaction.id || `transaction_${Date.now()}_${Math.random()}`,
      ...transaction,
      date: transaction.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(transaction.amount) || 0,
      type: transaction.type || (transaction.amount >= 0 ? 'income' : 'expense'),
      category: transaction.category || 'Altri',
      description: transaction.description || '',
      paymentMethod: transaction.paymentMethod || '',
      imported: transaction.imported || false,
      importDate: transaction.importDate || null,
      source: transaction.source || null
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  const updateTransaction = useCallback((id, updatedTransaction) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id 
          ? { 
              ...transaction, 
              ...updatedTransaction,
              amount: parseFloat(updatedTransaction.amount) || 0,
              type: updatedTransaction.type || (updatedTransaction.amount >= 0 ? 'income' : 'expense')
            }
          : transaction
      )
    );
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => prev.filter(transaction => transaction.id !== id));
  }, []);

  // Payment methods management
  const addPaymentMethod = useCallback((methodData) => {
    const newMethod = {
      id: Date.now(),
      ...methodData,
      active: true,
      primary: paymentMethods.length === 0,
      balance: parseFloat(methodData.balance) || 0
    };
    setPaymentMethods(prev => [...prev, newMethod]);
  }, [paymentMethods.length]);

  const updatePaymentMethod = useCallback((id, methodData) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id 
          ? { ...method, ...methodData, balance: parseFloat(methodData.balance) || 0 }
          : method
      )
    );
  }, []);

  const deletePaymentMethod = useCallback((id) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  }, []);

  const toggleMethodStatus = useCallback((id) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === id ? { ...method, active: !method.active } : method
      )
    );
  }, []);

  const setPrimaryMethod = useCallback((id) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        primary: method.id === id
      }))
    );
  }, []);

  const getStats = useCallback(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    const activeMethodsCount = paymentMethods.filter(m => m.active).length;

    return { 
      income, 
      expenses, 
      balance, 
      totalResources,
      activeMethodsCount,
      totalMethods: paymentMethods.length
    };
  }, [transactions, paymentMethods, balance, totalResources]);

  const getTransactionsByCategory = useCallback(() => {
    const categoryTotals = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category || 'Altri';
      if (!categoryTotals[category]) {
        categoryTotals[category] = { income: 0, expense: 0, total: 0 };
      }
      
      if (transaction.type === 'income') {
        categoryTotals[category].income += transaction.amount || 0;
      } else {
        categoryTotals[category].expense += Math.abs(transaction.amount || 0);
      }
      
      categoryTotals[category].total = categoryTotals[category].income - categoryTotals[category].expense;
    });
    
    return categoryTotals;
  }, [transactions]);

  const getTransactionsByMonth = useCallback(() => {
    const monthlyTotals = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { income: 0, expense: 0, total: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyTotals[monthKey].income += transaction.amount || 0;
      } else {
        monthlyTotals[monthKey].expense += Math.abs(transaction.amount || 0);
      }
      
      monthlyTotals[monthKey].total = monthlyTotals[monthKey].income - monthlyTotals[monthKey].expense;
    });
    
    return monthlyTotals;
  }, [transactions]);

  const value = {
    // Data
    transactions,
    paymentMethods,
    categories,
    balance,
    totalResources,
    isLoading,
    
    // Transaction methods
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Payment method methods
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    toggleMethodStatus,
    setPrimaryMethod,
    
    // Analytics methods
    getStats,
    getTransactionsByCategory,
    getTransactionsByMonth
  };

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Inizializzazione Aurora 3.0...</p>
        </div>
      </div>
    );
  }

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};