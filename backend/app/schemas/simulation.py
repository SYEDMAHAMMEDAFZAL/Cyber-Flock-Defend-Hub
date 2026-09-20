from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.simulation import SimulationStatus

class AttackTechniqueResponse(BaseModel):
    id: str
    name: str
    tactic: str
    description: Optional[str] = None
    difficulty: str

    class Config:
        from_attributes = True

class AttackPathResponse(BaseModel):
    id: str
    name: str
    stages: str
    initial_access_technique: str
    lateral_movement_technique: str
    impact_technique: str
    overall_probability: float
    description: Optional[str] = None

    class Config:
        from_attributes = True

class SecurityControlResponse(BaseModel):
    id: str
    name: str
    code: str
    category: str
    cost_inr: float
    risk_reduction_percent: float
    effectiveness_score: float
    coverage_percent: float
    implementation_time_days: int
    description: Optional[str] = None

    class Config:
        from_attributes = True

class SimulationCreate(BaseModel):
    organization_id: Optional[str] = None
    simulation_name: Optional[str] = "Synthetic Attack Simulation"
    name: Optional[str] = None
    asset_id: Optional[str] = None
    vulnerability_id: Optional[str] = None
    cve_id: Optional[str] = None
    technique_id: Optional[str] = "T1190"
    attack_path_id: Optional[str] = None
    selected_control_codes: List[str] = []
    active_controls: List[str] = []
    scenario_type: Optional[str] = None
    target_asset_type: Optional[str] = None
    threat_actor: Optional[str] = None
    iterations: int = 10000

class SimulationResponse(BaseModel):
    id: str
    organization_id: str
    simulation_name: str
    asset_id: str
    vulnerability_id: Optional[str] = None
    technique_id: str
    threat_actor: Optional[str] = None
    is_acknowledged: Optional[bool] = False
    attack_path_id: Optional[str] = None
    selected_control_codes: str
    iterations: int
    status: SimulationStatus
    created_at: datetime
    completed_at: datetime
    is_simulated: bool

    class Config:
        from_attributes = True
