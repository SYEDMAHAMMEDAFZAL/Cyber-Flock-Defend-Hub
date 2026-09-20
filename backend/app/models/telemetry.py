import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.assets import CriticalityLevel

class DetectionStatus(str, enum.Enum):
    DETECTED = "DETECTED"
    INVESTIGATING = "INVESTIGATING"
    CONTAINED = "CONTAINED"
    RESOLVED = "RESOLVED"
    FALSE_POSITIVE = "FALSE_POSITIVE"

class SIEMEvent(Base):
    __tablename__ = "siem_events"

    id = Column(String(36), primary_key=True, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(String(36), ForeignKey("assets.id", ondelete="SET NULL"), nullable=True)
    event_type = Column(String(100), nullable=False) # Brute Force, Credential Stuffing, etc.
    severity = Column(Enum(CriticalityLevel), default=CriticalityLevel.HIGH)
    source_ip = Column(String(45), nullable=True)
    destination_ip = Column(String(45), nullable=True)
    destination_port = Column(Integer, default=443)
    user_identity = Column(String(100), default="admin_service")
    endpoint_name = Column(String(255), default="srv-prod-db-01")
    mitre_technique_id = Column(String(50), default="T1110") # e.g. T1110 Brute Force
    mitre_technique_name = Column(String(100), default="Brute Force")
    raw_log = Column(Text, nullable=True)
    detection_status = Column(Enum(DetectionStatus), default=DetectionStatus.DETECTED)
    risk_score = Column(Float, default=72.0)
    estimated_loss = Column(Float, default=350000.0)
    recommended_action = Column(Text, default="Enforce immediate account lockout and trigger MFA challenge.")
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    is_simulated = Column(Boolean, default=True)

    organization = relationship("Organization", back_populates="siem_events")
    asset = relationship("Asset", back_populates="siem_events")

class EDRAlert(Base):
    __tablename__ = "edr_alerts"

    id = Column(String(36), primary_key=True, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    endpoint_name = Column(String(255), nullable=False)
    process_name = Column(String(255), default="powershell.exe")
    process_path = Column(String(255), default="C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe")
    command_line = Column(Text, default="powershell.exe -enc SQBFAFgA...")
    parent_process = Column(String(255), default="cmd.exe")
    sha256_hash = Column(String(64), nullable=True)
    threat_name = Column(String(100), default="Suspicious Obfuscated PowerShell Execution")
    severity = Column(Enum(CriticalityLevel), default=CriticalityLevel.CRITICAL)
    mitre_technique_id = Column(String(50), default="T1059.001")
    is_blocked = Column(Boolean, default=True)
    detection_status = Column(Enum(DetectionStatus), default=DetectionStatus.DETECTED)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_simulated = Column(Boolean, default=True)

class PAMEvent(Base):
    __tablename__ = "pam_events"

    id = Column(String(36), primary_key=True, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    privileged_user = Column(String(100), default="root_dba")
    target_resource = Column(String(255), default="prod-postgres-primary.internal")
    session_id = Column(String(100), nullable=True)
    action_performed = Column(String(255), default="Privileged Session Started without Ticket Approval")
    severity = Column(Enum(CriticalityLevel), default=CriticalityLevel.HIGH)
    mitre_technique_id = Column(String(50), default="T1078.004")
    mfa_verified = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_simulated = Column(Boolean, default=True)
