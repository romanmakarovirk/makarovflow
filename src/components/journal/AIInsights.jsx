import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Heart, Loader } from 'lucide-react';
import Card from '../ui/Card';
import { generateInsights, getMoodRecommendation } from '../../services/aiService';
import { journalEntries } from '../../db/database';

const AIInsights = ({ latestEntry }) => {
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [latestEntry]);

  const loadInsights = async () => {
    setLoading(true);

    try {
      // Get last 30 days of entries
      const entries = await journalEntries.getLastN(30);

      if (entries.length === 0) {
        setLoading(false);
        return;
      }

      // Generate AI insights
      const aiInsights = await generateInsights(entries);
      setInsights(aiInsights);

      // Get recommendations if we have latest entry
      if (latestEntry) {
        const recs = getMoodRecommendation(
          latestEntry.mood,
          latestEntry.energy || 50,
          latestEntry.sleepHours || 7
        );
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive':
        return <Heart size={16} className="text-emerald-400" />;
      case 'warning':
        return <AlertCircle size={16} className="text-amber-400" />;
      case 'suggestion':
        return <Sparkles size={16} className="text-cyan-400" />;
      case 'insight':
        return <TrendingUp size={16} className="text-blue-400" />;
      default:
        return <Sparkles size={16} className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gray-800/40 border-gray-700/50">
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <Loader size={20} className="animate-spin" />
          <span className="text-sm">Анализирую данные...</span>
        </div>
      </Card>
    );
  }

  if (!insights || !insights.insights || insights.insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="p-5 bg-gradient-to-br from-gray-800/40 to-gray-800/20 border-gray-700/50">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-white mb-1">
              AI Анализ
            </h3>
            <p className="text-sm text-gray-400">
              {insights.summary}
            </p>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-2">
          <AnimatePresence>
            {insights.insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-gray-800/40 rounded-xl"
              >
                <span className="text-xl flex-shrink-0">{insight.icon}</span>
                <p className="text-sm text-gray-300 flex-1">
                  {insight.text}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <AnimatePresence>
          {recommendations.map((rec, recIndex) => (
            <motion.div
              key={recIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2 + recIndex * 0.1 }}
            >
              <Card className="p-5 bg-gray-800/30 border-gray-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{rec.icon}</span>
                  <h4 className="text-sm font-medium text-white">
                    {rec.title}
                  </h4>
                </div>
                <ul className="space-y-2">
                  {rec.suggestions.map((suggestion, sugIndex) => (
                    <motion.li
                      key={sugIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + recIndex * 0.1 + sugIndex * 0.05 }}
                      className="flex items-start gap-2 text-sm text-gray-400"
                    >
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default AIInsights;
