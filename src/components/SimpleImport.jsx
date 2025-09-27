import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { SimpleExcelParser } from '../utils/SimpleExcelParser';

const SimpleImport = ({ isOpen, onClose }) => {
  const { addTransaction } = useFinance();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.toLowerCase().includes('.xlsx') || selectedFile.name.toLowerCase().includes('.xls')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Seleziona un file Excel (.xlsx o .xls)');
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🚀 Starting import of:', file.name);
      const result = await SimpleExcelParser.parsePosteItalianeExcel(file);
      
      console.log('📊 Parse result:', result);
      
      if (result.success && result.transactions.length > 0) {
        // Add all transactions
        result.transactions.forEach(transaction => {
          addTransaction(transaction);
        });
        
        setResult({
          success: true,
          count: result.transactions.length,
          message: `Importate ${result.transactions.length} transazioni con successo!`
        });
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Nessuna transazione trovata nel file Excel');
      }
    } catch (err) {
      console.error('❌ Import error:', err);
      setError(`Errore durante l'importazione: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Import Poste Italiane
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!result && (
            <>
              {/* File Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleziona file Excel Poste Italiane
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Clicca per selezionare il file Excel
                    </span>
                  </label>
                </div>
                
                {file && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <FileSpreadsheet className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">{file.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleImport}
                  disabled={!file || isProcessing}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Importa
                    </>
                  )}
                </button>
                
                {file && (
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            </>
          )}

          {/* Success Result */}
          {result && result.success && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Import Completato!
              </h3>
              <p className="text-gray-600 mb-4">
                {result.message}
              </p>
              <p className="text-sm text-gray-500">
                Chiusura automatica in corso...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleImport;