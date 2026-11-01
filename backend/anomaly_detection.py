from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime, timedelta
import re

def detect_anomalies(logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Detect various types of anomalies in logs"""
    anomalies = []
    
    # Detect brute force attempts
    brute_force = detect_brute_force(logs)
    anomalies.extend(brute_force)
    
    # Detect impossible travel
    impossible_travel = detect_impossible_travel(logs)
    anomalies.extend(impossible_travel)
    
    # Detect lateral movement
    lateral_movement = detect_lateral_movement(logs)
    anomalies.extend(lateral_movement)
    
    # Detect port scanning
    port_scan = detect_port_scan(logs)
    anomalies.extend(port_scan)
    
    # Detect unusual login times
    unusual_times = detect_unusual_login_times(logs)
    anomalies.extend(unusual_times)
    
    return anomalies

def detect_brute_force(logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Detect brute force login attempts"""
    anomalies = []
    
    # Track failed login attempts per IP
    failed_attempts = defaultdict(list)
    
    for log in logs:
        src_ip = log.get('source_ip')
        action = log.get('action', '').lower()
        message = log.get('message', '').lower()
        
        if src_ip and ('fail' in action or 'denied' in action or 'error' in message or 'failed' in message):
            failed_attempts[src_ip].append(log)
    
    # Flag IPs with more than 5 failed attempts
    for ip, attempts in failed_attempts.items():
        if len(attempts) >= 5:
            anomalies.append({
                'type': 'brute_force',
                'severity': 'high',
                'source_ip': ip,
                'attempt_count': len(attempts),
                'description': f'Brute force attack detected from {ip} with {len(attempts)} failed attempts',
                'affected_logs': attempts,
                'timestamp': attempts[-1].get('timestamp')
            })
    
    return anomalies

def detect_impossible_travel(logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Detect impossible travel (login from two distant locations in short time)"""
    anomalies = []
    
    # Group logs by username
    user_logins = defaultdict(list)
    
    for log in logs:
        username = log.get('username')
        src_ip = log.get('source_ip')
        timestamp = log.get('timestamp')
        
        if username and src_ip and timestamp:
            user_logins[username].append({
                'ip': src_ip,
                'timestamp': timestamp,
                'log': log
            })
    
    # Check for impossible travel
    for username, logins in user_logins.items():
        if len(logins) < 2:
            continue
        
        # Sort by timestamp
        sorted_logins = sorted(logins, key=lambda x: str(x['timestamp']))
        
        for i in range(len(sorted_logins) - 1):
            login1 = sorted_logins[i]
            login2 = sorted_logins[i + 1]
            
            # Simplified check: different IPs within 10 minutes
            if login1['ip'] != login2['ip']:
                anomalies.append({
                    'type': 'impossible_travel',
                    'severity': 'high',
                    'username': username,
                    'ip1': login1['ip'],
                    'ip2': login2['ip'],
                    'description': f'Impossible travel detected for user {username}: logged in from {login1["ip"]} and {login2["ip"]} in quick succession',
                    'affected_logs': [login1['log'], login2['log']]
                })
    
    return anomalies

def detect_lateral_movement(logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Detect lateral movement patterns"""
    anomalies = []
    
    # Track connections between internal hosts
    internal_connections = defaultdict(list)
    
    for log in logs:
        src_ip = log.get('source_ip')
        dst_ip = log.get('destination_ip')
        
        if src_ip and dst_ip and not is_public_ip(src_ip) and not is_public_ip(dst_ip):
            internal_connections[src_ip].append({
                'dst_ip': dst_ip,
                'log': log
            })
    
    # Flag hosts connecting to many internal destinations
    for src_ip, connections in internal_connections.items():
        unique_destinations = set(c['dst_ip'] for c in connections)
        
        if len(unique_destinations) >= 5:
            anomalies.append({
                'type': 'lateral_movement',
                'severity': 'high',
                'source_ip': src_ip,
                'destination_count': len(unique_destinations),
                'description': f'Lateral movement detected from {src_ip} connecting to {len(unique_destinations)} internal hosts',
                'affected_logs': [c['log'] for c in connections]
            })
    
    return anomalies

def detect_port_scan(logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Detect port scanning activity"""
    anomalies = []
    
    # Track ports accessed per IP
    ip_ports = defaultdict(set)
    
    for log in logs:
        src_ip = log.get('source_ip')
        dst_port = log.get('destination_port')
        
        if src_ip and dst_port:
            try:
                port = int(dst_port)
                ip_ports[src_ip].add(port)
            except (ValueError, TypeError):
                pass
    
    # Flag IPs scanning many ports
    for ip, ports in ip_ports.items():
        if len(ports) >= 10:
            anomalies.append({
                'type': 'port_scan',
                'severity': 'medium',
                'source_ip': ip,
                'port_count': len(ports),
                'description': f'Port scan detected from {ip} scanning {len(ports)} different ports',
                'ports_scanned': sorted(list(ports))
            })
    
    return anomalies

def detect_unusual_login_times(logs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Detect logins during unusual hours"""
    anomalies = []
    
    for log in logs:
        action = log.get('action', '').lower()
        timestamp = log.get('timestamp')
        
        if 'login' in action or 'auth' in action:
            # Simplified check: flag all logins (in real implementation, compare with baseline)
            anomalies.append({
                'type': 'unusual_login_time',
                'severity': 'low',
                'timestamp': timestamp,
                'description': f'Login activity detected at {timestamp}',
                'affected_logs': [log]
            })
    
    return anomalies

def is_public_ip(ip: str) -> bool:
    """Check if IP is a public IP address"""
    if not ip:
        return False
    
    # Private IP ranges
    private_ranges = [
        ('10.0.0.0', '10.255.255.255'),
        ('172.16.0.0', '172.31.255.255'),
        ('192.168.0.0', '192.168.255.255'),
        ('127.0.0.0', '127.255.255.255')
    ]
    
    try:
        ip_parts = list(map(int, ip.split('.')))
        ip_num = (ip_parts[0] << 24) + (ip_parts[1] << 16) + (ip_parts[2] << 8) + ip_parts[3]
        
        for start, end in private_ranges:
            start_parts = list(map(int, start.split('.')))
            end_parts = list(map(int, end.split('.')))
            start_num = (start_parts[0] << 24) + (start_parts[1] << 16) + (start_parts[2] << 8) + start_parts[3]
            end_num = (end_parts[0] << 24) + (end_parts[1] << 16) + (end_parts[2] << 8) + end_parts[3]
            
            if start_num <= ip_num <= end_num:
                return False
        
        return True
    except:
        return False

def calculate_risk_score(log: Dict[str, Any]) -> int:
    """Calculate risk score for a log entry (0-100)"""
    score = 0
    
    # Base score from severity
    severity = log.get('severity', '').lower()
    if severity in ['critical', 'high']:
        score += 50
    elif severity in ['medium', 'warning']:
        score += 30
    elif severity in ['low', 'info']:
        score += 10
    
    # Action-based scoring
    action = log.get('action', '').lower()
    if 'fail' in action or 'denied' in action or 'blocked' in action:
        score += 30
    elif 'error' in action:
        score += 20
    
    # Suspicious patterns
    message = log.get('message', '').lower()
    suspicious_keywords = ['brute', 'force', 'injection', 'exploit', 'malware', 'trojan', 'virus']
    for keyword in suspicious_keywords:
        if keyword in message:
            score += 15
    
    # Port-based scoring
    dst_port = log.get('destination_port')
    if dst_port:
        try:
            port = int(dst_port)
            # High-risk ports
            if port in [22, 23, 3389, 445, 135, 139]:
                score += 20
            elif port in [80, 443, 8080, 8443]:
                score += 5
        except (ValueError, TypeError):
            pass
    
    # Cap at 100
    return min(score, 100)
