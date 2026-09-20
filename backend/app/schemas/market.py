from datetime import datetime
from pydantic import BaseModel

class MarketBenchmarkResponse(BaseModel):
    id: str
    benchmark_name: str
    industry: str
    cost_per_endpoint_annual_inr: float
    avg_data_breach_loss_inr: float
    avg_ransomware_payout_inr: float
    security_budget_pct_of_it: float
    avg_roi_cyber_investment: float
    source_label: str
    is_simulated: bool
    updated_at: datetime

    class Config:
        from_attributes = True
