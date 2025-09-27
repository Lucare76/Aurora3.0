import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { aiBudgetHelper } from '../utils/AIBudgetHelper';
import { MessageCircle, X, Send, Bot, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const AIAssistant = () => {
  const { transactions, balance, totalResources, paymentMethods } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const messagesEndRef = useRef(null);

  // Analizza i dati quando cambiano le transazioni
  useEffect(() => {
    const analysis = aiBudgetHelper.analyzeTransactions(transactions, paymentMethods);
    setAiAnalysis(analysis);
    
    // Messaggio di benvenuto iniziale
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        type: 'ai',
        content: '👋 Ciao! Sono Aurora AI, il tuo assistente finanziario intelligente. Ho analizzato i tuoi dati e sono pronto ad aiutarti!',
        timestamp: new Date()
      }]);
    }
  }, [transactions, paymentMethods]);

  // Scroll automatico ai nuovi messaggi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Genera risposta AI
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage.toLowerCase());
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }]);
    }, 1000);

    setInputMessage('');
  };

  const generateAIResponse = (userInput) => {
    const advice = aiBudgetHelper.getPersonalizedAdvice(transactions, balance);
    
    // Risposte contestuali basate sull'input
    if (userInput.includes('spese') || userInput.includes('spesa')) {
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return `📊 Le tue spese totali sono di €${totalExpenses.toFixed(2)}. ${advice[0]?.message || 'Continua così!'} Vuoi che analizzi una categoria specifica?`;
    }
    
    if (userInput.includes('risparmio') || userInput.includes('risparmi')) {
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;
      
      return `💰 Il tuo tasso di risparmio attuale è del ${savingsRate.toFixed(1)}%. ${savingsRate >= 20 ? 'Eccellente!' : 'Consiglio di puntare al 20%'} Posso suggerirti strategie per migliorare.`;
    }
    
    if (userInput.includes('budget') || userInput.includes('bilancio')) {
      return `📈 Il tuo bilancio attuale è di €${balance.toFixed(2)}. Le risorse totali disponibili sono €${totalResources.toFixed(2)}. Vuoi che ti aiuti a pianificare il budget del prossimo mese?`;
    }
    
    if (userInput.includes('categoria') || userInput.includes('categorie')) {
      if (aiAnalysis?.patterns?.topCategories?.length > 0) {
        const top = aiAnalysis.patterns.topCategories[0];
        return `🏷️ La tua categoria di spesa principale è "${top.category}" con €${top.total.toFixed(2)}. Media per transazione: €${top.average.toFixed(2)}. Vuoi analizzarla nel dettaglio?`;
      }
    }
    
    if (userInput.includes('consigli') || userInput.includes('suggerimenti')) {
      if (aiAnalysis?.recommendations?.length > 0) {
        const rec = aiAnalysis.recommendations[0];
        return `💡 ${rec.title}: ${rec.message} ${rec.action ? 'Azione consigliata: ' + rec.action : ''}`;
      }
    }

    // Risposta generica con insight personalizzato
    const responses = [
      `🤖 Basandomi sui tuoi dati, ${advice[0]?.message || 'stai gestendo bene le tue finanze!'} Cosa vorresti sapere di specifico?`,
      `📊 Ho analizzato ${transactions.length} transazioni. Il tuo bilancio è ${balance >= 0 ? 'positivo' : 'negativo'}. Posso aiutarti con analisi dettagliate!`,
      `💡 Sono qui per aiutarti! Posso analizzare le tue spese per categoria, suggerirti budget ottimali, o darti consigli personalizzati. Cosa ti interessa?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getQuickActions = () => [
    {
      label: '📊 Analizza Spese',
      action: () => {
        const analysis = aiAnalysis?.patterns?.topCategories?.[0];
        if (analysis) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'ai',
            content: `📊 **Analisi Spese Dettagliata:**\n\n🏆 Categoria principale: ${analysis.category}\n💰 Totale speso: €${analysis.total.toFixed(2)}\n📈 Media per transazione: €${analysis.average.toFixed(2)}\n🔢 Numero transazioni: ${analysis.count}\n\n${analysis.total > 500 ? '⚠️ Categoria ad alto impatto - monitora attentamente' : '✅ Spesa nella norma'}`,
            timestamp: new Date()
          }]);
        }
      }
    },
    {
      label: '💡 Consigli Budget',
      action: () => {
        const predictions = aiBudgetHelper.generatePredictions(transactions);
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'ai',
          content: `💡 **Consigli Budget Personalizzati:**\n\n📈 Spesa prevista prossimo mese: €${predictions.nextMonthExpenses}\n🎯 Obiettivo risparmio consigliato: €${predictions.savingsGoal}\n\n✅ Mantieni le spese sotto €${Math.round(predictions.nextMonthExpenses * 0.9)} per raggiungere i tuoi obiettivi!`,
          timestamp: new Date()
        }]);
      }
    },
    {
      label: '⚠️ Alert Intelligenti',
      action: () => {
        const alerts = aiAnalysis?.patterns?.unusualSpending || [];
        if (alerts.length > 0) {
          const alert = alerts[0];
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'ai',
            content: `⚠️ **Alert Rilevato:**\n\n${alert.reason}\n💰 Importo: €${alert.transaction.amount.toFixed(2)}\n📅 Data: ${new Date(alert.transaction.date).toLocaleDateString()}\n\n💡 Verifica se questa spesa era pianificata o se puoi ottimizzarla in futuro.`,
            timestamp: new Date()
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'ai',
            content: '✅ **Nessun Alert:** Le tue spese sono in linea con i pattern abituali. Ottimo controllo del budget!',
            timestamp: new Date()
          }]);
        }
      }
    }
  ];

  const getMessageIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Bot className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-40"
        title="Aurora AI Assistant"
      >
        <Bot className="h-6 w-6" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md h-[600px] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Aurora AI</h3>
                  <p className="text-xs opacity-90">Il tuo assistente finanziario</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'ai' && getMessageIcon('info')}
                      <div className="text-sm whitespace-pre-line">{message.content}</div>
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-t bg-gray-50">
              <div className="text-xs text-gray-600 mb-2">Azioni Rapide:</div>
              <div className="flex gap-2 flex-wrap">
                {getQuickActions().map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-100 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Chiedi qualsiasi cosa sul tuo budget..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;