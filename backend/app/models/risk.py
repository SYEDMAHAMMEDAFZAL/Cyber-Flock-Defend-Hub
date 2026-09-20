from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class RiskResult(Base):
    __tablename__ = "risk_results"

    id = Column(String(36), primary_key=True, index=True)
    simulation_id = Column(String(36), ForeignKey("simulations.id", ondelete="CASCADE"), nullable=True, unique=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Financial Quantification
    risk_score = Column(Float, nullable=False) # 0 - 100
    single_loss_expectancy = Column(Float, nullable=False) # SLE
    annualized_rate_of_occurrence = Column(Float, nullable=False) # ARO
    annualized_loss_expectancy = Column(Float, nullable=False) # ALE
    
    # Value at Risk (VaR)
    var_90 = Column(Float, nullable=False)
    var_95 = Column(Float, nullable=False)
    var_99 = Column(Float, nullable=False)
    
    # Monte Carlo Metrics
    monte_carlo_mean_loss = Column(Float, nullable=False)
    monte_carlo_median_loss = Column(Float, nullable=False)
    p90_loss = Column(Float, nullable=False)
    p95_loss = Column(Float, nullable=False)
    p99_loss = Column(Float, nullable=False)
    
    # Breakdown of Business Losses
    revenue_loss = Column(Float, default=0.0)
    operational_loss = Column(Float, default=0.0)
    downtime_cost = Column(Float, default=0.0)
    incident_response_cost = Column(Float, default=0.0)
    recovery_cost = Column(Float, default=0.0)
    data_impact_cost = Column(Float, default=0.0)
    compliance_legal_cost = Column(Float, default=0.0)
    total_estimated_loss = Column(Float, nullable=False)
    
    # Cryptographic Hash & Verification
    sha256_hash = Column(String(64), nullable=True, index=True)
    is_anchored = Column(Boolean, default=False)
    blockchain_tx_hash = Column(String(66), nullable=True)
    
    currency = Column(String(10), default="INR")
    created_at = Column(DateTime, default=datetime.utcnow)
    is_simulated = Column(Boolean, default=True)

    organization = relationship("Organization", back_populates="risk_results")
    simulation = relationship("Simulation", back_populates="risk_result")
    loss_distribution = relationship("LossDistribution", back_populates="risk_result", uselist=False)

class LossDistribution(Base):
    __tablename__ = "loss_distributions"

    id = Column(String(36), primary_key=True, index=True)
    risk_result_id = Column(String(36), ForeignKey("risk_results.id", ondelete="CASCADE"), nullable=False, unique=True)
    bins_json = Column(Text, nullable=False) # JSON array of bin ranges
    frequencies_json = Column(Text, nullable=False) # JSON array of counts
    percentiles_json = Column(Text, nullable=False) # JSON map of percentiles
    created_at = Column(DateTime, default=datetime.utcnow)

    risk_result = relationship("RiskResult", back_populates="loss_distribution")

class InvestmentRecommendation(Base):
    __tablename__ = "investment_recommendations"

    id = Column(String(36), primary_key=True, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    allocated_budget = Column(Float, nullable=False)
    recommended_controls_json = Column(Text, nullable=False) # JSON array of control codes
    total_investment_required = Column(Float, nullable=False)
    risk_before = Column(Float, nullable=False)
    risk_after = Column(Float, nullable=False)
    risk_reduction_percent = Column(Float, nullable=False)
    ale_before = Column(Float, nullable=False)
    ale_after = Column(Float, nullable=False)
    estimated_roi_percent = Column(Float, nullable=False)
    solver_used = Column(String(50), default="OR-Tools / PuLP MILP")
    created_at = Column(DateTime, default=datetime.utcnow)
    is_simulated = Column(Boolean, default=True)
