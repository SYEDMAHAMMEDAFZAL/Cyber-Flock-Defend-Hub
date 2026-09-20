from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Float
from app.database import Base

class MarketData(Base):
    __tablename__ = "market_data"

    id = Column(String(36), primary_key=True, index=True)
    benchmark_name = Column(String(100), nullable=False)
    industry = Column(String(100), default="Financial Services")
    cost_per_endpoint_annual_inr = Column(Float, default=4500.0)
    avg_data_breach_loss_inr = Column(Float, default=175000000.0) # ~17.5 Cr INR
    avg_ransomware_payout_inr = Column(Float, default=85000000.0)
    security_budget_pct_of_it = Column(Float, default=12.5) # 12.5%
    avg_roi_cyber_investment = Column(Float, default=320.0) # 320%
    source_label = Column(String(100), default="DEMO DATA - Global CISO Benchmark 2026")
    is_simulated = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
