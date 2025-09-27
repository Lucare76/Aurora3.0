import * as XLSX from 'xlsx';

class PosteItalianeParser {
  static async parseExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          console.log('📁 POSTE ITALIANE - Inizio parsing Excel file...');
          
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (!workbook.SheetNames.length) {
            throw new Error('Il file Excel non contiene fogli di lavoro');
          }
          
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          console.log('📊 Righe totali:', jsonData.length);
          console.log('🔍 Prime 10 righe:', jsonData.slice(0, 10));
          
          if (jsonData.length < 2) {
            throw new Error('Il file non contiene dati sufficienti');
          }
          
          // Trova la riga con le intestazioni (cerca "Data Contabile", "Addebiti", "Accrediti")
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(15, jsonData.length); i++) {
            const row = jsonData[i];
            if (row && row.length >= 4) {
              const rowStr = row.join('|').toLowerCase();
              if (rowStr.includes('data contabile') && 
                  (rowStr.includes('addebiti') || rowStr.includes('accrediti'))) {
                headerRowIndex = i;
                console.log('📍 Header Poste trovato alla riga:', i);
                console.log('📋 Intestazioni:', row);
                break;
              }
            }
          }
          
          if (headerRowIndex === -1) {
            console.log('⚠️ Header standard non trovato, cerco pattern alternativi...');
            // Cerca pattern alternativi
            for (let i = 0; i < Math.min(15, jsonData.length); i++) {
              const row = jsonData[i];
              if (row && row.length >= 4) {
                // Cerca righe che contengono date e importi
                const hasDate = row.some(cell => this.isValidDate(cell));
                const hasAmount = row.some(cell => this.isValidAmount(cell));
                if (hasDate && hasAmount) {
                  headerRowIndex = i - 1; // Assume header sia riga precedente
                  console.log('📍 Dati trovati alla riga:', i, '- assumo header alla riga:', headerRowIndex);
                  break;
                }
              }
            }
          }
          
          if (headerRowIndex === -1) {
            headerRowIndex = 10; // Default fallback
            console.log('⚠️ Uso riga 10 come default');
          }
          
          const transactions = [];
          let entrate = 0;
          let uscite = 0;
          
          // Processa le transazioni dalla riga successiva all'header
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            // Salta righe vuote
            if (!row || row.length < 3) continue;
            
            try {
              // STRUTTURA POSTE ITALIANE IDENTIFICATA:
              // Colonna 0: Data Contabile
              // Colonna 1: Data Valuta  
              // Colonna 2: Addebiti (USCITE - devono essere NEGATIVE)
              // Colonna 3: Accrediti (ENTRATE - devono essere POSITIVE)
              // Colonna 4: Descrizione
              
              const dataContabile = row[0];
              const addebiti = row[2];      // USCITE
              const accrediti = row[3];     // ENTRATE
              const descrizione = row[4] || row[1] || 'Movimento Bancoposta';
              
              // Verifica che ci sia almeno una data
              if (!dataContabile) continue;
              
              // Verifica che ci sia almeno un importo
              if (!addebiti && !accrediti) continue;
              
              // Parse della data
              let date = this.parseDate(dataContabile);
              if (!date) {
                console.warn(`⚠️ Data non valida alla riga ${i}:`, dataContabile);
                continue;
              }
              
              // LOGICA SEGNI CORRETTA PER POSTE ITALIANE
              let amount = 0;
              let type = '';
              let transactionType = '';
              
              // ADDEBITI = USCITE = NEGATIVI
              if (addebiti && this.isValidAmount(addebiti)) {
                const debitAmount = this.parseAmount(addebiti);
                if (debitAmount > 0) {
                  amount = -Math.abs(debitAmount); // NEGATIVO per uscite
                  type = '🔴 ADDEBITO (USCITA)';
                  transactionType = 'expense';
                  uscite++;
                }
              }
              
              // ACCREDITI = ENTRATE = POSITIVI
              if (accrediti && this.isValidAmount(accrediti)) {
                const creditAmount = this.parseAmount(accrediti);
                if (creditAmount > 0) {
                  amount = Math.abs(creditAmount); // POSITIVO per entrate
                  type = '💚 ACCREDITO (ENTRATA)';
                  transactionType = 'income';
                  entrate++;
                }
              }
              
              if (amount === 0) {
                console.warn(`⚠️ Importo non valido alla riga ${i}:`, { addebiti, accrediti });
                continue;
              }
              
              // Pulisci descrizione
              const cleanDescription = String(descrizione).trim();
              
              // 🤖 AI-COMPATIBLE TRANSACTION FORMAT
              const transaction = {
                id: `poste_${Date.now()}_${i}`,
                date: date,
                amount: amount,
                type: transactionType, // 🔥 ADDED: Required by AI categorizer
                category: 'Altri', // 🔥 CHANGED: Default category for AI to override
                description: cleanDescription,
                paymentMethod: 'Conto BancoPosta',
                source: 'Poste Italiane',
                imported: true,
                importDate: new Date().toISOString(),
                // 🤖 Additional fields for AI categorization
                originalCategory: amount > 0 ? 'Entrata' : 'Uscita', // Keep original for reference
                bankSource: 'poste',
                originalRow: i
              };
              
              transactions.push(transaction);
              console.log(`✅ Riga ${i} ${type}: ${date} - ${cleanDescription.substring(0, 30)} - €${amount} (${transactionType})`);
              
            } catch (error) {
              console.warn(`⚠️ Errore parsing riga ${i}:`, error.message);
              continue;
            }
          }
          
          console.log(`🎉 POSTE ITALIANE - Parsing completato:`);
          console.log(`💚 ENTRATE (positive): ${entrate}`);
          console.log(`🔴 USCITE (negative): ${uscite}`);
          console.log(`📊 Totale transazioni: ${transactions.length}`);
          
          // Verifica finale segni e tipi
          const entrateFinali = transactions.filter(t => t.amount > 0 && t.type === 'income').length;
          const usciteFinali = transactions.filter(t => t.amount < 0 && t.type === 'expense').length;
          console.log(`🔍 VERIFICA SEGNI FINALI: ${entrateFinali} entrate positive, ${usciteFinali} uscite negative`);
          console.log(`🤖 AI-READY: All transactions have 'type' field for categorization`);
          
          if (transactions.length === 0) {
            throw new Error('Nessuna transazione valida trovata nel file Poste Italiane');
          }
          
          resolve(transactions);
          
        } catch (error) {
          console.error('❌ Errore parsing Poste Italiane:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Errore nella lettura del file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
  
  static isValidDate(value) {
    if (!value) return false;
    
    // Numero Excel seriale
    if (!isNaN(value) && value > 40000 && value < 50000) {
      return true;
    }
    
    // Formati data comuni
    const str = String(value);
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
      /^\d{4}-\d{1,2}-\d{1,2}$/,
      /^\d{1,2}\/\d{1,2}\/\d{2}$/
    ];
    
    return datePatterns.some(pattern => pattern.test(str));
  }
  
  static parseDate(value) {
    if (!value) return null;
    
    // Excel date serial number
    if (!isNaN(value) && value > 40000) {
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    // Parse string date
    const str = String(value);
    let date = null;
    
    // Formato gg/mm/aaaa o gg-mm-aaaa
    const match1 = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (match1) {
      const [, day, month, year] = match1;
      date = new Date(year, month - 1, day);
    }
    
    // Formato aaaa-mm-gg
    const match2 = str.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
    if (match2) {
      const [, year, month, day] = match2;
      date = new Date(year, month - 1, day);
    }
    
    if (date && !isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return null;
  }
  
  static isValidAmount(value) {
    if (!value) return false;
    
    if (typeof value === 'number') {
      return !isNaN(value) && isFinite(value) && value !== 0;
    }
    
    const str = String(value).trim();
    if (str === '' || str === '0' || str === '0,00') return false;
    
    // Pattern per importi
    const amountPattern = /^[+\-]?\d{1,3}(?:[.,]\d{3})*[.,]?\d{0,2}$/;
    return amountPattern.test(str) || !isNaN(parseFloat(str.replace(',', '.')));
  }
  
  static parseAmount(value) {
    if (!value) return 0;
    
    if (typeof value === 'number') {
      return Math.abs(value);
    }
    
    let str = String(value).trim();
    str = str.replace(/[^\d+\-.,]/g, '');
    
    // Gestione virgole e punti
    if (str.includes(',') && str.includes('.')) {
      str = str.replace(/,/g, '');
    } else if (str.includes(',')) {
      const commaIndex = str.lastIndexOf(',');
      if (str.length - commaIndex <= 3) {
        str = str.replace(',', '.');
      } else {
        str = str.replace(/,/g, '');
      }
    }
    
    const amount = parseFloat(str);
    return isNaN(amount) ? 0 : Math.abs(amount);
  }
}

export default PosteItalianeParser;