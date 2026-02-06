import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

import { formatCurrency } from '../../../lib/utils';

const TIER_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#6366f1',
  '#f43f5e',
];

interface TierData {
  tierName: string;
  concertName: string;
  revenue: number;
  percentage: number;
}

function TierTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TierData }>;
}) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{data.tierName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{data.concertName}</p>
        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
          {formatCurrency(data.revenue)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {data.percentage.toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
}

export function RevenueByTierChart({ data }: { data: TierData[] }) {
  if (data.length === 0) return null;

  const chartData = data
    .slice()
    .sort((a, b) => b.revenue - a.revenue)
    .map((d, i) => ({
      ...d,
      name: `${d.tierName} (${d.concertName.length > 10 ? d.concertName.slice(0, 10) + '...' : d.concertName})`,
      fill: TIER_COLORS[i % TIER_COLORS.length],
    }));

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 9, fill: '#374151' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            width={90}
          />
          <Tooltip content={<TierTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
