import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from app.database import Base

class CriticalityLevel(str, enum.Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class AssetType(str, enum.Enum):
    DATABASE = "DATABASE"
    SERVER = "SERVER"
    CLOUD_RESOURCE = "CLOUD_RESOURCE"
    NETWORK_DEVICE = "NETWORK_DEVICE"
    APPLICATION = "APPLICATION"
    WORKSTATION = "WORKSTATION"
    DOMAIN_CONTROLLER = "DOMAIN_CONTROLLER"
    PAYMENT_GATEWAY = "PAYMENT_GATEWAY"

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String(36), primary_key=True, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    asset_type = Column(Enum(AssetType), default=AssetType.SERVER)
    ip_address = Column(String(45), nullable=True)
    mac_address = Column(String(50), nullable=True)
    hostname = Column(String(255), nullable=True)
    criticality = Column(Enum(CriticalityLevel), default=CriticalityLevel.HIGH)
    financial_value = Column(Float, default=1000000.0) # Financial value in INR / USD
    exposure_factor = Column(Float, default=0.7) # Percentage vulnerable to single loss (0.0 - 1.0)
    is_internet_facing = Column(Boolean, default=False)
    location = Column(String(100), default="Primary Data Center / AWS us-east-1")
    owner_department = Column(String(100), default="IT Infrastructure")
    status = Column(String(50), default="ACTIVE")
    is_simulated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="assets")
    endpoints = relationship("Endpoint", back_populates="asset", cascade="all, delete-orphan")
    vulnerabilities = relationship("Vulnerability", back_populates="asset", cascade="all, delete-orphan")
    siem_events = relationship("SIEMEvent", back_populates="asset")
    simulations = relationship("Simulation", back_populates="asset")

class Endpoint(Base):
    __tablename__ = "endpoints"

    id = Column(String(36), primary_key=True, index=True)
    asset_id = Column(String(36), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    endpoint_name = Column(String(255), nullable=False)
    os_type = Column(String(100), default="Ubuntu 22.04 LTS")
    ip_address = Column(String(45), nullable=True)
    edr_agent_installed = Column(Boolean, default=True)
    edr_status = Column(String(50), default="ONLINE")
    last_seen = Column(DateTime, default=datetime.utcnow)
    is_isolated = Column(Boolean, default=False)
    is_simulated = Column(Boolean, default=True)

    asset = relationship("Asset", back_populates="endpoints")

class Application(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    version = Column(String(50), default="2.4.1")
    app_type = Column(String(100), default="Web Application")
    criticality = Column(Enum(CriticalityLevel), default=CriticalityLevel.CRITICAL)
    revenue_impact_per_hour = Column(Float, default=50000.0)
    is_internet_facing = Column(Boolean, default=True)
    tech_stack = Column(String(255), default="Node.js, React, PostgreSQL")
    owner = Column(String(100), default="DevOps / Product")
    is_simulated = Column(Boolean, default=True)
