import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp } from 'lucide-react';

function AttackChart({ logs, anomalies }) {
  // Prepare data for attack frequency over time
  const prepareAttackData = () => {
    const timeMap = {};
    
    logs.forEach(log => {
      const timestamp = log.timestamp;
      if (timestamp) {
        const date = timestamp.split('T')[0];
        if (!timeMap[date]) {
          timeMap[date] = { date, attacks: 0, highRisk: 0 };
        }
        timeMap[date].attacks += 1;
        if (log.risk_score >= 70) {
          timeMap[date].highRisk += 1;
        }
      }
    });

    return Object.values(timeMap).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Prepare data for anomaly types
  const prepareAnomalyData = () => {
    const typeMap = {};
    
    anomalies.forEach(anomaly => {
      const type = anomaly.type.replace('_', ' ');
      if (!typeMap[type]) {
        typeMap[type] = { type, count: 0 };
      }
      typeMap[type].count += 1;
    });

    return Object.values(typeMap);
  };

  // Prepare data for risk distribution
  const prepareRiskData = () => {
    return [
      { name: 'High Risk (70+)', value: logs.filter(l => l.risk_score >= 70).length },
      { name: 'Medium Risk (40-69)', value: logs.filter(l => l.risk_score >= 40 && l.risk_score < 70).length },
      { name: 'Low Risk (<40)', value: logs.filter(l => l.risk_score < 40).length }
    ];
  };

  const attackData = prepareAttackData();
  const anomalyData = prepareAnomalyData();
  const riskData = prepareRiskData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Attack Frequency Over Time */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Attack Frequency Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={attackData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Line type="monotone" dataKey="attacks" stroke="#3b82f6" strokeWidth={2} name="Total Attacks" />
            <Line type="monotone" dataKey="highRisk" stroke="#ef4444" strokeWidth={2} name="High Risk" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly Types Distribution */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-500" />
          Anomaly Types
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={anomalyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="type" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="count" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Score Distribution */}
      <div className="bg-slate-800 rounded-lg p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Risk Score Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={riskData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="value" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AttackChart;
