from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class RiskResultResponse(BaseModel):
    id: str
    simulation_id: Optional[str] = None
    organization_id: str
    risk_score: float
    single_loss_expectancy: float
    annualized_rate_of_occurrence: float
    annualized_loss_expectancy: float
    var_90: float
    var_95: float
    var_99: float
    monte_carlo_mean_loss: float
    monte_carlo_median_loss: float
    p90_loss: float
    p95_loss: float
    p99_loss: float
    revenue_loss: float
    operational_loss: float
    downtime_cost: float
    incident_response_cost: float
    recovery_cost: float
    data_impact_cost: float
    compliance_legal_cost: float
    total_estimated_loss: float
    sha256_hash: Optional[str] = None
    is_anchored: bool
    blockchain_tx_hash: Optional[str] = None
    currency: str
    created_at: datetime
    is_simulated: bool

    class Config:
        from_attributes = True

class LossDistributionResponse(BaseModel):
    id: str
    risk_result_id: str
    bins: List[float]
    frequencies: List[int]
    percentiles: Dict[str, float]

class InvestmentOptimizationRequest(BaseModel):
    allocated_budget: Optional[float] = 10000000.0 # Total budget in INR
    budget: Optional[float] = None
    risk_tolerance: Optional[str] = "MEDIUM" # LOW, MEDIUM, HIGH
    target_ale_reduction: Optional[float] = 50.0

class InvestmentOptimizationResponse(BaseModel):
    allocated_budget: float
    recommended_controls: List[Dict[str, Any]]
    deferred_controls: Optional[List[Dict[str, Any]]] = []
    selected_controls: Optional[List[Dict[str, Any]]] = []
    rejected_controls: Optional[List[Dict[str, Any]]] = []
    total_investment_required: float
    total_cost: Optional[float] = None
    risk_before: float
    risk_after: float
    risk_reduction_percent: float
    ale_before: float
    ale_after: float
    net_ale_reduction: Optional[float] = None
    estimated_roi_percent: float
    roi_percentage: Optional[float] = None
    solver_used: str
    is_simulated: bool
