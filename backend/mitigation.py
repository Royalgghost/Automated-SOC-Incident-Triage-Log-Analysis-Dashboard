from typing import List, Dict, Any

def generate_mitigation_rules(anomalies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate mitigation rules for detected anomalies"""
    rules = []
    
    for anomaly in anomalies:
        anomaly_type = anomaly.get('type')
        
        if anomaly_type == 'brute_force':
            rules.append(generate_firewall_block_rule(anomaly))
            rules.append(generate_rate_limit_rule(anomaly))
        
        elif anomaly_type == 'impossible_travel':
            rules.append(generate_account_lockout_rule(anomaly))
            rules.append(generate_mfa_requirement_rule(anomaly))
        
        elif anomaly_type == 'lateral_movement':
            rules.append(generate_network_segmentation_rule(anomaly))
            rules.append(generate_firewall_block_rule(anomaly))
        
        elif anomaly_type == 'port_scan':
            rules.append(generate_firewall_block_rule(anomaly))
            rules.append(generate_port_filtering_rule(anomaly))
        
        elif anomaly_type == 'unusual_login_time':
            rules.append(generate_time_based_access_rule(anomaly))
    
    return rules

def generate_firewall_block_rule(anomaly: Dict[str, Any]) -> Dict[str, Any]:
    """Generate firewall block rule"""
    src_ip = anomaly.get('source_ip')
    
    return {
        'type': 'firewall_block',
        'priority': 'high',
        'rule': f'block ip {src_ip}',
        'description': f'Block malicious IP {src_ip}',
        'format': 'iptables',
        'commands': [
            f'iptables -A INPUT -s {src_ip} -j DROP',
            f'iptables -A OUTPUT -d {src_ip} -j DROP'
        ],
        'anomaly_type': anomaly.get('type')
    }

def generate_rate_limit_rule(anomaly: Dict[str, Any]) -> Dict[str, Any]:
    """Generate rate limiting rule"""
    src_ip = anomaly.get('source_ip')
    
    return {
        'type': 'rate_limit',
        'priority': 'medium',
        'rule': f'rate-limit ip {src_ip}',
        'description': f'Rate limit connections from {src_ip}',
        'format': 'iptables',
        'commands': [
            f'iptables -A INPUT -s {src_ip} -m limit --limit 5/min --limit-burst 10 -j ACCEPT',
            f'iptables -A INPUT -s {src_ip} -j DROP'
        ],
        'anomaly_type': anomaly.get('type')
    }

def generate_account_lockout_rule(anomaly: Dict[str, Any]) -> Dict[str, Any]:
    """Generate account lockout rule"""
    username = anomaly.get('username')
    
    return {
        'type': 'account_lockout',
        'priority': 'high',
        'rule': f'lockout user {username}',
        'description': f'Temporarily lock account {username} due to suspicious activity',
        'format': 'system',
        'commands': [
            f'# Lock account: passwd -l {username}',
            f'# Or use Active Directory: Disable-ADAccount -Identity {username}'
        ],
        'anomaly_type': anomaly.get('type')
    }

def generate_mfa_requirement_rule(anomaly: Dict[str, Any]) -> Dict[str, Any]:
    """Generate MFA requirement rule"""
    username = anomaly.get('username')
    
    return {
        'type': 'mfa_requirement',
        'priority': 'medium',
        'rule': f'require mfa for user {username}',
        'description': f'Require multi-factor authentication for {username}',
        'format': 'policy',
        'commands': [
            f'# Enable MFA for user: {username}',
            f'# Configure in identity provider (Azure AD, Okta, etc.)'
        ],
        'anomaly_type': anomaly.get('type')
    }

def generate_network_segmentation_rule(anomaly: Dict[str, Any]) -> Dict[str, Any]:
    """Generate network segmentation rule"""
    src_ip = anomaly.get('source_ip')
    
    return {
        'type': 'network_segmentation',
        'priority': 'high',
        'rule': f'segment network for {src_ip}',
        'description': f'Isolate {src_ip} to prevent lateral movement',
        'format': 'network',
        'commands': [
            f'# Create isolated VLAN for compromised host',
            f'# Move {src_ip} to quarantine VLAN',
            f'iptables -A FORWARD -s {src_ip} -j DROP'
        ],
        'anomaly_type': anomaly.get('type')
    }

def generate_port_filtering_rule(anomaly: Dict[str, Any]) -> Dict[str, Any]:
    """Generate port filtering rule"""
    src_ip = anomaly.get('source_ip')
    ports = anomaly.get('ports_scanned', [])
    
    return {
        'type': 'port_filter',
        'priority': 'medium',
        'rule': f'filter ports for {src_ip}',
        'description': f'Block port scanning from {src_ip}',
        'format': 'iptables',
        'commands': [
            f'iptables -A INPUT -s {src_ip} -p tcp --dport {",".join(map(str, ports))} -j DROP'
        ],
        'anomaly_type': anomaly.get('type')
    }

def generate_time_based_access_rule(anomaly: Dict[str, Any]) -> Dict[str, Any]:
    """Generate time-based access rule"""
    return {
        'type': 'time_based_access',
        'priority': 'low',
        'rule': 'restrict access hours',
        'description': 'Restrict access to business hours only',
        'format': 'policy',
        'commands': [
            '# Configure time-based access control',
            '# Allow access only 8AM-6PM Monday-Friday'
        ],
        'anomaly_type': anomaly.get('type')
    }
