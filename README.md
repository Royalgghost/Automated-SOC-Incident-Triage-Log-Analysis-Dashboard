# SOC Incident Triage & Log Analysis Dashboard

A web application for security analysts to upload raw firewall or SIEM logs (JSON/CSV), automatically parse them, detect suspicious anomalies, and display them on an interactive dashboard with automated mitigation rule generation.

## Features

- **Log Upload & Parsing**: Support for JSON and CSV log formats
- **Anomaly Detection**:
  - Brute-force attack detection
  - Impossible travel detection
  - Lateral movement detection
  - Port scanning detection
  - Unusual login time detection
- **Risk Scoring**: Automated risk scoring (0-100) for each log entry
- **Interactive Dashboard**:
  - Real-time statistics cards
  - Attack frequency charts over time
  - Anomaly type distribution
  - Risk score distribution
- **Mitigation Rules**: One-click generation of firewall blocklists and security rules

## Tech Stack

### Backend
- FastAPI (Python web framework)
- Pandas (Data processing)
- Python-dateutil (Date parsing)

### Frontend
- React 18
- Tailwind CSS (Styling)
- Recharts (Data visualization)
- Lucide React (Icons)
- Axios (HTTP client)

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the project directory:
```bash
cd "c:/Users/nouam/Downloads/New folder"
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
venv\Scripts\activate
```

3. Install backend dependencies:
```bash
pip install -r requirements.txt
```

4. Start the backend server:
```bash
uvicorn backend.main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Usage

### Uploading Logs

1. Open the dashboard at `http://localhost:3000`
2. Click "Select File" to upload a JSON or CSV log file
3. Or click "Load Sample Data" to test with generated sample logs
4. Click "Upload & Analyze" to process the logs

### Sample Log Format

#### JSON Format
```json
[
  {
    "timestamp": "2024-01-15T10:30:00Z",
    "source_ip": "192.168.1.100",
    "destination_ip": "192.168.1.1",
    "source_port": 50000,
    "destination_port": 22,
    "protocol": "TCP",
    "action": "login_failed",
    "username": "admin",
    "event_id": "EVT-1001",
    "message": "Failed authentication attempt",
    "severity": "high"
  }
]
```

#### CSV Format
```csv
timestamp,source_ip,destination_ip,source_port,destination_port,protocol,action,username,event_id,message,severity
2024-01-15T10:30:00Z,192.168.1.100,192.168.1.1,50000,22,TCP,login_failed,admin,EVT-1001,Failed authentication attempt,high
```

### Dashboard Features

1. **Statistics Cards**: View total logs, anomalies detected, and risk distribution
2. **Attack Charts**: Visualize attack frequency over time and anomaly types
3. **Anomaly List**: View detected anomalies with detailed information
4. **Mitigation Rules**: Select anomalies and generate automated mitigation rules

### Generating Mitigation Rules

1. Check the boxes next to anomalies you want to address
2. Click "Generate Mitigation Rules" button
3. Review the generated rules (firewall blocks, rate limits, account lockouts, etc.)
4. Copy individual rules or download all rules as a text file

## API Endpoints

### POST /api/upload-logs
Upload and parse log files (JSON or CSV)

### POST /api/analyze-logs
Analyze already parsed logs

### POST /api/generate-rules
Generate mitigation rules for detected anomalies

### GET /api/health
Health check endpoint

## Anomaly Detection Algorithms

### Brute Force Detection
Detects IPs with 5 or more failed login attempts

### Impossible Travel
Detects logins from different geographic locations in quick succession

### Lateral Movement
Detects internal hosts connecting to 5 or more other internal hosts

### Port Scanning
Detects IPs scanning 10 or more different ports

### Unusual Login Times
Flags login activity outside normal business hours

## Risk Scoring

Risk scores are calculated based on:
- Log severity level (critical/high: +50, medium: +30, low: +10)
- Action type (failed/denied/blocked: +30, error: +20)
- Suspicious keywords in messages (+15 each)
- Destination port (high-risk ports: +20, web ports: +5)

Score range: 0-100
- High Risk: 70+
- Medium Risk: 40-69
- Risk: <40

## Development

### Project Structure
```
.
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── log_parser.py        # Log parsing logic
│   ├── anomaly_detection.py # Anomaly detection algorithms
│   └── mitigation.py        # Mitigation rule generation
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── LogUpload.js
│   │   │   ├── StatsCards.js
│   │   │   ├── AnomalyList.js
│   │   │   ├── AttackChart.js
│   │   │   └── MitigationRules.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── requirements.txt
└── README.md
```

## License

This project is provided as-is for educational and security analysis purposes.
