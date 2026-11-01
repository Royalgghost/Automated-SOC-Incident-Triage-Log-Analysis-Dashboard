from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .log_parser import parse_logs
from .anomaly_detection import detect_anomalies, calculate_risk_score
from .mitigation import generate_mitigation_rules
from typing import List, Dict, Any
import json

app = FastAPI(title="SOC Incident Triage Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "SOC Incident Triage Dashboard API"}

@app.post("/api/upload-logs")
async def upload_logs(file: UploadFile = File(...)):
    """Upload and parse log files (JSON or CSV)"""
    try:
        contents = await file.read()
        
        if file.filename.endswith('.json'):
            logs = parse_logs(contents.decode('utf-8'), 'json')
        elif file.filename.endswith('.csv'):
            logs = parse_logs(contents.decode('utf-8'), 'csv')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use JSON or CSV.")
        
        # Detect anomalies
        anomalies = detect_anomalies(logs)
        
        # Calculate risk scores
        for log in logs:
            log['risk_score'] = calculate_risk_score(log)
        
        return {
            "total_logs": len(logs),
            "logs": logs,
            "anomalies": anomalies,
            "summary": {
                "high_risk": len([l for l in logs if l['risk_score'] >= 70]),
                "medium_risk": len([l for l in logs if 40 <= l['risk_score'] < 70]),
                "low_risk": len([l for l in logs if l['risk_score'] < 40])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-logs")
async def analyze_logs(logs: List[Dict[str, Any]]):
    """Analyze already parsed logs"""
    try:
        anomalies = detect_anomalies(logs)
        
        for log in logs:
            log['risk_score'] = calculate_risk_score(log)
        
        return {
            "logs": logs,
            "anomalies": anomalies,
            "summary": {
                "high_risk": len([l for l in logs if l['risk_score'] >= 70]),
                "medium_risk": len([l for l in logs if 40 <= l['risk_score'] < 70]),
                "low_risk": len([l for l in logs if l['risk_score'] < 40])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-rules")
async def generate_rules(anomalies: List[Dict[str, Any]]):
    """Generate mitigation rules for detected anomalies"""
    try:
        rules = generate_mitigation_rules(anomalies)
        return {"rules": rules}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
