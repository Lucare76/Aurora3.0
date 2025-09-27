# 🌟 Aurora Budget - Dashboard Personale

Una dashboard moderna e intuitiva per la gestione del budget personale, completamente sviluppata in HTML, CSS e JavaScript vanilla.

![Aurora Budget](https://img.shields.io/badge/Aurora-Budget-blue?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Caratteristiche

### 📊 Dashboard Completa
- **Statistiche in tempo reale**: Saldo totale, entrate, uscite e bilancio mensile
- **Grafici interattivi**: Visualizzazione spese per categoria e trend temporale
- **Design responsive**: Ottimizzato per desktop, tablet e mobile

### 💳 Gestione Transazioni
- ➕ **Aggiungi transazioni** con descrizione, importo, categoria e data
- 🗑️ **Elimina transazioni** con conferma di sicurezza
- 🏷️ **8 categorie predefinite** con emoji per facile identificazione
- 📱 **Interface mobile-friendly** con modal ottimizzati

### 📈 Visualizzazioni
- 🥧 **Grafico a ciambella** per la distribuzione delle spese per categoria
- 📉 **Grafico lineare** per il trend del saldo cumulativo nel tempo
- 🎨 **Colori intuitivi**: Verde per entrate, rosso per uscite

### 💾 Gestione Dati
- 🔄 **Persistenza automatica** con localStorage del browser
- 📤 **Esportazione dati** in formato JSON
- 🧹 **Cancellazione completa** con conferma di sicurezza
- 📊 **Dati di esempio** precaricati per demo

## 🚀 Installazione e Uso

### Metodo 1: Download Diretto
1. Scarica tutti i file del progetto
2. Apri `index.html` nel tuo browser
3. Inizia subito a usare la dashboard!

### Metodo 2: Clona da GitHub
```bash
git clone https://github.com/tuousername/aurora-budget.git
cd aurora-budget
```

### Metodo 3: Server Locale
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx serve .

# Poi apri http://localhost:8000
```

## 🎯 Come Usare

### Aggiungere una Transazione
1. Clicca su **"Aggiungi Transazione"**
2. Compila il form con:
   - Descrizione (es. "Spesa supermercato")
   - Importo (positivo per entrate, negativo per uscite)
   - Categoria (scegli tra 8 opzioni disponibili)
   - Data della transazione
3. Clicca **"Salva"**

### Categorie Disponibili
- 🍕 **Alimentari** - Spese per cibo e bevande
- 🚗 **Trasporti** - Benzina, mezzi pubblici, taxi
- 🏠 **Casa** - Affitto, bollette, manutenzione
- 🛍️ **Shopping** - Vestiti, accessori, acquisti vari
- ⚕️ **Salute** - Medico, farmacia, palestra
- 🎬 **Intrattenimento** - Cinema, ristoranti, svago
- 💼 **Stipendio** - Entrate da lavoro
- 📊 **Altri** - Tutto il resto

### Visualizzare i Dati
- **Dashboard**: Panoramica completa con statistiche e grafici
- **Transazioni**: Lista dettagliata di tutte le operazioni
- **Grafici**: Analisi visuale delle spese e trend

## 🛠️ Tecnologie Utilizzate

- **HTML5**: Struttura semantica e accessibile
- **CSS3**: Styling moderno con Tailwind CSS
- **JavaScript ES6+**: Logica applicativa vanilla
- **Chart.js**: Grafici interattivi e responsive
- **Lucide Icons**: Iconografia moderna e pulita
- **LocalStorage**: Persistenza dati lato client

## 📱 Responsive Design

L'applicazione è completamente responsive e ottimizzata per:
- 🖥️ **Desktop** (1200px+)
- 📱 **Tablet** (768px - 1199px)
- 📱 **Mobile** (< 768px)

## 🎨 Caratteristiche UI/UX

- **Design moderno** con gradients e ombre soft
- **Animazioni fluide** per transizioni e hover
- **Feedback visivo** con notifiche toast
- **Accessibilità** con focus states e contrasti appropriati
- **Tema coerente** con palette colori professionale

## 📊 Funzionalità Avanzate

### Calcoli Automatici
- Saldo totale (entrate - uscite)
- Bilancio mensile corrente
- Somma entrate e uscite separate
- Trend cumulativo nel tempo

### Gestione Errori
- Validazione form completa
- Conferme per azioni distruttive
- Messaggi di errore informativi
- Fallback per dati mancanti

### Performance
- Caricamento istantaneo (no build step)
- Rendering efficiente delle liste
- Aggiornamenti reattivi dei grafici
- Memoria ottimizzata

## 🔧 Personalizzazione

### Aggiungere Nuove Categorie
Modifica l'array delle categorie in `script.js`:
```javascript
// Nel metodo getCategoryIcon()
const icons = {
    'Alimentari': '🍕',
    'TuaCategoria': '🎯', // Aggiungi qui
    // ...
};
```

### Modificare i Colori
Personalizza i colori in `styles.css`:
```css
:root {
    --primary-color: #3b82f6;
    --success-color: #10b981;
    --danger-color: #ef4444;
    /* Aggiungi le tue variabili */
}
```

### Cambiare la Valuta
Modifica il metodo `formatCurrency()` in `script.js`:
```javascript
formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD' // Cambia qui
    }).format(Math.abs(amount));
}
```

## 📈 Roadmap Futura

- [ ] 🌙 Modalità dark/light
- [ ] 📊 Grafici aggiuntivi (bar chart, area chart)
- [ ] 🎯 Sistema di budget e obiettivi
- [ ] 📅 Filtri per periodo temporale
- [ ] 💱 Supporto multi-valuta
- [ ] 📱 PWA (Progressive Web App)
- [ ] 🔄 Sincronizzazione cloud
- [ ] 📊 Report PDF esportabili

## 🤝 Contribuire

1. Fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 👨‍💻 Autore

**Aurora Budget** - Sviluppato con ❤️ per la gestione finanziaria personale

---

⭐ **Se ti piace questo progetto, lascia una stella su GitHub!** ⭐