import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.assets import CriticalityLevel

class VulnStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    REMEDIATED = "REMEDIATED"
    RISK_ACCEPTED = "RISK_ACCEPTED"

class CVE(Base):
    __tablename__ = "cves"

    id = Column(String(50), primary_key=True, index=True) # e.g. CVE-2024-3094
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    cvss_score = Column(Float, nullable=False) # 0.0 - 10.0
    cvss_vector = Column(String(100), nullable=True)
    epss_score = Column(Float, default=0.15) # Exploit Prediction Scoring System 0.0 - 1.0
    epss_percentile = Column(Float, default=0.85)
    cisa_kev = Column(Boolean, default=False) # Known Exploited Vulnerabilities catalog
    mitre_attack_id = Column(String(50), default="T1190") # e.g. T1190 Exploit Public-Facing Application
    published_date = Column(DateTime, default=datetime.utcnow)
    patch_available = Column(Boolean, default=True)
    is_simulated = Column(Boolean, default=True)

    vulnerabilities = relationship("Vulnerability", back_populates="cve_record")

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"

    id = Column(String(36), primary_key=True, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(String(36), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    cve_id = Column(String(50), ForeignKey("cves.id"), nullable=False)
    application_name = Column(String(255), default="Nginx Reverse Proxy")
    severity = Column(Enum(CriticalityLevel), default=CriticalityLevel.HIGH)
    cvss_score = Column(Float, default=8.8)
    epss_score = Column(Float, default=0.45)
    is_exploitable = Column(Boolean, default=True)
    is_internet_facing = Column(Boolean, default=False)
    risk_score = Column(Float, default=78.5) # 0 - 100
    estimated_loss = Column(Float, default=750000.0) # Currency amount
    recommended_action = Column(Text, default="Apply vendor patch v2.4.2 immediately and restrict external port access.")
    status = Column(Enum(VulnStatus), default=VulnStatus.OPEN)
    first_detected = Column(DateTime, default=datetime.utcnow)
    remediated_at = Column(DateTime, nullable=True)
    is_simulated = Column(Boolean, default=True)

    asset = relationship("Asset", back_populates="vulnerabilities")
    cve_record = relationship("CVE", back_populates="vulnerabilities")
    simulations = relationship("Simulation", back_populates="vulnerability")
