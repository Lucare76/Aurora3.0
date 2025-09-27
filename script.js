// Aurora Budget - JavaScript Application
class BudgetApp {
    constructor() {
        this.transactions = this.loadTransactions();
        this.charts = {};
        this.init();
    }

    init() {
        this.updateCurrentDate();
        this.setupEventListeners();
        this.updateStats();
        this.renderTransactions();
        this.initCharts();
        lucide.createIcons();
    }

    updateCurrentDate() {
        const now = new Date();
        document.getElementById('current-date').textContent = 
            now.toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('transaction-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Set today's date as default
        document.getElementById('date').value = new Date().toISOString().split('T')[0];

        // Modal close on outside click
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                this.closeModal();
            }
        });
    }

    loadTransactions() {
        const stored = localStorage.getItem('aurora-budget-transactions');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Sample data
        return [
            {
                id: '1',
                description: 'Stipendio Gennaio',
                amount: 2500,
                category: 'Stipendio',
                date: '2024-01-01'
            },
            {
                id: '2',
                description: 'Spesa supermercato',
                amount: -85.50,
                category: 'Alimentari',
                date: '2024-01-02'
            },
            {
                id: '3',
                description: 'Benzina',
                amount: -45.00,
                category: 'Trasporti',
                date: '2024-01-03'
            },
            {
                id: '4',
                description: 'Cena ristorante',
                amount: -35.00,
                category: 'Intrattenimento',
                date: '2024-01-04'
            },
            {
                id: '5',
                description: 'Bolletta elettrica',
                amount: -120.00,
                category: 'Casa',
                date: '2024-01-05'
            }
        ];
    }

    saveTransactions() {
        localStorage.setItem('aurora-budget-transactions', JSON.stringify(this.transactions));
    }

    addTransaction() {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        const transaction = {
            id: Date.now().toString(),
            description,
            amount,
            category,
            date
        };

        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.updateStats();
        this.renderTransactions();
        this.updateCharts();
        this.closeModal();
        this.showNotification('Transazione aggiunta con successo!', 'success');
        
        // Reset form
        document.getElementById('transaction-form').reset();
        document.getElementById('date').value = new Date().toISOString().split('T')[0];
    }

    deleteTransaction(id) {
        if (confirm('Sei sicuro di voler eliminare questa transazione?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveTransactions();
            this.updateStats();
            this.renderTransactions();
            this.updateCharts();
            this.showNotification('Transazione eliminata', 'success');
        }
    }

    updateStats() {
        const income = this.transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = Math.abs(this.transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0));
        
        const balance = income - expenses;
        
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthBalance = this.transactions
            .filter(t => t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);

        document.getElementById('total-balance').textContent = this.formatCurrency(balance);
        document.getElementById('total-income').textContent = this.formatCurrency(income);
        document.getElementById('total-expenses').textContent = this.formatCurrency(expenses);
        document.getElementById('month-balance').textContent = this.formatCurrency(monthBalance);

        // Update colors based on values
        const balanceEl = document.getElementById('total-balance');
        const monthEl = document.getElementById('month-balance');
        
        balanceEl.className = balance >= 0 ? 'text-2xl font-bold text-green-600' : 'text-2xl font-bold text-red-600';
        monthEl.className = monthBalance >= 0 ? 'text-2xl font-bold text-green-600' : 'text-2xl font-bold text-red-600';
    }

    renderTransactions() {
        const container = document.getElementById('transactions-list');
        
        if (this.transactions.length === 0) {
            container.innerHTML = `
                <div class="p-6 text-center text-gray-500">
                    <i data-lucide="credit-card" class="w-12 h-12 mx-auto mb-4 text-gray-300"></i>
                    <p>Nessuna transazione ancora</p>
                    <p class="text-sm">Aggiungi la tua prima transazione per iniziare</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        container.innerHTML = this.transactions.map(transaction => `
            <div class="transaction-item p-4 flex items-center justify-between hover:bg-gray-50">
                <div class="flex items-center">
                    <span class="category-icon text-2xl mr-3">${this.getCategoryIcon(transaction.category)}</span>
                    <div>
                        <p class="font-medium text-gray-900">${transaction.description}</p>
                        <div class="flex items-center text-sm text-gray-500">
                            <span>${transaction.category}</span>
                            <span class="mx-2">•</span>
                            <span>${new Date(transaction.date).toLocaleDateString('it-IT')}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="text-lg font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${transaction.amount >= 0 ? '+' : ''}${this.formatCurrency(transaction.amount)}
                    </span>
                    <button onclick="app.deleteTransaction('${transaction.id}')" class="text-red-600 hover:text-red-800">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        lucide.createIcons();
    }

    getCategoryIcon(category) {
        const icons = {
            'Alimentari': '🍕',
            'Trasporti': '🚗',
            'Casa': '🏠',
            'Shopping': '🛍️',
            'Salute': '⚕️',
            'Intrattenimento': '🎬',
            'Stipendio': '💼',
            'Altri': '📊'
        };
        return icons[category] || '📊';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(Math.abs(amount));
    }

    initCharts() {
        this.initCategoryChart();
        this.initTrendChart();
    }

    updateCharts() {
        this.initCategoryChart();
        this.initTrendChart();
    }

    initCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const categoryData = this.getCategoryData();
        
        if (this.charts.categoryChart) {
            this.charts.categoryChart.destroy();
        }

        if (categoryData.labels.length === 0) {
            ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
            return;
        }

        this.charts.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.data,
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
                        '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    initTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        const trendData = this.getTrendData();
        
        if (this.charts.trendChart) {
            this.charts.trendChart.destroy();
        }

        this.charts.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.labels,
                datasets: [{
                    label: 'Saldo Cumulativo',
                    data: trendData.data,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    getCategoryData() {
        const categories = {};
        this.transactions
            .filter(t => t.amount < 0)
            .forEach(t => {
                categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
            });

        return {
            labels: Object.keys(categories),
            data: Object.values(categories)
        };
    }

    getTrendData() {
        if (this.transactions.length === 0) {
            return { labels: [], data: [] };
        }

        const sortedTransactions = [...this.transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = [];
        const data = [];
        let runningBalance = 0;

        sortedTransactions.forEach(transaction => {
            runningBalance += transaction.amount;
            labels.push(new Date(transaction.date).toLocaleDateString('it-IT', { 
                month: 'short', 
                day: 'numeric' 
            }));
            data.push(runningBalance);
        });

        return { labels, data };
    }

    openModal() {
        document.getElementById('modal').classList.remove('hidden');
        document.getElementById('modal').classList.add('flex');
        document.getElementById('description').focus();
    }

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
        document.getElementById('modal').classList.remove('flex');
    }

    exportData() {
        const data = {
            transactions: this.transactions,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `aurora-budget-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Dati esportati con successo!', 'success');
    }

    clearAllData() {
        if (confirm('Sei sicuro di voler cancellare tutti i dati? Questa operazione non può essere annullata.')) {
            this.transactions = [];
            this.saveTransactions();
            this.updateStats();
            this.renderTransactions();
            this.updateCharts();
            this.showNotification('Tutti i dati sono stati cancellati', 'warning');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 animate-fade-in ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-orange-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
function openModal() {
    app.openModal();
}

function closeModal() {
    app.closeModal();
}

function exportData() {
    app.exportData();
}

function clearAllData() {
    app.clearAllData();
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BudgetApp();
});