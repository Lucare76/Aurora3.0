import { useFinance } from '../../contexts/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ExpenseChart = () => {
  const { transactions } = useFinance();

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = transaction.category || 'Altro';
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {});

  const data = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  const COLORS = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', 
    '#00ff00', '#ff00ff', '#00ffff', '#ff0000'
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  if (data.length === 0) {
    return (
      <div className="aurora-card">
        <h3 className="text-lg font-semibold mb-4">Spese per Categoria</h3>
        <div className="text-center py-8 text-gray-500">
          Nessuna spesa registrata
        </div>
      </div>
    );
  }

  return (
    <div className="aurora-card">
      <h3 className="text-lg font-semibold mb-4">Spese per Categoria</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;