import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFinance } from '../../contexts/FinanceContext';

const CategorySpendingChart = ({ timeRange = 'all' }) => {
  const { transactions } = useFinance();

  const categoryData = useMemo(() => {
    // Filtra solo le uscite (importi negativi)
    const expenses = transactions.filter(t => t.amount < 0);
    
    // Filtra per periodo se specificato
    let filteredExpenses = expenses;
    if (timeRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filteredExpenses = expenses.filter(t => new Date(t.date) >= startDate);
    }

    // Raggruppa per categoria e calcola totali
    const categoryTotals = {};
    filteredExpenses.forEach(transaction => {
      const category = transaction.category || 'Altri';
      const amount = Math.abs(transaction.amount); // Converti in positivo per il grafico
      
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += amount;
    });

    // Converti in array per il grafico
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: 0 // Calcolato dopo
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categorie
  }, [transactions, timeRange]);

  // Calcola percentuali
  const totalAmount = categoryData.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentages = categoryData.map(item => ({
    ...item,
    percentage: totalAmount > 0 ? ((item.value / totalAmount) * 100).toFixed(1) : 0
  }));

  // Colori per le categorie
  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', 
    '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb',
    '#dda0dd', '#98fb98', '#f0e68c', '#ffa07a'
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-blue-600">
            €{data.value.toFixed(2)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    if (percentage < 5) return null; // Non mostrare label per fette troppo piccole
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  if (dataWithPercentages.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Spese per Categoria
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">📊</p>
            <p>Nessuna spesa trovata per il periodo selezionato</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Spese per Categoria
        </h3>
        <div className="text-sm text-gray-600">
          Totale: €{totalAmount.toFixed(2)}
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithPercentages}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {dataWithPercentages.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>
                  {value} (€{entry.payload.value.toFixed(0)})
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top 3 categorie */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Top 3 Categorie</h4>
        <div className="space-y-2">
          {dataWithPercentages.slice(0, 3).map((item, index) => (
            <div key={item.name} className="flex justify-between items-center">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <div className="text-sm font-medium text-gray-800">
                €{item.value.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySpendingChart;