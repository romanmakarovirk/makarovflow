import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Trash2, AlertCircle, Loader } from 'lucide-react';
import { aiMessages, settings } from '../db/database';
import { sendMessage, getSuggestedQuestions } from '../services/chatService';
import { useStore } from '../store/useStore';
import { haptic } from '../utils/telegram';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AIChat = () => {
  const { showToast } = useStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [usage, setUsage] = useState({ count: 0, limit: 3 });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    loadSuggestions();
    loadUsage();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    // Check usage limit
    if (usage.count >= usage.limit) {
      showToast('Лимит запросов исчерпан. Получи Premium для большего!', 'warning');
      return;
    }

    const userMessage = text.trim();
    setInput('');
    haptic.light();

    // Add user message
    await aiMessages.add('user', userMessage);
    await loadMessages();

    setLoading(true);

    try {
      // Get conversation history for context
      const history = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Send to AI
      const response = await sendMessage(userMessage, history);

      if (response.success) {
        // Add AI response
        await aiMessages.add('assistant', response.message);
        await loadMessages();

        // Increment usage
        await settings.incrementAIUsage();
        await loadUsage();

        haptic.success();
      } else {
        showToast('Не удалось получить ответ от AI', 'error');
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
        <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">AI Помощник</h1>
                <p className="text-xs text-gray-400">
                  Осталось запросов: {remainingRequests}/{usage.limit}
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Trash2 size={18} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Usage warning */}
          {remainingRequests <= 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2"
            >
              <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300">
                {remainingRequests === 0
                  ? 'Лимит исчерпан. Получи Premium для 15 запросов в день!'
                  : 'Последний запрос! Получи Premium для большего.'}
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
              className="text-center py-12"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 mx-auto mb-4 flex items-center justify-center">
                <Sparkles size={40} className="text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Привет! Я твой AI-помощник
              </h2>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                Спрашивай меня о настроении, продуктивности, привычках — я помогу разобраться и дам совет!
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
                    className="block w-full max-w-md mx-auto px-4 py-3 bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 rounded-xl text-sm text-gray-300 transition-all"
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
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-500 to-cyan-500 text-white'
                      : 'bg-gray-800/60 border border-gray-700/50 text-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
              <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl px-4 py-3">
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
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gray-900/95 light:bg-gray-100/95 backdrop-blur-xl border-t border-gray-800/50 light:border-gray-200/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 bg-gray-800/60 light:bg-white/90 backdrop-blur-xl border border-gray-700/50 light:border-gray-300/50 rounded-2xl p-2">
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
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIChat;
