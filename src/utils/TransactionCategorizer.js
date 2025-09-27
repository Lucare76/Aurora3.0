/**
 * AI-powered transaction categorization system
 * Automatically assigns categories based on transaction description, amount, and patterns
 */

export class TransactionCategorizer {
  constructor() {
    // Category definitions with keywords and patterns
    this.categories = {
      'Alimentari': {
        keywords: [
          'esselunga', 'coop', 'carrefour', 'lidl', 'eurospin', 'conad', 'pam', 'simply',
          'supermercato', 'alimentari', 'market', 'discount', 'ipermercato',
          'mcdonald', 'burger', 'pizza', 'ristorante', 'trattoria', 'osteria',
          'bar', 'caffè', 'pasticceria', 'gelateria', 'panetteria', 'pizzeria',
          'deliveroo', 'glovo', 'just eat', 'uber eats', 'foodora'
        ],
        patterns: [
          /supermercato/i,
          /alimentari/i,
          /market/i,
          /food/i,
          /restaurant/i
        ],
        amountRange: { min: 5, max: 200 }
      },
      'Trasporti': {
        keywords: [
          'eni', 'agip', 'shell', 'q8', 'ip', 'tamoil', 'benzina', 'gasolio',
          'atm', 'trenitalia', 'italo', 'autobus', 'metro', 'tram',
          'uber', 'taxi', 'car sharing', 'bike sharing', 'scooter',
          'autostrada', 'telepass', 'viacard', 'parcheggio', 'garage',
          'alitalia', 'ryanair', 'easyjet', 'vueling', 'aeroporto'
        ],
        patterns: [
          /carburante/i,
          /benzina/i,
          /gasolio/i,
          /trasport/i,
          /viaggio/i,
          /aereo/i,
          /treno/i
        ],
        amountRange: { min: 1, max: 500 }
      },
      'Casa': {
        keywords: [
          'enel', 'eni gas', 'a2a', 'hera', 'acea', 'iren', 'multiutility',
          'bolletta', 'utenze', 'gas', 'luce', 'acqua', 'rifiuti',
          'affitto', 'condominio', 'amministratore', 'spese condominiali',
          'mutuo', 'rata', 'banca', 'finanziamento', 'prestito',
          'assicurazione casa', 'polizza casa', 'ikea', 'leroy merlin',
          'brico', 'obi', 'castorama', 'bricocenter'
        ],
        patterns: [
          /bolletta/i,
          /utenze/i,
          /affitto/i,
          /mutuo/i,
          /condominio/i,
          /casa/i,
          /immobile/i
        ],
        amountRange: { min: 20, max: 2000 }
      },
      'Stipendio': {
        keywords: [
          'stipendio', 'salario', 'retribuzione', 'cedolino', 'busta paga',
          'accredito', 'bonifico stipendio', 'datore lavoro', 'azienda',
          'pensione', 'inps', 'tfr', 'quattordicesima', 'tredicesima'
        ],
        patterns: [
          /stipendio/i,
          /salario/i,
          /retribuzione/i,
          /accredito/i,
          /bonifico.*stipendio/i,
          /pensione/i
        ],
        amountRange: { min: 500, max: 10000 },
        isIncome: true
      },
      'Shopping': {
        keywords: [
          'amazon', 'ebay', 'zalando', 'h&m', 'zara', 'uniqlo', 'nike',
          'adidas', 'mediaworld', 'unieuro', 'trony', 'euronics',
          'negozio', 'boutique', 'outlet', 'shopping', 'centro commerciale',
          'abbigliamento', 'scarpe', 'elettronica', 'tecnologia',
          'apple store', 'samsung', 'xiaomi', 'huawei'
        ],
        patterns: [
          /shopping/i,
          /negozio/i,
          /abbigliamento/i,
          /elettronica/i,
          /amazon/i,
          /e-commerce/i
        ],
        amountRange: { min: 10, max: 1000 }
      },
      'Salute': {
        keywords: [
          'farmacia', 'parafarmacia', 'dottore', 'medico', 'dentista',
          'oculista', 'ginecologo', 'cardiologo', 'ortopedico',
          'ospedale', 'clinica', 'laboratorio', 'analisi', 'radiografia',
          'risonanza', 'ecografia', 'visita', 'controllo', 'terapia',
          'fisioterapia', 'palestra', 'fitness', 'piscina'
        ],
        patterns: [
          /farmacia/i,
          /medico/i,
          /dottore/i,
          /salute/i,
          /ospedale/i,
          /clinica/i,
          /visita/i
        ],
        amountRange: { min: 5, max: 500 }
      },
      'Intrattenimento': {
        keywords: [
          'cinema', 'teatro', 'concerto', 'netflix', 'spotify', 'disney',
          'amazon prime', 'youtube premium', 'apple music', 'dazn',
          'sky', 'mediaset', 'tim vision', 'now tv',
          'discoteca', 'pub', 'aperitivo', 'cena', 'festa',
          'videogiochi', 'steam', 'playstation', 'xbox', 'nintendo'
        ],
        patterns: [
          /cinema/i,
          /teatro/i,
          /streaming/i,
          /intrattenimento/i,
          /svago/i,
          /divertimento/i
        ],
        amountRange: { min: 5, max: 200 }
      }
    };

    // Learning system - stores user corrections
    this.userPatterns = this.loadUserPatterns();
  }

  /**
   * Main categorization method
   * @param {Object} transaction - Transaction object with description, amount, type
   * @returns {string} - Predicted category
   */
  categorize(transaction) {
    const { description = '', amount = 0, type = 'expense' } = transaction;
    
    // Clean and normalize description
    const cleanDescription = this.cleanDescription(description);
    
    // Check user-learned patterns first (highest priority)
    const userCategory = this.checkUserPatterns(cleanDescription);
    if (userCategory) {
      return userCategory;
    }

    // For income transactions, check if it's salary
    if (type === 'income' || amount > 0) {
      const incomeCategory = this.categorizeIncome(cleanDescription, amount);
      if (incomeCategory) return incomeCategory;
    }

    // Score each category
    const scores = {};
    Object.keys(this.categories).forEach(category => {
      scores[category] = this.calculateCategoryScore(cleanDescription, amount, category);
    });

    // Find best match
    const bestCategory = Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    );

    // Return best category if score is above threshold, otherwise 'Altro'
    return scores[bestCategory] > 0.3 ? bestCategory : 'Altro';
  }

  /**
   * Calculate confidence score for a category
   */
  calculateCategoryScore(description, amount, categoryName) {
    const category = this.categories[categoryName];
    let score = 0;

    // Keyword matching (weighted by importance)
    const keywordScore = this.calculateKeywordScore(description, category.keywords);
    score += keywordScore * 0.6;

    // Pattern matching
    const patternScore = this.calculatePatternScore(description, category.patterns || []);
    score += patternScore * 0.3;

    // Amount range matching
    const amountScore = this.calculateAmountScore(amount, category.amountRange);
    score += amountScore * 0.1;

    return score;
  }

  /**
   * Calculate keyword matching score
   */
  calculateKeywordScore(description, keywords) {
    const words = description.toLowerCase().split(/\s+/);
    let matches = 0;
    
    keywords.forEach(keyword => {
      if (description.toLowerCase().includes(keyword.toLowerCase())) {
        matches += 1;
      }
    });

    return Math.min(matches / Math.max(keywords.length * 0.1, 1), 1);
  }

  /**
   * Calculate pattern matching score
   */
  calculatePatternScore(description, patterns) {
    let matches = 0;
    patterns.forEach(pattern => {
      if (pattern.test(description)) {
        matches += 1;
      }
    });
    return Math.min(matches / Math.max(patterns.length, 1), 1);
  }

  /**
   * Calculate amount range score
   */
  calculateAmountScore(amount, range) {
    if (!range) return 0;
    const absAmount = Math.abs(amount);
    if (absAmount >= range.min && absAmount <= range.max) {
      return 1;
    }
    // Partial score for nearby amounts
    const distance = Math.min(
      Math.abs(absAmount - range.min),
      Math.abs(absAmount - range.max)
    );
    return Math.max(0, 1 - (distance / range.max));
  }

  /**
   * Categorize income transactions
   */
  categorizeIncome(description, amount) {
    const salaryKeywords = ['stipendio', 'salario', 'retribuzione', 'accredito', 'bonifico'];
    
    if (salaryKeywords.some(keyword => 
      description.toLowerCase().includes(keyword))) {
      return 'Stipendio';
    }

    // Large regular amounts are likely salary
    if (Math.abs(amount) > 800) {
      return 'Stipendio';
    }

    return null;
  }

  /**
   * Clean and normalize transaction description
   */
  cleanDescription(description) {
    return description
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Check user-learned patterns
   */
  checkUserPatterns(description) {
    for (const [pattern, category] of Object.entries(this.userPatterns)) {
      if (description.includes(pattern.toLowerCase())) {
        return category;
      }
    }
    return null;
  }

  /**
   * Learn from user correction
   */
  learnFromCorrection(description, correctCategory) {
    const cleanDesc = this.cleanDescription(description);
    
    // Extract key words from description
    const words = cleanDesc.split(' ').filter(word => word.length > 3);
    
    // Store the most distinctive word
    if (words.length > 0) {
      const keyWord = words[0]; // Use first significant word
      this.userPatterns[keyWord] = correctCategory;
      this.saveUserPatterns();
    }
  }

  /**
   * Load user patterns from localStorage
   */
  loadUserPatterns() {
    try {
      const stored = localStorage.getItem('transactionCategorizer_userPatterns');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Error loading user patterns:', error);
      return {};
    }
  }

  /**
   * Save user patterns to localStorage
   */
  saveUserPatterns() {
    try {
      localStorage.setItem('transactionCategorizer_userPatterns', 
        JSON.stringify(this.userPatterns));
    } catch (error) {
      console.warn('Error saving user patterns:', error);
    }
  }

  /**
   * Get categorization confidence
   */
  getCategorizeConfidence(transaction) {
    const category = this.categorize(transaction);
    const scores = {};
    
    Object.keys(this.categories).forEach(cat => {
      scores[cat] = this.calculateCategoryScore(
        this.cleanDescription(transaction.description || ''),
        transaction.amount || 0,
        cat
      );
    });

    return {
      category,
      confidence: scores[category] || 0,
      alternatives: Object.entries(scores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([cat, score]) => ({ category: cat, confidence: score }))
    };
  }

  /**
   * Batch categorize multiple transactions
   */
  batchCategorize(transactions) {
    return transactions.map(transaction => ({
      ...transaction,
      category: this.categorize(transaction),
      ...this.getCategorizeConfidence(transaction)
    }));
  }

  /**
   * Get available categories
   */
  getAvailableCategories() {
    return [...Object.keys(this.categories), 'Altro'];
  }
}

// Export singleton instance
export const transactionCategorizer = new TransactionCategorizer();