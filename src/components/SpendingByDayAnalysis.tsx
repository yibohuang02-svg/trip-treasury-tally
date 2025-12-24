import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DailySpending {
  date: string;
  amount: number;
  count: number;
  average: number;
}

interface SpendingEntry {
  date: string;
  amount: number;
}

interface SpendingByDayAnalysisProps {
  data: SpendingEntry[];
  title?: string;
  showAverage?: boolean;
  showTrendLine?: boolean;
}

/**
 * SpendingByDayAnalysis Component
 * 
 * Analyzes and visualizes daily spending patterns with multiple views:
 * - Daily total spending amounts
 * - Number of transactions per day
 * - Average spending per transaction
 * - Spending trends over time
 */
const SpendingByDayAnalysis: React.FC<SpendingByDayAnalysisProps> = ({
  data,
  title = 'Daily Spending Analysis',
  showAverage = true,
  showTrendLine = true,
}) => {
  // Calculate daily statistics
  const dailyStats = useMemo(() => {
    const groupedByDate: { [key: string]: number[] } = {};

    // Group spending by date
    data.forEach((entry) => {
      if (!groupedByDate[entry.date]) {
        groupedByDate[entry.date] = [];
      }
      groupedByDate[entry.date].push(entry.amount);
    });

    // Calculate daily aggregates
    const stats: DailySpending[] = Object.entries(groupedByDate)
      .map(([date, amounts]) => ({
        date,
        amount: amounts.reduce((sum, amt) => sum + amt, 0),
        count: amounts.length,
        average: amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return stats;
  }, [data]);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalSpending = dailyStats.reduce((sum, day) => sum + day.amount, 0);
    const averageDailySpending = dailyStats.length > 0 ? totalSpending / dailyStats.length : 0;
    const highestSpendingDay = dailyStats.length > 0 
      ? dailyStats.reduce((max, day) => day.amount > max.amount ? day : max)
      : null;
    const lowestSpendingDay = dailyStats.length > 0
      ? dailyStats.reduce((min, day) => day.amount < min.amount ? day : min)
      : null;

    return {
      totalSpending,
      averageDailySpending,
      highestSpendingDay,
      lowestSpendingDay,
      totalDays: dailyStats.length,
      totalTransactions: data.length,
    };
  }, [dailyStats, data]);

  if (dailyStats.length === 0) {
    return (
      <div className="spending-by-day-analysis">
        <h2>{title}</h2>
        <p className="no-data">No spending data available for analysis.</p>
      </div>
    );
  }

  return (
    <div className="spending-by-day-analysis">
      <h2>{title}</h2>

      {/* Statistics Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Spending</h3>
          <p className="stat-value">${overallStats.totalSpending.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Average Daily Spending</h3>
          <p className="stat-value">${overallStats.averageDailySpending.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Total Days</h3>
          <p className="stat-value">{overallStats.totalDays}</p>
        </div>
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <p className="stat-value">{overallStats.totalTransactions}</p>
        </div>
        {overallStats.highestSpendingDay && (
          <div className="stat-card highlight-high">
            <h3>Highest Spending Day</h3>
            <p className="stat-value">${overallStats.highestSpendingDay.amount.toFixed(2)}</p>
            <p className="stat-detail">{overallStats.highestSpendingDay.date}</p>
          </div>
        )}
        {overallStats.lowestSpendingDay && (
          <div className="stat-card highlight-low">
            <h3>Lowest Spending Day</h3>
            <p className="stat-value">${overallStats.lowestSpendingDay.amount.toFixed(2)}</p>
            <p className="stat-detail">{overallStats.lowestSpendingDay.date}</p>
          </div>
        )}
      </div>

      {/* Daily Spending Bar Chart */}
      <div className="chart-container">
        <h3>Daily Spending Amounts</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyStats} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar dataKey="amount" fill="#8884d8" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Count Chart */}
      <div className="chart-container">
        <h3>Transactions Per Day</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dailyStats} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar dataKey="count" fill="#82ca9d" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Average Spending Per Transaction */}
      {showAverage && (
        <div className="chart-container">
          <h3>Average Spending Per Transaction</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyStats} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis label={{ value: 'Average ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="average" fill="#ffc658" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Spending Trend Line */}
      {showTrendLine && (
        <div className="chart-container">
          <h3>Spending Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyStats} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number) => `$${value.toFixed(2)}`}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#8884d8" 
                dot={{ fill: '#8884d8', r: 4 }}
                name="Daily Spending"
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#ffc658" 
                dot={{ fill: '#ffc658', r: 3 }}
                strokeDasharray="5 5"
                name="Average Per Transaction"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Daily Table */}
      <div className="table-container">
        <h3>Daily Spending Details</h3>
        <table className="spending-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Spending</th>
              <th>Transactions</th>
              <th>Average Per Transaction</th>
            </tr>
          </thead>
          <tbody>
            {dailyStats.map((day) => (
              <tr key={day.date}>
                <td>{day.date}</td>
                <td className="amount">${day.amount.toFixed(2)}</td>
                <td className="count">{day.count}</td>
                <td className="amount">${day.average.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .spending-by-day-analysis {
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }

        .spending-by-day-analysis h2 {
          margin-top: 0;
          color: #333;
          border-bottom: 2px solid #8884d8;
          padding-bottom: 10px;
        }

        .spending-by-day-analysis h3 {
          color: #555;
          margin-top: 30px;
          margin-bottom: 15px;
        }

        .no-data {
          color: #999;
          font-style: italic;
          padding: 20px;
          text-align: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }

        .stat-card {
          background: white;
          padding: 15px;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #8884d8;
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #666;
          font-weight: 600;
        }

        .stat-value {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .stat-detail {
          margin: 5px 0 0 0;
          font-size: 12px;
          color: #999;
        }

        .stat-card.highlight-high {
          border-left-color: #ff7c7c;
        }

        .stat-card.highlight-low {
          border-left-color: #82ca9d;
        }

        .chart-container {
          background: white;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .table-container {
          background: white;
          padding: 20px;
          border-radius: 6px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow-x: auto;
        }

        .spending-table {
          width: 100%;
          border-collapse: collapse;
        }

        .spending-table thead {
          background-color: #f0f0f0;
        }

        .spending-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #555;
          border-bottom: 2px solid #ddd;
        }

        .spending-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
          color: #666;
        }

        .spending-table tbody tr:hover {
          background-color: #f9f9f9;
        }

        .spending-table td.amount {
          text-align: right;
          font-weight: 500;
          color: #333;
        }

        .spending-table td.count {
          text-align: center;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default SpendingByDayAnalysis;
