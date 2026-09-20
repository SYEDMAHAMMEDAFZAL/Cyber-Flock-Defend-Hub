from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class AuditReport(Base):
    __tablename__ = "audit_reports"

    id = Column(String(36), primary_key=True, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    report_title = Column(String(255), nullable=False)
    assessment_id = Column(String(50), nullable=False)
    summary_markdown = Column(Text, nullable=False)
    sha256_hash = Column(String(64), nullable=False)
    blockchain_tx_hash = Column(String(66), nullable=True)
    verification_status = Column(String(50), default="VERIFIED")
    file_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_simulated = Column(Boolean, default=True)

class HashRecord(Base):
    __tablename__ = "hash_records"

    id = Column(String(36), primary_key=True, index=True)
    result_id = Column(String(50), nullable=False, unique=True, index=True)
    organization_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=True)
    sha256_hash = Column(String(64), nullable=False, index=True)
    canonical_json = Column(Text, nullable=False)
    algorithm = Column(String(20), default="SHA-256")
    data_version = Column(String(10), default="1.0")
    created_at = Column(DateTime, default=datetime.utcnow)

class BlockchainAnchor(Base):
    __tablename__ = "blockchain_anchors"

    id = Column(String(36), primary_key=True, index=True)
    hash_record_id = Column(String(36), ForeignKey("hash_records.id", ondelete="CASCADE"), nullable=False)
    sha256_hash = Column(String(64), nullable=False, index=True)
    network = Column(String(50), default="Hardhat Localhost (ChainID: 31337)")
    contract_address = Column(String(42), nullable=False)
    transaction_hash = Column(String(66), nullable=False, unique=True)
    block_number = Column(Integer, default=1)
    status = Column(String(20), default="ANCHORED") # PENDING, ANCHORED, VERIFIED, FAILED
    anchored_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="HIGH") # CRITICAL, HIGH, MEDIUM, LOW, INFO
    target_role = Column(String(50), default="CISO") # CISO, RED_TEAM, SECURITY_ANALYST, ALL
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, index=True)
    organization_id = Column(String(36), nullable=True, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    ip_address = Column(String(45), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")
