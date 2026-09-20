from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.models.assets import CriticalityLevel
from app.models.vulnerabilities import VulnStatus

class CVEResponse(BaseModel):
    id: str
    title: str
    description: str
    cvss_score: float
    cvss_vector: Optional[str] = None
    epss_score: float
    epss_percentile: float
    cisa_kev: bool
    mitre_attack_id: str
    published_date: datetime
    patch_available: bool

    class Config:
        from_attributes = True

class VulnerabilityResponse(BaseModel):
    id: str
    organization_id: str
    asset_id: str
    cve_id: str
    application_name: str
    severity: CriticalityLevel
    cvss_score: float
    epss_score: float
    is_exploitable: bool
    is_internet_facing: bool
    risk_score: float
    estimated_loss: float
    recommended_action: str
    status: VulnStatus
    first_detected: datetime
    remediated_at: Optional[datetime] = None
    is_simulated: bool
    cve_record: Optional[CVEResponse] = None
    asset_name: Optional[str] = None

    class Config:
        from_attributes = True

class VulnerabilityCreate(BaseModel):
    asset_id: str
    cve_id: str
    application_name: str = "Nginx Reverse Proxy"
    severity: CriticalityLevel = CriticalityLevel.HIGH
    cvss_score: float = 7.5
    epss_score: float = 0.35
    is_exploitable: bool = True
    is_internet_facing: bool = False
    recommended_action: str = "Apply security patch"
