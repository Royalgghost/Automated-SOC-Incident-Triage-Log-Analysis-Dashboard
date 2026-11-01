import React, { useState } from 'react';
import { Shield, AlertTriangle, Activity, Lock } from 'lucide-react';
import LogUpload from './LogUpload';
import StatsCards from './StatsCards';
import AnomalyList from './AnomalyList';
import AttackChart from './AttackChart';
import MitigationRules from './MitigationRules';

function Dashboard({ logs, anomalies, summary, onLogsProcessed }) {
  const [selectedAnomalies, setSelectedAnomalies] = useState([]);

  const handleGenerateRules = (anomalyList) => {
    setSelectedAnomalies(anomalyList);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">SOC Incident Triage Dashboard</h1>
        </div>
        <p className="text-slate-400">Upload and analyze security logs for automated threat detection</p>
      </div>

      {/* Log Upload */}
      <div className="mb-8">
        <LogUpload onLogsProcessed={onLogsProcessed} />
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="mb-8">
          <StatsCards summary={summary} totalLogs={logs.length} totalAnomalies={anomalies.length} />
        </div>
      )}

      {/* Charts */}
      {logs.length > 0 && (
        <div className="mb-8">
          <AttackChart logs={logs} anomalies={anomalies} />
        </div>
      )}

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <div className="mb-8">
          <AnomalyList 
            anomalies={anomalies} 
            onGenerateRules={handleGenerateRules}
          />
        </div>
      )}

      {/* Mitigation Rules */}
      {selectedAnomalies.length > 0 && (
        <div className="mb-8">
          <MitigationRules anomalies={selectedAnomalies} />
        </div>
      )}

      {/* Logs Table */}
      {logs.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Processed Logs ({logs.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400">Timestamp</th>
                  <th className="text-left py-3 px-4 text-slate-400">Source IP</th>
                  <th className="text-left py-3 px-4 text-slate-400">Destination IP</th>
                  <th className="text-left py-3 px-4 text-slate-400">Action</th>
                  <th className="text-left py-3 px-4 text-slate-400">Risk Score</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 50).map((log, index) => (
                  <tr key={index} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="py-3 px-4 text-slate-300">{log.timestamp || '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{log.source_ip || '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{log.destination_ip || '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{log.action || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.risk_score >= 70 ? 'bg-red-500/20 text-red-400' :
                        log.risk_score >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {log.risk_score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length > 50 && (
              <p className="text-slate-400 text-sm mt-4">Showing first 50 of {logs.length} logs</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
