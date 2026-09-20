"""
Cyber Flock Defense Hub - Market Benchmark Service
Provides industry comparative metrics for cybersecurity investments, loss averages,
and budget allocations across BFSI, Healthcare, Tech, Manufacturing, and Retail.
All data is clearly tagged as simulated baseline intelligence.
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.market import MarketData

DEFAULT_BENCHMARKS = [
    {
        "benchmark_name": "BFSI Enterprise Baseline 2026",
        "industry": "BFSI",
        "cost_per_endpoint_annual_inr": 18500.0,
        "avg_data_breach_loss_inr": 48500000.0,
        "avg_ransomware_payout_inr": 22000000.0,
        "security_budget_pct_of_it": 14.5,
        "avg_roi_cyber_investment": 320.0,
        "source_label": "Global Financial Cyber Risk Index (SIMULATED DATA)",
        "is_simulated": True
    },
    {
        "benchmark_name": "Healthcare & Life Sciences Baseline",
        "industry": "Healthcare",
        "cost_per_endpoint_annual_inr": 14200.0,
        "avg_data_breach_loss_inr": 56000000.0,
        "avg_ransomware_payout_inr": 19500000.0,
        "security_budget_pct_of_it": 11.2,
        "avg_roi_cyber_investment": 290.0,
        "source_label": "Healthcare Breach Intelligence Forum (SIMULATED DATA)",
        "is_simulated": True
    },
    {
        "benchmark_name": "Technology & SaaS Cloud Baseline",
        "industry": "Technology",
        "cost_per_endpoint_annual_inr": 16800.0,
        "avg_data_breach_loss_inr": 41000000.0,
        "avg_ransomware_payout_inr": 18000000.0,
        "security_budget_pct_of_it": 15.8,
        "avg_roi_cyber_investment": 380.0,
        "source_label": "Cloud Security Alliance Enterprise Metrics (SIMULATED DATA)",
        "is_simulated": True
    },
    {
        "benchmark_name": "Manufacturing & ICS/SCADA Baseline",
        "industry": "Manufacturing",
        "cost_per_endpoint_annual_inr": 11500.0,
        "avg_data_breach_loss_inr": 37500000.0,
        "avg_ransomware_payout_inr": 26000000.0,
        "security_budget_pct_of_it": 8.5,
        "avg_roi_cyber_investment": 240.0,
        "source_label": "Industrial Cybersecurity Report (SIMULATED DATA)",
        "is_simulated": True
    },
    {
        "benchmark_name": "Retail & E-Commerce Baseline",
        "industry": "Retail",
        "cost_per_endpoint_annual_inr": 12800.0,
        "avg_data_breach_loss_inr": 32000000.0,
        "avg_ransomware_payout_inr": 14000000.0,
        "security_budget_pct_of_it": 9.8,
        "avg_roi_cyber_investment": 275.0,
        "source_label": "Retail Cyber Defense Alliance (SIMULATED DATA)",
        "is_simulated": True
    }
]

def get_benchmarks(db: Session) -> List[Dict[str, Any]]:
    """Fetches market benchmarks from DB, falling back to defaults if empty."""
    records = db.query(MarketData).all()
    if not records:
        return DEFAULT_BENCHMARKS
    return [
        {
            "id": r.id,
            "benchmark_name": r.benchmark_name,
            "industry": r.industry,
            "cost_per_endpoint_annual_inr": r.cost_per_endpoint_annual_inr,
            "avg_data_breach_loss_inr": r.avg_data_breach_loss_inr,
            "avg_ransomware_payout_inr": r.avg_ransomware_payout_inr,
            "security_budget_pct_of_it": r.security_budget_pct_of_it,
            "avg_roi_cyber_investment": r.avg_roi_cyber_investment,
            "source_label": r.source_label,
            "is_simulated": r.is_simulated,
            "updated_at": r.updated_at
        }
        for r in records
    ]

def compare_organization_to_benchmark(org_industry: str, org_ale: float, org_security_budget: float, org_it_budget: float, db: Session) -> Dict[str, Any]:
    """Generates comparative gap analysis between an organization and peer industry peers."""
    benchmarks = get_benchmarks(db)
    matched = next((b for b in benchmarks if b["industry"].lower() == org_industry.lower()), benchmarks[0])
    
    org_budget_pct = round((org_security_budget / max(1.0, org_it_budget)) * 100.0, 1)
    budget_variance = round(org_budget_pct - matched["security_budget_pct_of_it"], 1)
    ale_variance_pct = round(((org_ale - matched["avg_data_breach_loss_inr"]) / matched["avg_data_breach_loss_inr"]) * 100.0, 1)
    
    return {
        "industry": matched["industry"],
        "benchmark_source": matched["source_label"],
        "peer_avg_loss_inr": matched["avg_data_breach_loss_inr"],
        "org_ale_inr": org_ale,
        "loss_gap_percent": ale_variance_pct,
        "peer_security_budget_pct": matched["security_budget_pct_of_it"],
        "org_security_budget_pct": org_budget_pct,
        "budget_gap_percent": budget_variance,
        "recommendation": (
            "Cybersecurity budget is below industry average for this sector. Expanding preventative controls is strongly advised."
            if budget_variance < 0 else
            "Security budget allocation matches or exceeds industry peer percentile."
        ),
        "is_simulated": True
    }

