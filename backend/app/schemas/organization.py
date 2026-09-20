from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from app.models.organization import SubscriptionStatus, DemoRequestStatus

class OrganizationBase(BaseModel):
    name: str
    organization_type: str = "Enterprise"
    industry: str = "Technology"
    size: str = "500-1000"
    number_of_employees: int = 500
    number_of_endpoints: int = 1000
    annual_revenue: float = 50000000.0
    it_budget: float = 5000000.0
    cybersecurity_budget: float = 1500000.0
    critical_applications: str = "ERP, CRM, Cloud Infrastructure, Payment Gateway"
    cloud_provider: str = "AWS, Azure"
    existing_siem: str = "Splunk, Sentinel"
    existing_edr: str = "CrowdStrike Falcon"
    existing_pam: str = "CyberArk"
    compliance_requirements: str = "ISO 27001, SOC 2, DPDP Act 2023"

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: str
    is_onboarded: bool
    is_active: bool
    is_simulated: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PlanResponse(BaseModel):
    id: str
    name: str
    slug: str
    monthly_price: float
    annual_price: float
    currency: str
    max_endpoints: int
    max_users: int
    max_simulations_per_month: int
    vulnerability_monitoring: bool
    siem_monitoring: bool
    attack_simulation: bool
    risk_quantification: bool
    ale_enabled: bool
    var_enabled: bool
    monte_carlo_enabled: bool
    investment_optimization: bool
    audit_reports: bool
    blockchain_verification: bool
    api_access: bool
    advanced_reports: bool

    class Config:
        from_attributes = True

class PlanUpdate(BaseModel):
    monthly_price: Optional[float] = None
    annual_price: Optional[float] = None
    max_endpoints: Optional[int] = None
    max_users: Optional[int] = None
    max_simulations_per_month: Optional[int] = None
    monte_carlo_enabled: Optional[bool] = None
    investment_optimization: Optional[bool] = None
    blockchain_verification: Optional[bool] = None

class SubscriptionResponse(BaseModel):
    id: str
    organization_id: str
    plan_id: str
    status: SubscriptionStatus
    billing_cycle: str
    start_date: datetime
    end_date: Optional[datetime] = None
    current_simulations_used: int
    plan: Optional[PlanResponse] = None

    class Config:
        from_attributes = True

class DemoRequestCreate(BaseModel):
    name: str = "Prospective Executive"
    official_email: EmailStr
    organization: str = "Enterprise Organization"
    job_role: str = "Security Executive"
    phone: Optional[str] = None
    organization_size: Optional[str] = "500-1000"
    industry: Optional[str] = "Information Technology"
    number_of_endpoints: int = 250
    security_tools_currently_used: Optional[str] = None
    preferred_demo_date: Optional[str] = None
    preferred_demo_time: Optional[str] = None
    requirements_message: Optional[str] = None

class DemoRequestUpdate(BaseModel):
    status: DemoRequestStatus

class DemoRequestResponse(DemoRequestCreate):
    id: str
    status: DemoRequestStatus
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    email_dispatch_status: Optional[str] = None
    vip_passcode: Optional[str] = None
    meet_url: Optional[str] = None
    email_preview_html: Optional[str] = None

    class Config:
        from_attributes = True
