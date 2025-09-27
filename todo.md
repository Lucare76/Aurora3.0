# TODO - Dashboard Analytics Enhancement

## STEP 2: Category Spending Charts (15 min)
- [ ] CategorySpendingChart.jsx - Pie chart spese per categoria
- [ ] MonthlyTrendChart.jsx - Line chart trend mensili
- [ ] TopCategoriesWidget.jsx - Top 5 categorie spesa
- [ ] FinancialSummaryWidget.jsx - Statistiche riepilogative
- [ ] Update Dashboard.jsx - Integra nuovi widget
- [ ] Update AnalyticsPage.jsx - Pagina analytics completa

## STEP 3: Bulk Transaction Editing (12 min)
- [ ] BulkEditModal.jsx - Modal per operazioni multiple
- [ ] TransactionSelector.jsx - Checkbox per selezione
- [ ] Update MovementsPage.jsx - Integra selezione multipla
- [ ] BulkOperations.js - Logica operazioni batch

## STEP 4: Export & Reports (10 min)
- [ ] ExportButton.jsx - Tasto export con opzioni
- [ ] PDFExporter.js - Generazione PDF
- [ ] ExcelExporter.js - Generazione Excel
- [ ] ReportGenerator.js - Report mensili automatici

## Files to modify:
- src/components/Dashboard.jsx
- src/components/pages/AnalyticsPage.jsx
- src/components/pages/MovementsPage.jsx
- src/contexts/FinanceContext.jsx (se necessario)

## New files to create:
- src/components/charts/CategorySpendingChart.jsx
- src/components/charts/MonthlyTrendChart.jsx
- src/components/widgets/TopCategoriesWidget.jsx
- src/components/widgets/FinancialSummaryWidget.jsx
- src/components/BulkEditModal.jsx
- src/components/TransactionSelector.jsx
- src/components/ExportButton.jsx
- src/utils/BulkOperations.js
- src/utils/PDFExporter.js
- src/utils/ExcelExporter.js
- src/utils/ReportGenerator.js