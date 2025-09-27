import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Calendar, Filter } from 'lucide-react';
import CategorySpendingChart from '../charts/CategorySpendingChart';
import MonthlyTrendChart from '../charts/MonthlyTrendChart';
import TopCategoriesWidget from '../widgets/TopCategoriesWidget';
import FinancialSummaryWidget from '../widgets/FinancialSummaryWidget';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [chartMonths, setChartMonths] = useState(12);

  const timeRangeOptions = [
    { value: 'week', label: 'Ultima settimana' },
    { value: 'month', label: 'Ultimo mese' },
    { value: '3months', label: 'Ultimi 3 mesi' },
    { value: '6months', label: 'Ultimi 6 mesi' },
    { value: 'year', label: 'Ultimo anno' },
    { value: 'all', label: 'Tutti i periodi' }
  ];

  const monthOptions = [
    { value: 6, label: '6 mesi' },
    { value: 12, label: '12 mesi' },
    { value: 18, label: '18 mesi' },
    { value: 24, label: '24 mesi' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Analisi dettagliata delle tue finanze personali
          </p>
        </div>
        
        {/* Filtri */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={chartMonths}
              onChange={(e) => setChartMonths(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  Trend {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Riepilogo Finanziario */}
      <FinancialSummaryWidget timeRange={timeRange} />

      {/* Grafici principali */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Trend Mensile */}
        <div className="xl:col-span-2">
          <MonthlyTrendChart months={chartMonths} />
        </div>
        
        {/* Spese per Categoria */}
        <CategorySpendingChart timeRange={timeRange} />
        
        {/* Top Categorie */}
        <TopCategoriesWidget timeRange={timeRange} limit={8} />
      </div>

      {/* Widget aggiuntivi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Categorie Settimanali */}
        <TopCategoriesWidget timeRange="week" limit={5} />
        
        {/* Top Categorie Annuali */}
        <TopCategoriesWidget timeRange="year" limit={5} />
      </div>

      {/* Insights e suggerimenti */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          💡 Suggerimenti Smart
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">📊 Analisi Spese</h4>
            <p className="text-blue-700">
              Usa i grafici per identificare le categorie con maggiori spese e ottimizzare il tuo budget.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">📈 Trend Monitoring</h4>
            <p className="text-blue-700">
              Monitora i trend mensili per capire i tuoi pattern di spesa e pianificare meglio.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">🎯 Budget Planning</h4>
            <p className="text-blue-700">
              Imposta budget per categoria basandoti sui dati storici per un controllo migliore.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <h4 className="font-medium text-blue-800 mb-2">🔄 Revisione Periodica</h4>
            <p className="text-blue-700">
              Rivedi regolarmente le analytics per adattare le tue abitudini finanziarie.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;