import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';

const MoodChart = ({ data }) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('insights.moodTrend')}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Недостаточно данных для графика
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-300 mb-1">{payload[0].payload.date}</p>
          <p className="text-lg font-bold text-blue-400">
            {payload[0].value}/10
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('insights.moodTrend')}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
            <span>Настроение</span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9333EA" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                domain={[0, 10]}
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="url(#moodGradient)"
                strokeWidth={3}
                fill="url(#moodGradient)"
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Плохо</span>
          <span>Отлично</span>
        </div>
      </div>
    </Card>
  );
};

export default MoodChart;
