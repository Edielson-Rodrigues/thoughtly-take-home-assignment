import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Card, CardHeader, CardContent, Alert } from '../../../components/ui';
import { formatCurrency } from '../../../lib/utils';
import { useConcerts } from '../../concerts/hooks/useConcerts';
import { useAnalytics } from '../hooks/useAnalytics';
import { DashboardPeriods } from '../types';
import { SalesChart, RevenueByTierChart, StatCard } from '../components';
import type { DashboardFilters, DashboardPeriod } from '../types';

const RevenueIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TicketIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
);

const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export function AnalyticsDashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({ period: DashboardPeriods.DAY });
  const [startDateValue, setStartDateValue] = useState('');
  const [endDateValue, setEndDateValue] = useState('');

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const { data: concerts } = useConcerts();
  const { data: dashboard, isLoading, error } = useAnalytics(filters);

  const updateFilter = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const setter = type === 'start' ? setStartDateValue : setEndDateValue;
    const key = type === 'start' ? 'startDate' : 'endDate';
    setter(value);
    
    if (!value) {
      updateFilter(key, undefined);
      return;
    }
    
    const [year, month, day] = value.split('-').map(Number);
    const hours = type === 'start' ? [0, 0, 0, 0] : [23, 59, 59, 999];
    updateFilter(key, new Date(year, month - 1, day, ...hours).toISOString());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="error">Failed to load analytics. Please try again later.</Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-1 text-gray-600">Track sales performance and revenue metrics</p>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <TicketIcon />
              Concerts
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concert</label>
                <select value={filters.concertId || ''} onChange={(e) => updateFilter('concertId', e.target.value || undefined)} className={selectClass}>
                  <option value="">All Concerts</option>
                  {concerts?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
                <select value={filters.period} onChange={(e) => updateFilter('period', e.target.value as DashboardPeriod)} className={selectClass}>
                  <option value={DashboardPeriods.DAY}>Day</option>
                  <option value={DashboardPeriods.WEEK}>Week</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={startDateValue} max={endDateValue || today} onChange={(e) => handleDateChange('start', e.target.value)} className={selectClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" value={endDateValue} min={startDateValue} max={today} onChange={(e) => handleDateChange('end', e.target.value)} className={selectClass} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard title="Total Revenue" value={formatCurrency(dashboard?.summary.totalRevenue || 0)} icon={<RevenueIcon />} />
          <StatCard title="Tickets Sold" value={dashboard?.summary.totalTicketsSold || 0} icon={<TicketIcon />} />
        </div>

        {/* Charts */}
        <div className="space-y-8">
          <Card>
            <CardHeader><h3 className="text-lg font-semibold text-gray-900">Sales Over Time</h3></CardHeader>
            <CardContent>
              {dashboard?.salesOverTime?.length ? <SalesChart data={dashboard.salesOverTime} /> : <p className="text-gray-500 text-center py-8">No sales data available</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h3 className="text-lg font-semibold text-gray-900">Revenue by Tier</h3></CardHeader>
            <CardContent>
              {dashboard?.revenueByTier?.length ? <RevenueByTierChart data={dashboard.revenueByTier} /> : <p className="text-gray-500 text-center py-8">No tier data available</p>}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
