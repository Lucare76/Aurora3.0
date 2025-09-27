import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useFinance } from '../../contexts/FinanceContext';

const MonthlyTrendChart = ({ months = 12 }) => {
  const { transactions } = useFinance();

  const monthlyData = useMemo(() => {
    const now = new Date();
    const monthsData = [];

    // Genera gli ultimi N mesi
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      monthsData.push({
        month: monthKey,
        monthName: date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }),
        income: 0,
        expenses: 0,
        net: 0,
        transactionCount: 0
      });
    }

    // Raggruppa transazioni per mese
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      
      const monthData = monthsData.find(m => m.month === monthKey);
      if (monthData) {
        if (transaction.amount > 0) {
          monthData.income += transaction.amount;
        } else {
          monthData.expenses += Math.abs(transaction.amount);
        }
        monthData.transactionCount++;
      }
    });

    // Calcola il netto per ogni mese
    monthsData.forEach(month => {
      month.net = month.income - month.expenses;
    });

    return monthsData;
  }, [transactions, months]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-green-600">
              <span className="font-medium">Entrate:</span> €{data.income.toFixed(2)}
            </p>
            <p className="text-red-600">
              <span className="font-medium">Uscite:</span> €{data.expenses.toFixed(2)}
            </p>
            <p className={`font-semibold ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="font-medium">Netto:</span> €{data.net.toFixed(2)}
            </p>
            <p className="text-gray-600 text-sm">
              {data.transactionCount} transazioni
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calcola statistiche
  const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
  const averageIncome = totalIncome / monthlyData.length;
  const averageExpenses = totalExpenses / monthlyData.length;
  const trend = monthlyData.length > 1 ? 
    monthlyData[monthlyData.length - 1].net - monthlyData[0].net : 0;

  if (monthlyData.every(month => month.transactionCount === 0)) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Trend Mensile
        </h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <p className="text-lg mb-2">📈</p>
            <p>Nessuna transazione trovata negli ultimi {months} mesi</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Trend Mensile ({months} mesi)
        </h3>
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600">Media Entrate</p>
            <p className="font-semibold text-green-600">€{averageIncome.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Media Uscite</p>
            <p className="font-semibold text-red-600">€{averageExpenses.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Trend</p>
            <p className={`font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}€{trend.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="monthName" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="income"
              stackId="1"
              stroke="#10b981"
              fill="url(#incomeGradient)"
              name="Entrate"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stackId="2"
              stroke="#ef4444"
              fill="url(#expenseGradient)"
              name="Uscite"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
              name="Saldo Netto"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Statistiche rapide */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Miglior Mese</p>
            <p className="font-semibold text-green-600">
              {monthlyData.reduce((best, month) => 
                month.net > best.net ? month : best, monthlyData[0]
              )?.monthName || '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Peggior Mese</p>
            <p className="font-semibold text-red-600">
              {monthlyData.reduce((worst, month) => 
                month.net < worst.net ? month : worst, monthlyData[0]
              )?.monthName || '-'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Totale Entrate</p>
            <p className="font-semibold text-green-600">€{totalIncome.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Totale Uscite</p>
            <p className="font-semibold text-red-600">€{totalExpenses.toFixed(0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTrendChart;