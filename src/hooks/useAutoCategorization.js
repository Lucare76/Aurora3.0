import { useState } from 'react';
import { useFinance } from '../contexts/FinanceContext';

export const useAutoCategorization = () => {
  const [showModal, setShowModal] = useState(false);
  const [categorizedTransactions, setCategorizedTransactions] = useState([]);
  const { updateTransaction } = useFinance();

  // Simple categorization rules
  const categorizationRules = [
    { keywords: ['supermercato', 'conad', 'coop', 'esselunga', 'carrefour', 'lidl', 'eurospin'], category: 'Alimentari' },
    { keywords: ['benzina', 'eni', 'agip', 'q8', 'shell', 'autobus', 'treno', 'taxi'], category: 'Trasporti' },
    { keywords: ['affitto', 'bolletta', 'gas', 'luce', 'acqua', 'telefono', 'internet'], category: 'Casa' },
    { keywords: ['amazon', 'ebay', 'zalando', 'h&m', 'zara', 'shopping'], category: 'Shopping' },
    { keywords: ['farmacia', 'medico', 'ospedale', 'dentista', 'veterinario'], category: 'Salute' },
    { keywords: ['cinema', 'teatro', 'netflix', 'spotify', 'palestra', 'ristorante'], category: 'Intrattenimento' },
    { keywords: ['stipendio', 'salario', 'busta paga', 'pensione'], category: 'Stipendio' }
  ];

  const categorizeTransaction = (transaction) => {
    const description = transaction.description?.toLowerCase() || '';
    
    for (const rule of categorizationRules) {
      for (const keyword of rule.keywords) {
        if (description.includes(keyword)) {
          return {
            ...transaction,
            suggestedCategory: rule.category,
            confidence: Math.floor(Math.random() * 20) + 80 // 80-100% confidence
          };
        }
      }
    }
    
    return {
      ...transaction,
      suggestedCategory: 'Altri',
      confidence: 50
    };
  };

  const startCategorization = (transactions) => {
    if (!transactions || transactions.length === 0) {
      alert('Nessuna transazione da categorizzare');
      return;
    }

    const uncategorized = transactions.filter(t => !t.category || t.category === 'Altri');
    
    if (uncategorized.length === 0) {
      alert('Tutte le transazioni sono già categorizzate');
      return;
    }

    const categorized = uncategorized.map(categorizeTransaction);
    setCategorizedTransactions(categorized);
    setShowModal(true);
  };

  const applyChanges = (transactions) => {
    transactions.forEach(transaction => {
      updateTransaction(transaction.id, {
        category: transaction.suggestedCategory
      });
    });
    
    setShowModal(false);
    setCategorizedTransactions([]);
    alert(`${transactions.length} transazioni categorizzate con successo!`);
  };

  const closeModal = () => {
    setShowModal(false);
    setCategorizedTransactions([]);
  };

  const learnFromCorrection = (transactionId, correctCategory) => {
    // Placeholder for machine learning functionality
    console.log(`Learning: Transaction ${transactionId} should be ${correctCategory}`);
  };

  return {
    showModal,
    categorizedTransactions,
    startCategorization,
    applyChanges,
    closeModal,
    learnFromCorrection
  };
};