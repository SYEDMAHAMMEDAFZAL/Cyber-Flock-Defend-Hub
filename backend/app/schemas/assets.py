from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.assets import CriticalityLevel, AssetType

class AssetBase(BaseModel):
    name: str
    asset_type: AssetType = AssetType.SERVER
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    hostname: Optional[str] = None
    criticality: CriticalityLevel = CriticalityLevel.HIGH
    financial_value: float = 1000000.0
    exposure_factor: float = 0.7
    is_internet_facing: bool = False
    location: str = "Primary Data Center"
    owner_department: str = "IT Infrastructure"
    status: str = "ACTIVE"

class AssetCreate(AssetBase):
    pass

class AssetResponse(AssetBase):
    id: str
    organization_id: str
    is_simulated: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EndpointResponse(BaseModel):
    id: str
    asset_id: str
    organization_id: str
    endpoint_name: str
    os_type: str
    ip_address: Optional[str] = None
    edr_agent_installed: bool
    edr_status: str
    last_seen: datetime
    is_isolated: bool
    is_simulated: bool

    class Config:
        from_attributes = True

class ApplicationResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    version: str
    app_type: str
    criticality: CriticalityLevel
    revenue_impact_per_hour: float
    is_internet_facing: bool
    tech_stack: str
    owner: str
    is_simulated: bool

    class Config:
        from_attributes = True
