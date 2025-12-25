import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';

interface DailySpending {
  date: string;
  day: string;
  amount: number;
  transactionCount: number;
  categoryBreakdown: Record<string, number>;
}

interface SpendingByDayAnalysisProps {
  transactions?: Array<{
    date: string;
    amount: number;
    category?: string;
  }>;
  isLoading?: boolean;
  currency?: string;
}

const SpendingByDayAnalysis: React.FC<SpendingByDayAnalysisProps> = ({
  transactions = [],
  isLoading = false,
  currency = '$',
}) => {
  const dailySpending = useMemo(() => {
    if (!transactions.length) return [];

    const grouped: Record<string, DailySpending> = {};

    transactions.forEach((transaction) => {
      if (!grouped[transaction.date]) {
        const date = new Date(transaction.date);
        grouped[transaction.date] = {
          date: transaction.date,
          day: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          amount: 0,
          transactionCount: 0,
          categoryBreakdown: {},
        };
      }

      grouped[transaction.date].amount += transaction.amount;
      grouped[transaction.date].transactionCount += 1;

      if (transaction.category) {
        grouped[transaction.date].categoryBreakdown[transaction.category] =
          (grouped[transaction.date].categoryBreakdown[transaction.category] || 0) + transaction.amount;
      }
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [transactions]);

  const totalSpending = useMemo(
    () => dailySpending.reduce((sum, day) => sum + day.amount, 0),
    [dailySpending]
  );

  const averageSpending = dailySpending.length > 0 ? totalSpending / dailySpending.length : 0;

  const maxSpendingDay = useMemo(
    () => dailySpending.reduce((max, day) => (day.amount > max.amount ? day : max), dailySpending[0]),
    [dailySpending]
  );

  const getSpendingColor = (amount: number, max: number) => {
    const ratio = amount / max;
    if (ratio > 0.75) return 'bg-red-100 border-l-4 border-red-500';
    if (ratio > 0.5) return 'bg-orange-100 border-l-4 border-orange-500';
    if (ratio > 0.25) return 'bg-yellow-100 border-l-4 border-yellow-500';
    return 'bg-green-100 border-l-4 border-green-500';
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!dailySpending.length) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Spending by Day</h2>
        <div className="text-center text-gray-500 py-8">
          <p>No transaction data available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Spending by Day</h2>

        {/* Summary Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Total Spending</p>
            <p className="text-2xl font-bold text-blue-600">
              {currency}{totalSpending.toFixed(2)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Average per Day</p>
            <p className="text-2xl font-bold text-purple-600">
              {currency}{averageSpending.toFixed(2)}
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <p className="text-sm text-gray-600 mb-1">Highest Day</p>
            <p className="text-2xl font-bold text-indigo-600">
              {currency}{maxSpendingDay.amount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="space-y-3">
        {dailySpending.map((day) => (
          <div
            key={day.date}
            className={`p-4 rounded-lg transition-all hover:shadow-md ${getSpendingColor(
              day.amount,
              maxSpendingDay.amount
            )}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-800">{day.day}</p>
                <p className="text-xs text-gray-600">{day.transactionCount} transaction(s)</p>
              </div>
              <p className="text-lg font-bold text-gray-800">
                {currency}{day.amount.toFixed(2)}
              </p>
            </div>

            {/* Category Breakdown */}
            {Object.keys(day.categoryBreakdown).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-300 border-opacity-50">
                <p className="text-xs font-semibold text-gray-600 mb-2">Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(day.categoryBreakdown).map(([category, amount]) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white bg-opacity-50 text-gray-700"
                    >
                      {category}: {currency}{(amount as number).toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Analyzed {dailySpending.length} day(s) with {transactions.length} transaction(s)
        </p>
      </div>
    </Card>
  );
};

export default SpendingByDayAnalysis;
