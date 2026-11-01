import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [summary, setSummary] = useState(null);

  const handleLogsProcessed = (data) => {
    setLogs(data.logs);
    setAnomalies(data.anomalies);
    setSummary(data.summary);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Dashboard 
        logs={logs}
        anomalies={anomalies}
        summary={summary}
        onLogsProcessed={handleLogsProcessed}
      />
    </div>
  );
}

export default App;
