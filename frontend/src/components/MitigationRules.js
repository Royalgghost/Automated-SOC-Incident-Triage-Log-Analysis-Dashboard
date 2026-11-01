import React, { useState, useEffect } from 'react';
import { Shield, Copy, Download, Check } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function MitigationRules({ anomalies }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetchRules();
  }, [anomalies]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/generate-rules`, anomalies);
      setRules(response.data.rules);
    } catch (error) {
      console.error('Failed to generate rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (rule, index) => {
    const text = rule.commands.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownloadAll = () => {
    const allCommands = rules.flatMap(rule => 
      [`# ${rule.description}`, ...rule.commands, '']
    ).join('\n');
    
    const blob = new Blob([allCommands], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mitigation_rules.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRuleIcon = (type) => {
    return Shield;
  };

  const getRuleColor = (type) => {
    switch (type) {
      case 'firewall_block':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'rate_limit':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'account_lockout':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'mfa_requirement':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'network_segmentation':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'port_filter':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'time_based_access':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-slate-400">Generating mitigation rules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Mitigation Rules ({rules.length})
        </h2>
        <button
          onClick={handleDownloadAll}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download All
        </button>
      </div>

      <div className="space-y-4">
        {rules.map((rule, index) => {
          const Icon = getRuleIcon(rule.type);
          return (
            <div key={index} className={`border rounded-lg p-4 ${getRuleColor(rule.type)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <div>
                    <span className="font-semibold text-white capitalize">
                      {rule.type.replace('_', ' ')}
                    </span>
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-slate-900/50">
                      {rule.format}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(rule, index)}
                  className="text-slate-400 hover:text-white transition-colors"
                  title="Copy commands"
                >
                  {copied === index ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              <p className="text-slate-300 text-sm mb-3">{rule.description}</p>

              <div className="bg-slate-900/50 rounded p-3">
                <p className="text-xs text-slate-400 mb-2">Commands:</p>
                <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                  {rule.commands.join('\n')}
                </pre>
              </div>

              {rule.priority && (
                <div className="mt-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    rule.priority === 'high' ? 'bg-red-500/30 text-red-300' :
                    rule.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                    'bg-green-500/30 text-green-300'
                  }`}>
                    Priority: {rule.priority}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {rules.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No mitigation rules generated for the selected anomalies.
          </div>
        )}
      </div>
    </div>
  );
}

export default MitigationRules;
