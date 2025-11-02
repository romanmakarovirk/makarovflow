import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Trash2, AlertCircle, Loader, TrendingUp, Heart, Zap, Moon } from 'lucide-react';
import { aiMessages, settings, journalEntries, userStats } from '../db/database';
import { sendMessage, getSuggestedQuestions } from '../services/chatService';
import { useStore } from '../store/useStore';
import { haptic } from '../utils/telegram';
import Card from '../components/ui/Card';

const AIAssistant = () => {
  const { showToast } = useStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [usage, setUsage] = useState({ count: 0, limit: 10 });
  const [insights, setInsights] = useState(null);
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAll = async () => {
    await Promise.all([
      loadMessages(),
      loadSuggestions(),
      loadUsage(),
      loadInsights(),
      loadStats()
    ]);
  };

  const loadMessages = async () => {
    const allMessages = await aiMessages.getRecent(50);
    setMessages(allMessages.reverse());
  };

  const loadSuggestions = async () => {
    const suggested = await getSuggestedQuestions();
    setSuggestions(suggested);
  };

  const loadUsage = async () => {
    const aiUsage = await settings.getAIUsage();
    setUsage(aiUsage);
  };

  const loadInsights = async () => {
    const entries = await journalEntries.getLastN(7);
    if (entries.length > 0) {
      const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
      const avgEnergy = entries.reduce((sum, e) => sum + e.energy, 0) / entries.length;
      const avgSleep = entries.reduce((sum, e) => sum + e.sleepHours, 0) / entries.length;

      setInsights({
        avgMood: avgMood.toFixed(1),
        avgEnergy: avgEnergy.toFixed(0),
        avgSleep: avgSleep.toFixed(1),
        trend: entries[0].mood > avgMood ? 'up' : 'down'
      });
    }
  };

  const loadStats = async () => {
    const userStatsData = await userStats.get();
    setStats(userStatsData);
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    if (usage.count >= usage.limit) {
      showToast('Лимит запросов исчерпан. Получи Premium для большего!', 'warning');
      return;
    }

    // Validate and sanitize message
    const { validateAIMessage } = await import('../utils/validation');
    const validation = validateAIMessage(text.trim());
    
    if (!validation.isValid) {
      showToast(validation.errors[0], 'warning');
      return;
    }

    const userMessage = validation.sanitized;
    setInput('');
    haptic.light();

    await aiMessages.add('user', userMessage);
    await loadMessages();

    setLoading(true);

    try {
      const history = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await sendMessage(userMessage, history);

      if (response.success) {
        await aiMessages.add('assistant', response.message);
        await loadMessages();
        await settings.incrementAIUsage();
        await loadUsage();
        haptic.success();
      } else {
        // Показываем сообщение об ошибке (например, rate limit)
        showToast(response.message || 'Не удалось получить ответ от AI', 'error');
      }
    } catch (error) {
      console.error('Chat error:', error);
      showToast('Произошла ошибка', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    haptic.light();
    handleSend(suggestion);
  };

  const handleClearChat = async () => {
    if (confirm('Очистить всю историю чата?')) {
      await aiMessages.clear();
      setMessages([]);
      haptic.success();
      showToast('История очищена', 'success');
    }
  };

  const remainingRequests = usage.limit - usage.count;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen pb-32"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900/70 backdrop-blur-xl border-b border-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                  AI Помощник
                </h1>
                <p className="text-xs text-gray-400">
                  Осталось: {remainingRequests}/{usage.limit} запросов
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-2 hover:bg-gray-800/60 rounded-xl transition-all"
              >
                <Trash2 size={18} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Insights Cards */}
          {insights && (
            <div className="grid grid-cols-4 gap-2">
              <Card className="p-3 bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
                <Heart size={16} className="text-pink-400 mb-1" />
                <p className="text-lg font-bold text-pink-300">{insights.avgMood}</p>
                <p className="text-[10px] text-gray-400">Настроение</p>
              </Card>
              <Card className="p-3 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                <Zap size={16} className="text-yellow-400 mb-1" />
                <p className="text-lg font-bold text-yellow-300">{insights.avgEnergy}%</p>
                <p className="text-[10px] text-gray-400">Энергия</p>
              </Card>
              <Card className="p-3 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                <Moon size={16} className="text-blue-400 mb-1" />
                <p className="text-lg font-bold text-blue-300">{insights.avgSleep}ч</p>
                <p className="text-[10px] text-gray-400">Сон</p>
              </Card>
              <Card className="p-3 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                <TrendingUp size={16} className="text-emerald-400 mb-1" />
                <p className="text-lg font-bold text-emerald-300">{stats?.currentStreak || 0}</p>
                <p className="text-[10px] text-gray-400">Streak</p>
              </Card>
            </div>
          )}

          {/* Usage warning */}
          {remainingRequests <= 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2"
            >
              <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300">
                {remainingRequests === 0
                  ? 'Лимит исчерпан. Получи Premium для 50 запросов!'
                  : `Осталось ${remainingRequests} запроса. Premium = 50 в день!`}
              </p>
            </motion.div>
          )}
        </div>

        {/* Messages */}
        <div className="p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 mx-auto mb-4 flex items-center justify-center backdrop-blur-xl border border-white/10">
                <Sparkles size={48} className="text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Привет! Я твой AI-помощник
              </h2>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                Я слежу за твоим настроением, энергией и сном. Спрашивай меня о чём угодно — дам совет!
              </p>

              {/* Suggested questions */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">Попробуй спросить:</p>
                {suggestions.map((suggestion, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleSuggestion(suggestion)}
                    whileTap={{ scale: 0.97 }}
                    className="block w-full max-w-md mx-auto px-4 py-3 bg-gradient-to-br from-gray-800/60 to-gray-900/60 hover:from-gray-800/80 hover:to-gray-900/80 backdrop-blur-xl border border-white/5 rounded-xl text-sm text-gray-300 transition-all"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 text-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader size={16} className="animate-spin" />
                  <span className="text-sm">Думаю...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/98 to-gray-900/80 backdrop-blur-2xl border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Напиши сообщение..."
              disabled={loading || remainingRequests === 0}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 px-3 py-2 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading || remainingRequests === 0}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIAssistant;
