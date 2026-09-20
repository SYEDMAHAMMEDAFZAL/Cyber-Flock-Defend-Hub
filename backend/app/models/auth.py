import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Enum, Text
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ORG_ADMIN = "ORG_ADMIN"
    CISO = "CISO"
    SECURITY_ANALYST = "SECURITY_ANALYST"
    RED_TEAM = "RED_TEAM"
    AUDITOR = "AUDITOR"
    IT_ADMIN = "IT_ADMIN"
    VIEWER = "VIEWER"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True) # None for Google OAuth
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER, nullable=False)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True)
    job_title = Column(String(100), default="Security Lead")
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_simulated = Column(Boolean, default=True)
    auth_provider = Column(String(50), default="local") # "local" or "google"

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    simulations = relationship("Simulation", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
