import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, Crown } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const InsightsList = ({ insights, isPremium = false }) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-400" size={24} />;
      case 'warning':
        return <AlertCircle className="text-orange-400" size={24} />;
      case 'info':
      default:
        return <Info className="text-blue-400" size={24} />;
    }
  };

  const getCardStyle = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'warning':
        return 'bg-orange-500/10 border-orange-500/30';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">💡 Инсайты и рекомендации</h3>
        <span className="text-sm text-gray-400">
          {insights.length} {insights.length === 1 ? 'инсайт' : 'инсайтов'}
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 border ${getCardStyle(insight.type)}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {insight.icon ? (
                    <span className="text-2xl">{insight.icon}</span>
                  ) : (
                    getIcon(insight.type)
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Premium AI Analyzer CTA */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: insights.length * 0.1 + 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border border-yellow-500/30">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-600/20 flex items-center justify-center">
                  <Crown className="text-yellow-400" size={32} />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-lg font-bold text-yellow-400 mb-1">
                  🤖 AI Анализатор
                </h4>
                <p className="text-sm text-gray-300 mb-3">
                  Получи детальный анализ с предсказаниями и персональными рекомендациями от искусственного интеллекта
                </p>
                <ul className="text-xs text-gray-400 space-y-1 mb-4">
                  <li>✨ Предсказание настроения на следующую неделю</li>
                  <li>🎯 Персональные рекомендации</li>
                  <li>📊 Глубокий анализ паттернов поведения</li>
                  <li>🔮 Раннее выявление проблем</li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <Button variant="primary">
                  <Crown size={20} />
                  Попробовать Premium
                </Button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  $2.99/мес
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default InsightsList;
