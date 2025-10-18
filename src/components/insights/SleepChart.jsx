import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';

const SleepChart = ({ data }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('insights.sleepPattern')}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Недостаточно данных для графика
        </div>
      </Card>
    );
  }

  const getBarColor = (hours) => {
    if (hours < 6) return '#EF4444'; // red
    if (hours < 7) return '#F97316'; // orange
    if (hours >= 8) return '#10B981'; // green
    return '#3B82F6'; // blue
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const hours = payload[0].value;
      const quality = payload[0].payload.sleepQuality;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-300 mb-1">{payload[0].payload.date}</p>
          <p className="text-lg font-bold text-blue-400 mb-1">
            {hours}ч сна
          </p>
          {quality && (
            <p className="text-sm text-gray-400">
              Качество: {'⭐'.repeat(quality)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('insights.sleepPattern')}</h3>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-gray-400">&lt;6ч</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-gray-400">7ч</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span className="text-gray-400">&gt;8ч</span>
            </div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                domain={[0, 12]}
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                label={{ value: 'часов', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sleep" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.sleep)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recommended sleep line */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
          <div className="h-px w-8 bg-green-500" />
          <span>Рекомендуется: 7-9 часов</span>
          <div className="h-px w-8 bg-green-500" />
        </div>
      </div>
    </Card>
  );
};

export default SleepChart;
