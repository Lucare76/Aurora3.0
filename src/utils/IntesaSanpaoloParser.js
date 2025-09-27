import * as XLSX from 'xlsx';

class IntesaSanpaoloParser {
  static async parseExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          console.log('🏦 Parsing Intesa Sanpaolo Excel file...');
          
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (!workbook.SheetNames.length) {
            throw new Error('Il file Excel non contiene fogli di lavoro');
          }
          
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          console.log('📊 Raw data rows:', jsonData.length);
          console.log('📋 First 20 rows:', jsonData.slice(0, 20));
          
          if (jsonData.length < 2) {
            throw new Error('Il file non contiene dati sufficienti');
          }
          
          // 🔍 RICERCA ESTESA DELL'HEADER - FINO A RIGA 50
          let headerRowIndex = -1;
          let dataStartRow = -1;
          
          console.log('🔍 Cercando header Intesa nelle prime 50 righe...');
          
          for (let i = 0; i < Math.min(50, jsonData.length); i++) {
            const row = jsonData[i];
            
            if (!row || row.length < 3) continue;
            
            // Converti la riga in stringa per cercare pattern
            const rowStr = row.join('|').toLowerCase();
            console.log(`Riga ${i}:`, rowStr.substring(0, 100));
            
            // Cerca pattern tipici Intesa Sanpaolo
            const intesaPatterns = [
              'data contabile',
              'data valuta', 
              'data operazione',
              'addebiti',
              'accrediti',
              'importo',
              'causale',
              'descrizione'
            ];
            
            const matchedPatterns = intesaPatterns.filter(pattern => 
              rowStr.includes(pattern)
            );
            
            if (matchedPatterns.length >= 2) {
              headerRowIndex = i;
              console.log(`📍 Header Intesa trovato alla riga ${i}:`, row);
              console.log(`✅ Pattern trovati:`, matchedPatterns);
              break;
            }
            
            // Cerca anche righe con dati numerici (date Excel + importi)
            const hasExcelDate = row.some(cell => 
              typeof cell === 'number' && cell > 40000 && cell < 50000
            );
            const hasAmount = row.some(cell => 
              typeof cell === 'number' && Math.abs(cell) > 0.01
            );
            
            if (hasExcelDate && hasAmount && dataStartRow === -1) {
              dataStartRow = i;
              headerRowIndex = Math.max(0, i - 1);
              console.log(`📍 Dati numerici trovati alla riga ${i}, assumo header alla riga ${headerRowIndex}`);
            }
          }
          
          // Se non troviamo header, proviamo a cercare direttamente i dati
          if (headerRowIndex === -1 && dataStartRow === -1) {
            console.log('⚠️ Header non trovato, cerco direttamente transazioni...');
            
            for (let i = 5; i < Math.min(50, jsonData.length); i++) {
              const row = jsonData[i];
              if (!row || row.length < 4) continue;
              
              // Cerca righe con almeno una data e un importo
              let hasValidData = false;
              
              for (let j = 0; j < row.length; j++) {
                const cell = row[j];
                
                // Data Excel seriale
                if (typeof cell === 'number' && cell > 40000 && cell < 50000) {
                  // Cerca importi nelle colonne successive
                  for (let k = j + 1; k < row.length; k++) {
                    const nextCell = row[k];
                    if (typeof nextCell === 'number' && Math.abs(nextCell) > 0.01) {
                      dataStartRow = i;
                      headerRowIndex = i - 1;
                      hasValidData = true;
                      console.log(`📍 Transazione trovata alla riga ${i}: data=${cell}, importo=${nextCell}`);
                      break;
                    }
                  }
                }
                
                if (hasValidData) break;
              }
              
              if (hasValidData) break;
            }
          }
          
          if (headerRowIndex === -1) {
            headerRowIndex = 10; // Fallback
            console.log('⚠️ Uso riga 10 come fallback');
          }
          
          const transactions = [];
          let entrate = 0;
          let uscite = 0;
          
          console.log(`🚀 Inizio parsing dati dalla riga ${headerRowIndex + 1}...`);
          
          // Process each row starting from header + 1
          for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            if (!row || row.length < 3) {
              continue;
            }
            
            // Salta righe completamente vuote
            const hasData = row.some(cell => 
              cell !== null && cell !== undefined && cell !== '' && !isNaN(cell) && cell !== 0
            );
            
            if (!hasData) continue;
            
            try {
              console.log(`🔍 Processando riga ${i}:`, row);
              
              // STRATEGIA FLESSIBILE: cerca data e importi in qualsiasi posizione
              let dateValue = null;
              let description = '';
              let creditAmount = null;
              let debitAmount = null;
              
              // Cerca data (numero Excel seriale o stringa)
              for (let j = 0; j < Math.min(5, row.length); j++) {
                const cell = row[j];
                if (typeof cell === 'number' && cell > 40000 && cell < 50000) {
                  dateValue = cell;
                  break;
                } else if (typeof cell === 'string' && this.isValidDateString(cell)) {
                  dateValue = cell;
                  break;
                }
              }
              
              if (!dateValue) {
                console.log(`⚠️ Riga ${i}: nessuna data valida trovata`);
                continue;
              }
              
              // Cerca descrizione (prima stringa non vuota)
              for (let j = 1; j < row.length; j++) {
                const cell = row[j];
                if (typeof cell === 'string' && cell.trim().length > 3) {
                  description = cell.trim();
                  break;
                }
              }
              
              // Cerca importi (numeri positivi/negativi)
              const amounts = [];
              for (let j = 0; j < row.length; j++) {
                const cell = row[j];
                if (typeof cell === 'number' && Math.abs(cell) > 0.01 && cell !== dateValue) {
                  amounts.push({ value: cell, column: j });
                }
              }
              
              if (amounts.length === 0) {
                console.log(`⚠️ Riga ${i}: nessun importo trovato`);
                continue;
              }
              
              // Parse date
              let date;
              if (typeof dateValue === 'number') {
                const excelDate = XLSX.SSF.parse_date_code(dateValue);
                date = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
              } else {
                date = this.parseStringDate(dateValue);
              }
              
              if (!date || isNaN(date.getTime())) {
                console.log(`⚠️ Riga ${i}: data non valida:`, dateValue);
                continue;
              }
              
              // Determina se è entrata o uscita
              // Se c'è un solo importo, usa il segno
              // Se ci sono due importi, uno dovrebbe essere l'entrata e uno l'uscita
              let amount = 0;
              let transactionType = '';
              
              if (amounts.length === 1) {
                amount = amounts[0].value;
                transactionType = amount > 0 ? 'income' : 'expense';
              } else {
                // Due colonne: probabilmente accrediti e addebiti
                // Prendi il valore non zero
                const nonZeroAmounts = amounts.filter(a => a.value !== 0);
                if (nonZeroAmounts.length > 0) {
                  amount = nonZeroAmounts[0].value;
                  transactionType = amount > 0 ? 'income' : 'expense';
                }
              }
              
              if (amount === 0) {
                console.log(`⚠️ Riga ${i}: importo zero`);
                continue;
              }
              
              // Assicurati che il segno sia corretto
              if (transactionType === 'expense' && amount > 0) {
                amount = -amount;
              } else if (transactionType === 'income' && amount < 0) {
                amount = Math.abs(amount);
              }
              
              if (amount > 0) {
                entrate++;
              } else {
                uscite++;
              }
              
              const transaction = {
                id: `intesa_${Date.now()}_${i}`,
                date: date.toISOString().split('T')[0],
                description: description || 'Movimento Intesa Sanpaolo',
                amount: amount,
                type: transactionType,
                category: 'Altri',
                paymentMethod: 'Intesa Sanpaolo',
                source: 'Intesa Sanpaolo',
                imported: true,
                importDate: new Date().toISOString(),
                originalCategory: amount > 0 ? 'Entrata' : 'Uscita',
                bankSource: 'intesa'
              };
              
              transactions.push(transaction);
              console.log(`✅ Riga ${i}: ${transaction.date} - ${transaction.description.substring(0, 30)} - €${transaction.amount} (${transaction.type})`);
              
            } catch (error) {
              console.warn(`⚠️ Error processing row ${i}:`, error.message, row);
              continue;
            }
          }
          
          console.log(`🎉 Intesa Sanpaolo parsing completed:`);
          console.log(`💚 ENTRATE (positive): ${entrate}`);
          console.log(`🔴 USCITE (negative): ${uscite}`);
          console.log(`📊 Total transactions: ${transactions.length}`);
          
          if (transactions.length === 0) {
            // Mostra più dettagli per il debug
            console.error('❌ NESSUNA TRANSAZIONE TROVATA - DEBUG INFO:');
            console.log('📊 Righe totali:', jsonData.length);
            console.log('📍 Header row index:', headerRowIndex);
            console.log('📋 Prime 30 righe del file:');
            for (let i = 0; i < Math.min(30, jsonData.length); i++) {
              console.log(`Riga ${i}:`, jsonData[i]);
            }
            throw new Error('Nessuna transazione valida trovata nel file Intesa Sanpaolo. Verifica che il file contenga dati di transazioni con date e importi.');
          }
          
          resolve(transactions);
          
        } catch (error) {
          console.error('❌ Error parsing Intesa Sanpaolo Excel:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Errore nella lettura del file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
  
  static isValidDateString(value) {
    if (!value || typeof value !== 'string') return false;
    
    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
      /^\d{4}-\d{1,2}-\d{1,2}$/,
      /^\d{1,2}\/\d{1,2}\/\d{2}$/
    ];
    
    return datePatterns.some(pattern => pattern.test(value.trim()));
  }
  
  static parseStringDate(value) {
    if (!value) return null;
    
    const str = String(value).trim();
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
    
    return date;
  }
}

export default IntesaSanpaoloParser;