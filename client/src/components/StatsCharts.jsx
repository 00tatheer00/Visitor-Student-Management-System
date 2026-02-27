import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { API_BASE } from '../config.js';

const COLORS = ['#7c3aed', '#ec4899', '#06b6d4'];

const getPlaceholderChartData = () => {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      visitors: 0,
      students: 0
    });
  }
  return result;
};

const StatsCharts = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await fetch(`${API_BASE}/reports/chart`);
        const data = await res.json();
        if (res.ok && Array.isArray(data) && data.length > 0) {
          setChartData(data);
        } else {
          setChartData(getPlaceholderChartData());
        }
      } catch (e) {
        setChartData(getPlaceholderChartData());
      } finally {
        setLoading(false);
      }
    };
    fetchChart();
    const interval = setInterval(fetchChart, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !chartData) {
    return (
      <div className="charts-row">
        <div className="chart-card chart-skeleton" />
        <div className="chart-card chart-skeleton" />
      </div>
    );
  }

  let pieData = [
    { name: 'Visitors', value: chartData.reduce((s, d) => s + d.visitors, 0), color: COLORS[0] },
    { name: 'Students', value: chartData.reduce((s, d) => s + d.students, 0), color: COLORS[1] }
  ].filter((d) => d.value > 0);

  if (pieData.length === 0) {
    pieData = [{ name: 'No data yet', value: 1, color: '#94a3b8' }];
  }

  return (
    <div className="charts-row">
      <div className="chart-card chart-bar">
        <h4>Visit & Entry Statistics</h4>
        <div className="chart-inner">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="visitors" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Visitors" />
              <Bar dataKey="students" fill={COLORS[1]} radius={[4, 4, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-card chart-pie">
        <h4>Entry Type Distribution</h4>
        <div className="chart-inner">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, n, p) => [`${v} entries`, p.payload.name]}
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsCharts;
