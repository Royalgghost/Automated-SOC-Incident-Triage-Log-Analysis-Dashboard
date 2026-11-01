import React from 'react';
import { Shield, AlertTriangle, Activity, Lock } from 'lucide-react';

function StatsCards({ summary, totalLogs, totalAnomalies }) {
  const cards = [
    {
      title: 'Total Logs',
      value: totalLogs,
      icon: Activity,
      color: 'blue',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      title: 'Anomalies Detected',
      value: totalAnomalies,
      icon: AlertTriangle,
      color: 'yellow',
      bgColor: 'bg-yellow-500/20',
      textColor: 'text-yellow-400'
    },
    {
      title: 'High Risk',
      value: summary?.high_risk || 0,
      icon: Shield,
      color: 'red',
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400'
    },
    {
      title: 'Medium Risk',
      value: summary?.medium_risk || 0,
      icon: Lock,
      color: 'orange',
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className={`${card.bgColor} rounded-lg p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
              </div>
              <Icon className={`w-8 h-8 ${card.textColor}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCards;
