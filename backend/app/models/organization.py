import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    TRIAL = "TRIAL"
    PAST_DUE = "PAST_DUE"
    CANCELED = "CANCELED"

class DemoRequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    REVIEWING = "REVIEWING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    organization_type = Column(String(100), default="Enterprise")
    industry = Column(String(100), default="Technology")
    size = Column(String(50), default="500-1000")
    number_of_employees = Column(Integer, default=500)
    number_of_endpoints = Column(Integer, default=1000)
    annual_revenue = Column(Float, default=50000000.0) # in USD or INR equivalent
    it_budget = Column(Float, default=5000000.0)
    cybersecurity_budget = Column(Float, default=1500000.0)
    critical_applications = Column(Text, default="ERP, CRM, Cloud Infrastructure, Payment Gateway")
    cloud_provider = Column(String(100), default="AWS, Azure")
    existing_siem = Column(String(100), default="Splunk, Sentinel")
    existing_edr = Column(String(100), default="CrowdStrike Falcon")
    existing_pam = Column(String(100), default="CyberArk")
    compliance_requirements = Column(String(255), default="ISO 27001, SOC 2, DPDP Act 2023")
    is_onboarded = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    is_simulated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="organization", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="organization", uselist=False)
    simulations = relationship("Simulation", back_populates="organization")
    siem_events = relationship("SIEMEvent", back_populates="organization")
    risk_results = relationship("RiskResult", back_populates="organization")

class Plan(Base):
    __tablename__ = "plans"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True) # Essential, Professional, Enterprise
    slug = Column(String(50), nullable=False, unique=True)
    monthly_price = Column(Float, nullable=False)
    annual_price = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    max_endpoints = Column(Integer, default=500)
    max_users = Column(Integer, default=5)
    max_simulations_per_month = Column(Integer, default=20)
    vulnerability_monitoring = Column(Boolean, default=True)
    siem_monitoring = Column(Boolean, default=True)
    attack_simulation = Column(Boolean, default=True)
    risk_quantification = Column(Boolean, default=True)
    ale_enabled = Column(Boolean, default=True)
    var_enabled = Column(Boolean, default=True)
    monte_carlo_enabled = Column(Boolean, default=False)
    investment_optimization = Column(Boolean, default=False)
    audit_reports = Column(Boolean, default=True)
    blockchain_verification = Column(Boolean, default=False)
    api_access = Column(Boolean, default=False)
    advanced_reports = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    subscriptions = relationship("Subscription", back_populates="plan")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), unique=True)
    plan_id = Column(String(36), ForeignKey("plans.id"))
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    billing_cycle = Column(String(20), default="annual") # monthly or annual
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    current_simulations_used = Column(Integer, default=0)

    organization = relationship("Organization", back_populates="subscription")
    plan = relationship("Plan", back_populates="subscriptions")

class DemoRequest(Base):
    __tablename__ = "demo_requests"

    id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    official_email = Column(String(255), nullable=False, index=True)
    organization = Column(String(255), nullable=False)
    job_role = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=True)
    organization_size = Column(String(50), nullable=False)
    industry = Column(String(100), nullable=False)
    number_of_endpoints = Column(Integer, default=250)
    security_tools_currently_used = Column(String(255), nullable=True)
    preferred_demo_date = Column(String(50), nullable=True)
    preferred_demo_time = Column(String(50), nullable=True)
    requirements_message = Column(Text, nullable=True)
    status = Column(Enum(DemoRequestStatus), default=DemoRequestStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(String(255), nullable=True)
