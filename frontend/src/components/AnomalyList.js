import React, { useState } from 'react';
import { AlertTriangle, Shield, Globe, Network, Clock, ChevronDown, ChevronUp } from 'lucide-react';

function AnomalyList({ anomalies, onGenerateRules }) {
  const [expandedAnomalies, setExpandedAnomalies] = useState({});
  const [selectedAnomalies, setSelectedAnomalies] = useState([]);

  const toggleExpand = (index) => {
    setExpandedAnomalies(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSelection = (index) => {
    setSelectedAnomalies(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleGenerateRules = () => {
    const selected = selectedAnomalies.map(i => anomalies[i]);
    onGenerateRules(selected);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'brute_force':
        return Shield;
      case 'impossible_travel':
        return Globe;
      case 'lateral_movement':
        return Network;
      case 'port_scan':
        return Network;
      case 'unusual_login_time':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Detected Anomalies ({anomalies.length})
        </h2>
        {selectedAnomalies.length > 0 && (
          <button
            onClick={handleGenerateRules}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Generate Mitigation Rules ({selectedAnomalies.length})
          </button>
        )}
      </div>

      <div className="space-y-4">
        {anomalies.map((anomaly, index) => {
          const Icon = getIcon(anomaly.type);
          const isExpanded = expandedAnomalies[index];
          const isSelected = selectedAnomalies.includes(index);

          return (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-colors ${
                isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700'
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelection(index)}
                  className="mt-1 w-4 h-4 rounded"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-white capitalize">
                      {anomaly.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity}
                    </span>
                  </div>
                  
                  <p className="text-slate-400 text-sm">{anomaly.description}</p>
                  
                  {anomaly.source_ip && (
                    <p className="text-slate-500 text-sm mt-1">
                      Source IP: {anomaly.source_ip}
                    </p>
                  )}
                  
                  {anomaly.username && (
                    <p className="text-slate-500 text-sm mt-1">
                      User: {anomaly.username}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleExpand(index)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {isExpanded && anomaly.affected_logs && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">Affected Logs:</p>
                  <div className="bg-slate-900 rounded p-3 max-h-48 overflow-y-auto">
                    <pre className="text-xs text-slate-300">
                      {JSON.stringify(anomaly.affected_logs, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AnomalyList;
