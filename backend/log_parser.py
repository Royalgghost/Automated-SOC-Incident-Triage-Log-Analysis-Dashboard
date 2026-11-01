import json
import csv
from io import StringIO
from typing import List, Dict, Any
from datetime import datetime

def parse_logs(content: str, format_type: str) -> List[Dict[str, Any]]:
    """Parse log content from JSON or CSV format"""
    logs = []
    
    if format_type == 'json':
        try:
            data = json.loads(content)
            if isinstance(data, list):
                logs = data
            elif isinstance(data, dict):
                logs = [data]
            else:
                raise ValueError("Invalid JSON structure")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON: {str(e)}")
    
    elif format_type == 'csv':
        try:
            csv_reader = csv.DictReader(StringIO(content))
            logs = list(csv_reader)
        except Exception as e:
            raise ValueError(f"Invalid CSV: {str(e)}")
    
    else:
        raise ValueError(f"Unsupported format: {format_type}")
    
    # Normalize log entries
    normalized_logs = []
    for log in logs:
        normalized = normalize_log_entry(log)
        normalized_logs.append(normalized)
    
    return normalized_logs

def normalize_log_entry(log: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize log entry to standard format"""
    normalized = {
        'timestamp': log.get('timestamp') or log.get('time') or log.get('date') or log.get('@timestamp'),
        'source_ip': log.get('source_ip') or log.get('src_ip') or log.get('ip') or log.get('client_ip'),
        'destination_ip': log.get('destination_ip') or log.get('dest_ip') or log.get('dst_ip') or log.get('server_ip'),
        'source_port': log.get('source_port') or log.get('src_port') or log.get('port'),
        'destination_port': log.get('destination_port') or log.get('dest_port') or log.get('dst_port'),
        'protocol': log.get('protocol') or log.get('proto'),
        'action': log.get('action') or log.get('event_type') or log.get('type'),
        'username': log.get('username') or log.get('user') or log.get('account'),
        'event_id': log.get('event_id') or log.get('id') or log.get('event'),
        'message': log.get('message') or log.get('msg') or log.get('description'),
        'severity': log.get('severity') or log.get('level') or log.get('priority'),
        'raw': log
    }
    
    # Convert timestamp to ISO format if possible
    if normalized['timestamp']:
        try:
            normalized['timestamp'] = str(normalized['timestamp'])
        except:
            pass
    
    return normalized
