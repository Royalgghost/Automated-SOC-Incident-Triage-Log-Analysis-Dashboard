import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

function LogUpload({ onLogsProcessed }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/json', 'text/csv', '.json', '.csv'];
      const extension = selectedFile.name.split('.').pop().toLowerCase();
      
      if (extension === 'json' || extension === 'csv') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a JSON or CSV file');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/upload-logs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onLogsProcessed(response.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload and process logs');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = async () => {
    setUploading(true);
    setError(null);

    // Generate sample logs
    const sampleLogs = generateSampleLogs();
    
    try {
      const response = await axios.post(`${API_URL}/api/analyze-logs`, sampleLogs);
      onLogsProcessed(response.data);
    } catch (err) {
      setError('Failed to load sample logs');
    } finally {
      setUploading(false);
    }
  };

  const generateSampleLogs = () => {
    const logs = [];
    const actions = ['login_success', 'login_failed', 'connection_allowed', 'connection_blocked'];
    const ips = ['192.168.1.100', '192.168.1.101', '10.0.0.50', '203.0.113.50', '198.51.100.23'];
    
    for (let i = 0; i < 100; i++) {
      logs.push({
        timestamp: `2024-01-${String(i % 30 + 1).padStart(2, '0')}T${String(i % 24).padStart(2, '0')}:00:00Z`,
        source_ip: ips[i % ips.length],
        destination_ip: '192.168.1.1',
        source_port: Math.floor(Math.random() * 65535),
        destination_port: [22, 80, 443, 3389, 445][i % 5],
        protocol: 'TCP',
        action: actions[i % actions.length],
        username: i % 10 === 0 ? 'admin' : `user${i % 20}`,
        event_id: `EVT-${1000 + i}`,
        message: i % 5 === 0 ? 'Failed authentication attempt' : 'Normal connection',
        severity: i % 7 === 0 ? 'high' : 'info'
      });
    }
    
    // Add some brute force patterns
    for (let i = 0; i < 10; i++) {
      logs.push({
        timestamp: `2024-01-15T${String(i).padStart(2, '0')}:00:00Z`,
        source_ip: '203.0.113.50',
        destination_ip: '192.168.1.1',
        source_port: 50000 + i,
        destination_port: 22,
        protocol: 'TCP',
        action: 'login_failed',
        username: 'admin',
        event_id: `EVT-BF-${i}`,
        message: 'Failed authentication attempt',
        severity: 'high'
      });
    }
    
    return logs;
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Upload Security Logs
      </h2>
      
      <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
        <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <p className="text-slate-400 mb-4">
          Drag and drop your log file here, or click to select
        </p>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".json,.csv"
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer transition-colors"
        >
          Select File
        </label>
        
        {file && (
          <div className="mt-4 text-slate-300">
            Selected: {file.name}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
        >
          {uploading ? 'Processing...' : 'Upload & Analyze'}
        </button>
        
        <button
          onClick={handleLoadSample}
          disabled={uploading}
          className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
        >
          {uploading ? 'Loading...' : 'Load Sample Data'}
        </button>
      </div>
    </div>
  );
}

export default LogUpload;
