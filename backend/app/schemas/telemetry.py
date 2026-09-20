from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.assets import CriticalityLevel
from app.models.telemetry import DetectionStatus

class SIEMEventCreate(BaseModel):
    event_type: str
    severity: CriticalityLevel = CriticalityLevel.HIGH
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    destination_port: int = 443
    user_identity: str = "admin_service"
    endpoint_name: str = "srv-prod-db-01"
    mitre_technique_id: str = "T1110"
    mitre_technique_name: str = "Brute Force"
    raw_log: Optional[str] = None
    asset_id: Optional[str] = None
    detection_status: Optional[DetectionStatus] = DetectionStatus.DETECTED
    risk_score: float = 75.0
    estimated_loss: float = 250000.0
    recommended_action: str = "Investigate anomalous event"

class EDRAlertCreate(BaseModel):
    endpoint_name: str
    process_name: str
    process_path: str
    command_line: str
    parent_process: str
    sha256_hash: Optional[str] = None
    threat_name: str
    severity: CriticalityLevel = CriticalityLevel.HIGH
    mitre_technique_id: str = "T1059"
    is_blocked: bool = True
    detection_status: Optional[DetectionStatus] = DetectionStatus.CONTAINED

class PAMEventCreate(BaseModel):
    privileged_user: str
    target_resource: str
    session_id: Optional[str] = None
    action_performed: str
    severity: CriticalityLevel = CriticalityLevel.HIGH
    mitre_technique_id: str = "T1078"
    mfa_verified: bool = True


class SIEMEventResponse(BaseModel):
    id: str
    organization_id: str
    asset_id: Optional[str] = None
    event_type: str
    severity: CriticalityLevel
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    destination_port: int
    user_identity: str
    endpoint_name: str
    mitre_technique_id: str
    mitre_technique_name: str
    raw_log: Optional[str] = None
    detection_status: DetectionStatus
    risk_score: float
    estimated_loss: float
    recommended_action: str
    timestamp: datetime
    is_simulated: bool

    class Config:
        from_attributes = True

class EDRAlertResponse(BaseModel):
    id: str
    organization_id: str
    endpoint_name: str
    process_name: str
    process_path: str
    command_line: str
    parent_process: str
    sha256_hash: Optional[str] = None
    threat_name: str
    severity: CriticalityLevel
    mitre_technique_id: str
    is_blocked: bool
    detection_status: DetectionStatus
    timestamp: datetime
    is_simulated: bool

    class Config:
        from_attributes = True

class PAMEventResponse(BaseModel):
    id: str
    organization_id: str
    privileged_user: str
    target_resource: str
    session_id: Optional[str] = None
    action_performed: str
    severity: CriticalityLevel
    mitre_technique_id: str
    mfa_verified: bool
    timestamp: datetime
    is_simulated: bool

    class Config:
        from_attributes = True
