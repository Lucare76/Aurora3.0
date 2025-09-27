/**
 * AI Budget Helper - Sistema di Intelligenza Artificiale Gratuito
 * Analizza pattern di spesa e fornisce consigli personalizzati
 */

export class AIBudgetHelper {
  constructor() {
    this.insights = [];
    this.patterns = {};
    this.recommendations = [];
  }

  /**
   * Analizza tutte le transazioni e genera insights intelligenti
   */
  analyzeTransactions(transactions, paymentMethods = []) {
    if (!transactions || transactions.length === 0) {
      return this.getWelcomeMessage();
    }

    this.insights = [];
    this.patterns = this.detectPatterns(transactions);
    this.recommendations = this.generateRecommendations(transactions, paymentMethods);

    return {
      insights: this.insights,
      patterns: this.patterns,
      recommendations: this.recommendations,
      summary: this.generateSummary(transactions)
    };
  }

  /**
   * Rileva pattern nelle spese
   */
  detectPatterns(transactions) {
    const patterns = {
      categorySpending: {},
      weeklyTrends: {},
      monthlyAverages: {},
      unusualSpending: [],
      topCategories: []
    };

    // Analisi per categoria
    transactions.forEach(transaction => {
      const category = transaction.category || 'Altro';
      if (!patterns.categorySpending[category]) {
        patterns.categorySpending[category] = {
          total: 0,
          count: 0,
          average: 0,
          trend: 'stable'
        };
      }

      if (transaction.type === 'expense') {
        patterns.categorySpending[category].total += transaction.amount;
        patterns.categorySpending[category].count += 1;
      }
    });

    // Calcola medie e identifica trend
    Object.keys(patterns.categorySpending).forEach(category => {
      const data = patterns.categorySpending[category];
      data.average = data.total / Math.max(data.count, 1);
      
      // Identifica spese inusuali (>150% della media)
      const recentTransactions = transactions
        .filter(t => t.category === category && t.type === 'expense')
        .slice(-5);
      
      recentTransactions.forEach(transaction => {
        if (transaction.amount > data.average * 1.5) {
          patterns.unusualSpending.push({
            transaction,
            reason: `Spesa ${Math.round((transaction.amount / data.average - 1) * 100)}% sopra la media per ${category}`
          });
        }
      });
    });

    // Top categorie per spesa
    patterns.topCategories = Object.entries(patterns.categorySpending)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 5)
      .map(([category, data]) => ({ category, ...data }));

    return patterns;
  }

  /**
   * Genera raccomandazioni intelligenti
   */
  generateRecommendations(transactions, paymentMethods) {
    const recommendations = [];
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Raccomandazioni basate sul tasso di risparmio
    if (savingsRate < 10) {
      recommendations.push({
        type: 'warning',
        title: '⚠️ Basso Tasso di Risparmio',
        message: `Il tuo tasso di risparmio è del ${savingsRate.toFixed(1)}%. Consiglio di puntare al 20% del reddito.`,
        action: 'Riduci le spese nelle categorie principali'
      });
    } else if (savingsRate > 30) {
      recommendations.push({
        type: 'success',
        title: '🎉 Ottimo Risparmio!',
        message: `Eccellente! Stai risparmiando il ${savingsRate.toFixed(1)}% del tuo reddito.`,
        action: 'Considera investimenti per far crescere i tuoi risparmi'
      });
    }

    // Analisi categorie di spesa
    const expensesByCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Altro';
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + t.amount;
    });

    const topExpenseCategory = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)[0];

    if (topExpenseCategory && topExpenseCategory[1] > totalExpenses * 0.4) {
      recommendations.push({
        type: 'info',
        title: '📊 Categoria Dominante',
        message: `${topExpenseCategory[0]} rappresenta il ${((topExpenseCategory[1] / totalExpenses) * 100).toFixed(1)}% delle tue spese.`,
        action: 'Monitora attentamente questa categoria per ottimizzare il budget'
      });
    }

    // Raccomandazioni sui metodi di pagamento
    if (paymentMethods.length > 0) {
      const totalBalance = paymentMethods.reduce((sum, method) => sum + method.balance, 0);
      if (totalBalance < totalExpenses * 0.1) {
        recommendations.push({
          type: 'warning',
          title: '💳 Liquidità Bassa',
          message: 'I tuoi saldi sono bassi rispetto alle spese mensili.',
          action: 'Considera di aumentare la liquidità disponibile'
        });
      }
    }

    return recommendations;
  }

  /**
   * Genera un riassunto intelligente
   */
  generateSummary(transactions) {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const dailyAverage = monthlyExpenses / new Date().getDate();

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlyBalance: monthlyIncome - monthlyExpenses,
      dailyAverage,
      transactionCount: monthlyTransactions.length,
      projectedMonthlyExpenses: dailyAverage * 30
    };
  }

  /**
   * Genera consigli personalizzati in tempo reale
   */
  getPersonalizedAdvice(transactions, currentBalance) {
    const advice = [];

    if (transactions.length === 0) {
      return [{
        type: 'welcome',
        message: '👋 Benvenuto! Inizia ad aggiungere le tue transazioni per ricevere consigli personalizzati.',
        icon: '🚀'
      }];
    }

    // Analisi trend recenti (ultimi 7 giorni)
    const recentTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return tDate >= weekAgo;
    });

    const recentExpenses = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    if (recentExpenses > currentBalance * 0.3) {
      advice.push({
        type: 'warning',
        message: `⚠️ Hai speso €${recentExpenses.toFixed(2)} negli ultimi 7 giorni. Rallenta il ritmo per mantenere l'equilibrio.`,
        icon: '🛑'
      });
    }

    // Consigli positivi
    if (currentBalance > 0) {
      advice.push({
        type: 'success',
        message: `✅ Il tuo bilancio è positivo di €${currentBalance.toFixed(2)}. Ottimo lavoro!`,
        icon: '💚'
      });
    }

    // Suggerimenti di categoria
    const categoryTotals = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Altro';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    });

    const topCategory = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)[0];

    if (topCategory) {
      advice.push({
        type: 'info',
        message: `📊 La tua categoria di spesa principale è "${topCategory[0]}" con €${topCategory[1].toFixed(2)}. Considera se ci sono ottimizzazioni possibili.`,
        icon: '💡'
      });
    }

    return advice;
  }

  /**
   * Messaggio di benvenuto per nuovi utenti
   */
  getWelcomeMessage() {
    return {
      insights: [],
      patterns: {},
      recommendations: [{
        type: 'welcome',
        title: '🚀 Benvenuto in Aurora AI!',
        message: 'Inizia ad aggiungere transazioni per ricevere analisi intelligenti e consigli personalizzati.',
        action: 'Aggiungi la tua prima transazione usando i pulsanti + e - in basso a destra'
      }],
      summary: {
        monthlyIncome: 0,
        monthlyExpenses: 0,
        monthlyBalance: 0,
        dailyAverage: 0,
        transactionCount: 0,
        projectedMonthlyExpenses: 0
      }
    };
  }

  /**
   * Genera previsioni future basate sui pattern
   */
  generatePredictions(transactions) {
    if (transactions.length < 5) {
      return {
        nextMonthExpenses: 0,
        savingsGoal: 0,
        budgetSuggestions: {}
      };
    }

    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const avgDailyExpense = monthlyExpenses / 30;
    const nextMonthExpenses = avgDailyExpense * 30;

    // Suggerimenti budget per categoria
    const categoryExpenses = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Altro';
      categoryExpenses[cat] = (categoryExpenses[cat] || 0) + t.amount;
    });

    const budgetSuggestions = {};
    Object.entries(categoryExpenses).forEach(([category, total]) => {
      budgetSuggestions[category] = Math.round(total * 1.1); // +10% buffer
    });

    return {
      nextMonthExpenses: Math.round(nextMonthExpenses),
      savingsGoal: Math.round(nextMonthExpenses * 0.2), // 20% risparmio
      budgetSuggestions
    };
  }
}

// Istanza singleton
export const aiBudgetHelper = new AIBudgetHelper();