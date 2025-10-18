import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card from '../ui/Card';

const WeeklySummary = ({ summary }) => {
  const { t } = useTranslation();

  if (!summary) return null;

  const getTrendIcon = () => {
    switch (summary.trend) {
      case 'improving':
        return <TrendingUp className="text-green-400" size={20} />;
      case 'declining':
        return <TrendingDown className="text-red-400" size={20} />;
      default:
        return <Minus className="text-gray-400" size={20} />;
    }
  };

  const getTrendColor = () => {
    switch (summary.trend) {
      case 'improving':
        return 'text-green-400';
      case 'declining':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getProgressColor = (value, max, reverse = false) => {
    const percentage = (value / max) * 100;
    if (reverse) {
      if (percentage < 40) return 'from-green-500 to-teal-500';
      if (percentage < 70) return 'from-yellow-500 to-orange-500';
      return 'from-red-500 to-orange-600';
    } else {
      if (percentage < 40) return 'from-red-500 to-orange-600';
      if (percentage < 70) return 'from-yellow-500 to-orange-500';
      return 'from-green-500 to-teal-500';
    }
  };

  const metrics = [
    {
      label: t('insights.averageMood'),
      value: summary.avgMood,
      max: 10,
      suffix: '/10',
      icon: '😊',
      color: getProgressColor(summary.avgMood, 10)
    },
    {
      label: t('insights.averageSleep'),
      value: summary.avgSleep,
      max: 12,
      suffix: 'ч',
      icon: '😴',
      color: summary.avgSleep >= 7 ? 'from-green-500 to-teal-500' : 'from-orange-500 to-red-600',
      warning: summary.avgSleep < 7
    },
    {
      label: t('insights.averageEnergy'),
      value: summary.avgEnergy,
      max: 100,
      suffix: '%',
      icon: '⚡',
      color: getProgressColor(summary.avgEnergy, 100)
    }
  ];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{t('insights.weeklySummary')}</h2>
            <p className="text-sm text-gray-400 mt-1">
              Последние {summary.totalDays} {summary.totalDays === 1 ? 'день' : 'дней'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {summary.trend === 'improving' ? 'Улучшение' :
               summary.trend === 'declining' ? 'Ухудшение' :
               'Стабильно'}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{metric.icon}</span>
                  <span className="text-sm font-medium text-gray-300">
                    {metric.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-white">
                    {metric.value.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {metric.suffix}
                  </span>
                  {metric.warning && (
                    <span className="text-orange-400 ml-1">⚠️</span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${metric.color} transition-all duration-500`}
                  style={{ width: `${(metric.value / metric.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Good days counter */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{t('insights.goodDays')}</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-400">
                {summary.goodDays}
              </span>
              <span className="text-gray-400">
                {t('insights.of')} {summary.totalDays}
              </span>
              <span className="text-sm text-gray-500">
                ({Math.round((summary.goodDays / summary.totalDays) * 100)}%)
              </span>
            </div>
          </div>

          {/* Visual indicator */}
          <div className="flex gap-1 mt-3">
            {Array.from({ length: summary.totalDays }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-full ${
                  i < summary.goodDays
                    ? 'bg-green-500'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeeklySummary;
