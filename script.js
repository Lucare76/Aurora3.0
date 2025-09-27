// Aurora Financial Suite - Advanced Dashboard
class BudgetApp {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.currentPage = 'dashboard';
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateTime();
        this.loadDashboardPage();
        this.hideLoadingScreen();
        
        // Update time every second
        setInterval(() => this.updateDateTime(), 1000);
    }

    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 1500);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.switchPage(page);
            });
        });

        // Sidebar toggle for mobile
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const sidebar = document.getElementById('sidebar');
                sidebar.classList.toggle('-translate-x-full');
            });
        }
    }

    switchPage(page) {
        this.currentPage = page;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active', 'text-blue-600', 'bg-blue-50');
            item.classList.add('text-gray-700');
        });
        
        const activeItem = document.querySelector(`[data-page="${page}"]`);
        if (activeItem) {
            activeItem.classList.add('active', 'text-blue-600', 'bg-blue-50');
            activeItem.classList.remove('text-gray-700');
        }

        // Update page title and content
        this.updatePageTitle(page);
        this.loadPageContent(page);
    }

    updatePageTitle(page) {
        const titles = {
            dashboard: { title: 'Dashboard', subtitle: 'Panoramica completa delle tue finanze' },
            analytics: { title: 'Analytics Avanzate', subtitle: 'Analisi dettagliate e trend finanziari' },
            portfolio: { title: 'Portfolio', subtitle: 'Gestione investimenti e asset allocation' },
            transactions: { title: 'Transazioni', subtitle: 'Storico completo delle operazioni' },
            budget: { title: 'Budget & Obiettivi', subtitle: 'Pianificazione e controllo spese' },
            investments: { title: 'Investimenti', subtitle: 'Portfolio e performance investimenti' },
            reports: { title: 'Report', subtitle: 'Report personalizzati e esportazione dati' },
            settings: { title: 'Impostazioni', subtitle: 'Configurazione account e preferenze' }
        };

        const pageTitle = document.getElementById('page-title');
        const pageSubtitle = document.getElementById('page-subtitle');
        
        if (pageTitle && titles[page]) {
            pageTitle.textContent = titles[page].title;
        }
        if (pageSubtitle && titles[page]) {
            pageSubtitle.textContent = titles[page].subtitle;
        }
    }

    loadPageContent(page) {
        const content = document.getElementById('page-content');
        if (!content) return;

        switch (page) {
            case 'dashboard':
                this.loadDashboardPage();
                break;
            case 'analytics':
                this.loadAnalyticsPage();
                break;
            case 'portfolio':
                this.loadPortfolioPage();
                break;
            case 'transactions':
                this.loadTransactionsPage();
                break;
            case 'budget':
                this.loadBudgetPage();
                break;
            case 'investments':
                this.loadInvestmentsPage();
                break;
            case 'reports':
                this.loadReportsPage();
                break;
            case 'settings':
                this.loadSettingsPage();
                break;
        }
    }

    loadDashboardPage() {
        const content = document.getElementById('page-content');
        if (!content) return;

        content.innerHTML = `
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Saldo Totale</p>
                            <p id="total-balance" class="text-2xl font-bold text-gray-900">€0.00</p>
                            <p class="text-xs text-green-600 mt-1">↗ +2.5% dal mese scorso</p>
                        </div>
                        <div class="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                            <i data-lucide="wallet" class="w-6 h-6 text-white"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Entrate</p>
                            <p id="total-income" class="text-2xl font-bold text-green-600">€0.00</p>
                            <p class="text-xs text-green-600 mt-1">↗ +5.2% dal mese scorso</p>
                        </div>
                        <div class="p-3 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                            <i data-lucide="trending-up" class="w-6 h-6 text-white"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Uscite</p>
                            <p id="total-expenses" class="text-2xl font-bold text-red-600">€0.00</p>
                            <p class="text-xs text-red-600 mt-1">↗ +1.8% dal mese scorso</p>
                        </div>
                        <div class="p-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                            <i data-lucide="trending-down" class="w-6 h-6 text-white"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Investimenti</p>
                            <p id="total-investments" class="text-2xl font-bold text-purple-600">€0.00</p>
                            <p class="text-xs text-green-600 mt-1">↗ +8.7% dal mese scorso</p>
                        </div>
                        <div class="p-3 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                            <i data-lucide="bar-chart-3" class="w-6 h-6 text-white"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Spese per Categoria</h3>
                        <div class="flex items-center space-x-2">
                            <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <i data-lucide="more-horizontal" class="w-4 h-4 text-gray-500"></i>
                            </button>
                        </div>
                    </div>
                    <div class="h-64 relative">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>

                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Trend Finanziario</h3>
                        <div class="flex items-center space-x-2">
                            <select class="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Ultimi 30 giorni</option>
                                <option>Ultimi 3 mesi</option>
                                <option>Ultimo anno</option>
                            </select>
                        </div>
                    </div>
                    <div class="h-64 relative">
                        <canvas id="trendChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Portfolio Overview -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div class="lg:col-span-2 bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-gray-900">Transazioni Recenti</h3>
                        <button onclick="dashboard.switchPage('transactions')" class="text-blue-600 hover:text-blue-700 text-sm font-medium">Vedi tutte</button>
                    </div>
                    <div id="transactions-list" class="space-y-3">
                        <!-- Transactions will be loaded here -->
                    </div>
                </div>

                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Obiettivi di Risparmio</h3>
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-sm font-medium text-gray-700">Vacanze Estive</span>
                                <span class="text-sm text-gray-500">€1,200 / €2,000</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style="width: 60%"></div>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">60% completato</p>
                        </div>
                        
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-sm font-medium text-gray-700">Fondo Emergenza</span>
                                <span class="text-sm text-gray-500">€3,500 / €5,000</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style="width: 70%"></div>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">70% completato</p>
                        </div>

                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-sm font-medium text-gray-700">Nuovo Laptop</span>
                                <span class="text-sm text-gray-500">€800 / €1,500</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style="width: 53%"></div>
                            </div>
                            <p class="text-xs text-gray-500 mt-1">53% completato</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Re-initialize icons and charts after content load
        setTimeout(() => {
            if (window.lucide) {
                lucide.createIcons();
            }
            this.updateStats();
            this.renderTransactions();
            this.initCharts();
        }, 100);
    }

    loadTransactionsPage() {
        const content = document.getElementById('page-content');
        if (!content) return;

        content.innerHTML = `
            <div class="space-y-8">
                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-semibold text-gray-900">Tutte le Transazioni</h3>
                        <button onclick="dashboard.openModal('transaction')" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center transition-all duration-200 shadow-lg hover:shadow-xl">
                            <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                            Nuova Transazione
                        </button>
                    </div>
                    <div id="all-transactions-list" class="space-y-3">
                        <!-- All transactions will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            if (window.lucide) {
                lucide.createIcons();
            }
            this.renderAllTransactions();
        }, 100);
    }

    loadAnalyticsPage() {
        const content = document.getElementById('page-content');
        if (!content) return;

        content.innerHTML = `
            <div class="space-y-8">
                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Analytics Avanzate</h3>
                    <p class="text-gray-600">Sezione in sviluppo - Analytics dettagliate delle tue finanze</p>
                </div>
            </div>
        `;
    }

    loadPortfolioPage() {
        const content = document.getElementById('page-content');
        if (!content) return;

        content.innerHTML = `
            <div class="space-y-8">
                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Portfolio</h3>
                    <p class="text-gray-600">Sezione in sviluppo - Gestione del tuo portfolio investimenti</p>
                </div>
            </div>
        `;
    }

    loadBudgetPage() {
        const content = document.getElementById('page-content');
        if (!content) return;

        content.innerHTML = `
            <div class="space-y-8">
                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Budget & Obiettivi</h3>
                    <p class="text-gray-600">Sezione in sviluppo - Pianificazione budget e obiettivi di risparmio</p>
                </div>
            </div>
        `;
    }

    loadInvestmentsPage() {
        const content = document.getElementById('page-content');
        if (!content) return;

        content.innerHTML = `
            <div class="space-y-8">
                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Investimenti</h3>
                    <p class="text-gray-600">Sezione in sviluppo - Gestione investimenti e performance</p>
                </div>
            </div>
        `;
    }

    loadReportsPage() {
        const content = document.getElementById('page-content');
        if (!content) return;

        content.innerHTML = `
            <div class="space-y-8">
                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Report</h3>
                    <p class="text-gray-600">Sezione in sviluppo - Report personalizzati e esportazione dati</p>
                </div>
            </div>
        `;
    }

    loadSettingsPage() {
        const content = document.getElementById('page-content');
        if (!content) return;

        content.innerHTML = `
            <div class="space-y-8">
                <div class="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/20">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Impostazioni</h3>
                    <p class="text-gray-600">Sezione in sviluppo - Configurazione account e preferenze</p>
                </div>
            </div>
        `;
    }

    updateStats() {
        const totalIncome = this.transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = Math.abs(this.transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0));
        
        const totalBalance = totalIncome - totalExpenses;
        const totalInvestments = totalIncome * 0.15; // Mock calculation

        // Update elements if they exist
        const balanceEl = document.getElementById('total-balance');
        const incomeEl = document.getElementById('total-income');
        const expensesEl = document.getElementById('total-expenses');
        const investmentsEl = document.getElementById('total-investments');
        const transactionCountEl = document.getElementById('transaction-count');

        if (balanceEl) balanceEl.textContent = `€${totalBalance.toFixed(2)}`;
        if (incomeEl) incomeEl.textContent = `€${totalIncome.toFixed(2)}`;
        if (expensesEl) expensesEl.textContent = `€${totalExpenses.toFixed(2)}`;
        if (investmentsEl) investmentsEl.textContent = `€${totalInvestments.toFixed(2)}`;
        if (transactionCountEl) transactionCountEl.textContent = this.transactions.length.toString();
    }

    renderTransactions() {
        const container = document.getElementById('transactions-list');
        if (!container) return;

        const recentTransactions = this.transactions.slice(-5).reverse();
        
        if (recentTransactions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="receipt" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">Nessuna transazione ancora</p>
                    <button onclick="dashboard.openModal('transaction')" class="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Aggiungi la prima transazione
                    </button>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        container.innerHTML = recentTransactions.map(transaction => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br ${this.getCategoryColor(transaction.category)} flex items-center justify-center">
                        <span class="text-lg">${this.getCategoryEmoji(transaction.category)}</span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${transaction.description}</p>
                        <p class="text-sm text-gray-500">${transaction.category} • ${new Date(transaction.date).toLocaleDateString('it-IT')}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}">
                        ${transaction.amount > 0 ? '+' : ''}€${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                </div>
            </div>
        `).join('');
    }

    renderAllTransactions() {
        const container = document.getElementById('all-transactions-list');
        if (!container) return;

        if (this.transactions.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="receipt" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                    <p class="text-gray-500">Nessuna transazione ancora</p>
                    <button onclick="dashboard.openModal('transaction')" class="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Aggiungi la prima transazione
                    </button>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            return;
        }

        const sortedTransactions = [...this.transactions].reverse();
        
        container.innerHTML = sortedTransactions.map(transaction => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br ${this.getCategoryColor(transaction.category)} flex items-center justify-center">
                        <span class="text-lg">${this.getCategoryEmoji(transaction.category)}</span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${transaction.description}</p>
                        <p class="text-sm text-gray-500">${transaction.category} • ${new Date(transaction.date).toLocaleDateString('it-IT')}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}">
                        ${transaction.amount > 0 ? '+' : ''}€${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <button onclick="dashboard.deleteTransaction('${transaction.id}')" class="text-red-500 hover:text-red-700 text-xs mt-1">
                        Elimina
                    </button>
                </div>
            </div>
        `).join('');
    }

    getCategoryEmoji(category) {
        const emojis = {
            'Alimentari': '🍕',
            'Trasporti': '🚗',
            'Casa': '🏠',
            'Shopping': '🛍️',
            'Salute': '⚕️',
            'Intrattenimento': '🎬',
            'Stipendio': '💼',
            'Investimenti': '📈',
            'Altri': '📊'
        };
        return emojis[category] || '📊';
    }

    getCategoryColor(category) {
        const colors = {
            'Alimentari': 'from-orange-400 to-orange-500',
            'Trasporti': 'from-blue-400 to-blue-500',
            'Casa': 'from-green-400 to-green-500',
            'Shopping': 'from-pink-400 to-pink-500',
            'Salute': 'from-red-400 to-red-500',
            'Intrattenimento': 'from-purple-400 to-purple-500',
            'Stipendio': 'from-emerald-400 to-emerald-500',
            'Investimenti': 'from-indigo-400 to-indigo-500',
            'Altri': 'from-gray-400 to-gray-500'
        };
        return colors[category] || 'from-gray-400 to-gray-500';
    }

    initCharts() {
        this.initCategoryChart();
        this.initTrendChart();
    }

    initCategoryChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.categoryChart) {
            this.charts.categoryChart.destroy();
        }

        const expenses = this.transactions.filter(t => t.amount < 0);
        const categoryData = {};
        
        expenses.forEach(transaction => {
            const category = transaction.category;
            if (!categoryData[category]) {
                categoryData[category] = 0;
            }
            categoryData[category] += Math.abs(transaction.amount);
        });

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        
        if (labels.length === 0) {
            // Show placeholder when no data
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6b7280';
            ctx.font = '16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Nessun dato disponibile', canvas.width / 2, canvas.height / 2);
            return;
        }

        this.charts.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
                        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                    ],
                    borderWidth: 0,
                    hoverBorderWidth: 2,
                    hoverBorderColor: '#ffffff'
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
                            usePointStyle: true,
                            font: {
                                size: 12,
                                family: 'Inter'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': €' + context.parsed.toFixed(2);
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }

    initTrendChart() {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.trendChart) {
            this.charts.trendChart.destroy();
        }

        // Generate last 30 days data
        const days = [];
        const incomeData = [];
        const expenseData = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }));
            
            const dayTransactions = this.transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.toDateString() === date.toDateString();
            });
            
            const dayIncome = dayTransactions
                .filter(t => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0);
            
            const dayExpenses = Math.abs(dayTransactions
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + t.amount, 0));
            
            incomeData.push(dayIncome);
            expenseData.push(dayExpenses);
        }

        this.charts.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [
                    {
                        label: 'Entrate',
                        data: incomeData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Uscite',
                        data: expenseData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            font: {
                                size: 12,
                                family: 'Inter'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': €' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '€' + value.toFixed(0);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    updateDateTime() {
        const now = new Date();
        const dateEl = document.getElementById('current-date');
        const timeEl = document.getElementById('current-time');
        
        if (dateEl) {
            dateEl.textContent = now.toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        if (timeEl) {
            timeEl.textContent = now.toLocaleTimeString('it-IT');
        }
    }

    openModal(type = 'transaction') {
        const modalsContainer = document.getElementById('modals-container');
        if (!modalsContainer) return;

        const modal = document.createElement('div');
        modal.id = 'transaction-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm';
        
        modal.innerHTML = `
            <div class="bg-white/95 backdrop-blur-xl rounded-2xl max-w-md w-full mx-4 shadow-2xl border border-white/20">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Nuova Transazione</h3>
                        <button onclick="dashboard.closeModal()" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <form id="transaction-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                            <input type="text" id="description" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Importo (€)</label>
                            <input type="number" id="amount" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                            <select id="category" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50">
                                <option value="Alimentari">🍕 Alimentari</option>
                                <option value="Trasporti">🚗 Trasporti</option>
                                <option value="Casa">🏠 Casa</option>
                                <option value="Shopping">🛍️ Shopping</option>
                                <option value="Salute">⚕️ Salute</option>
                                <option value="Intrattenimento">🎬 Intrattenimento</option>
                                <option value="Stipendio">💼 Stipendio</option>
                                <option value="Investimenti">📈 Investimenti</option>
                                <option value="Altri">📊 Altri</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <input type="date" id="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50" required>
                        </div>
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" onclick="dashboard.closeModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                Annulla
                            </button>
                            <button type="submit" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
                                Salva
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        modalsContainer.appendChild(modal);
        
        // Set today's date as default
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Add form submit handler
        const form = document.getElementById('transaction-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleTransactionSubmit(e));
        }

        // Initialize icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    closeModal() {
        const modal = document.getElementById('transaction-modal');
        if (modal) {
            modal.remove();
        }
    }

    handleTransactionSubmit(e) {
        e.preventDefault();
        
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        // Determine if it's income or expense based on category
        let finalAmount = amount;
        if (!['Stipendio', 'Investimenti'].includes(category)) {
            finalAmount = -Math.abs(amount); // Make it negative for expenses
        }

        const transaction = {
            id: Date.now().toString(),
            description,
            amount: finalAmount,
            category,
            date: new Date(date).toISOString()
        };

        this.transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(this.transactions));

        this.updateStats();
        this.renderTransactions();
        this.renderAllTransactions();
        this.initCharts();
        this.closeModal();

        this.showNotification('Transazione aggiunta con successo!', 'success');
    }

    deleteTransaction(id) {
        if (confirm('Sei sicuro di voler eliminare questa transazione?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
            
            this.updateStats();
            this.renderTransactions();
            this.renderAllTransactions();
            this.initCharts();
            
            this.showNotification('Transazione eliminata', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification bg-white border-l-4 ${
            type === 'success' ? 'border-green-500' : 
            type === 'error' ? 'border-red-500' : 'border-blue-500'
        } p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i data-lucide="${
                    type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'x-circle' : 'info'
                }" class="w-5 h-5 ${
                    type === 'success' ? 'text-green-500' : 
                    type === 'error' ? 'text-red-500' : 'text-blue-500'
                } mr-3"></i>
                <span class="text-gray-900">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-auto text-gray-400 hover:text-gray-600">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        `;

        container.appendChild(notification);
        
        if (window.lucide) {
            lucide.createIcons();
        }

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new BudgetApp();
});
