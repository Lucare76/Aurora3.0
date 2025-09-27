export const parsePosteItalianeCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const transactions = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split(';');

    if (columns.length >= 4) {
      const date = columns[0]?.trim();
      const description = columns[1]?.trim();
      const amount = parseFloat(columns[2]?.replace(',', '.').replace(/[^\d.-]/g, ''));

      if (date && description && !isNaN(amount)) {
        transactions.push({
          id: `poste_${Date.now()}_${i}`,
          date: formatDate(date),
          description,
          amount,
          category: 'Altri',
          bank: 'Poste Italiane'
        });
      }
    }
  }

  return transactions;
};

export const parseIntesaSanpaoloCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const transactions = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split(';');

    if (columns.length >= 4) {
      const date = columns[0]?.trim();
      const description = columns[2]?.trim();
      const amount = parseFloat(columns[3]?.replace(',', '.').replace(/[^\d.-]/g, ''));

      if (date && description && !isNaN(amount)) {
        transactions.push({
          id: `intesa_${Date.now()}_${i}`,
          date: formatDate(date),
          description,
          amount,
          category: 'Altri',
          bank: 'Intesa Sanpaolo'
        });
      }
    }
  }

  return transactions;
};

const formatDate = (dateString) => {
  try {
    // Handle different date formats
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        // DD/MM/YYYY format
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    } else if (dateString.includes('-')) {
      // Already in YYYY-MM-DD format
      return dateString;
    }
    
    return new Date().toISOString().split('T')[0];
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
};