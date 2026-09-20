import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from app.database import Base

class SimulationStatus(str, enum.Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class AttackTechnique(Base):
    __tablename__ = "attack_techniques"

    id = Column(String(50), primary_key=True) # MITRE ID e.g. T1190, T1078
    name = Column(String(255), nullable=False)
    tactic = Column(String(100), nullable=False) # Initial Access, Execution, etc.
    description = Column(Text, nullable=True)
    difficulty = Column(String(50), default="Medium")
    is_simulated = Column(Boolean, default=True)

class AttackPath(Base):
    __tablename__ = "attack_paths"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    stages = Column(Text, nullable=False) # JSON array of step descriptions
    initial_access_technique = Column(String(50), default="T1190")
    lateral_movement_technique = Column(String(50), default="T1021")
    impact_technique = Column(String(50), default="T1486") # Ransomware
    overall_probability = Column(Float, default=0.65)
    description = Column(Text, nullable=True)
    is_simulated = Column(Boolean, default=True)

class SecurityControl(Base):
    __tablename__ = "security_controls"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True) # EDR, MFA, PAM, WAF, etc.
    code = Column(String(50), nullable=False, unique=True)
    category = Column(String(100), default="Preventative")
    cost_inr = Column(Float, nullable=False) # Annual Cost in INR
    risk_reduction_percent = Column(Float, nullable=False) # e.g. 25.0%
    effectiveness_score = Column(Float, default=0.85) # 0.0 - 1.0
    coverage_percent = Column(Float, default=90.0) # 0.0 - 100.0%
    implementation_time_days = Column(Integer, default=30)
    description = Column(Text, nullable=True)
    is_simulated = Column(Boolean, default=True)

class AttackScenario(Base):
    __tablename__ = "attack_scenarios"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    threat_actor_type = Column(String(100), default="Ransomware Syndicate / Advanced Persistent Threat")
    target_asset_type = Column(String(100), default="DATABASE")
    attack_path_id = Column(String(36), ForeignKey("attack_paths.id"), nullable=True)
    estimated_success_rate = Column(Float, default=0.45)
    description = Column(Text, nullable=True)
    is_simulated = Column(Boolean, default=True)

class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(String(36), primary_key=True, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    simulation_name = Column(String(255), nullable=False)
    asset_id = Column(String(36), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    vulnerability_id = Column(String(36), ForeignKey("vulnerabilities.id", ondelete="CASCADE"), nullable=True)
    technique_id = Column(String(50), nullable=False)
    attack_path_id = Column(String(36), ForeignKey("attack_paths.id"), nullable=True)
    selected_control_codes = Column(Text, default="[]") # JSON list of codes e.g. ["EDR", "MFA"]
    iterations = Column(Integer, default=10000)
    status = Column(Enum(SimulationStatus), default=SimulationStatus.COMPLETED)
    threat_actor = Column(String(255), nullable=True)
    is_acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, default=datetime.utcnow)
    is_simulated = Column(Boolean, default=True)

    organization = relationship("Organization", back_populates="simulations")
    user = relationship("User", back_populates="simulations")
    asset = relationship("Asset", back_populates="simulations")
    vulnerability = relationship("Vulnerability", back_populates="simulations")
    risk_result = relationship("RiskResult", back_populates="simulation", uselist=False)
