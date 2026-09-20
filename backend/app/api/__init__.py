from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.organizations import router as orgs_router
from app.api.onboarding import router as onboarding_router
from app.api.assets import router as assets_router
from app.api.vulnerabilities import router as vulns_router
from app.api.telemetry import router as telemetry_router
from app.api.simulations import router as simulations_router
from app.api.risk import router as risk_router
from app.api.investments import router as investments_router
from app.api.audit import router as audit_router
from app.api.market import router as market_router
from app.api.admin import router as admin_router
from app.api.demo import router as demo_router
from app.api.blockchain import router as blockchain_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(orgs_router, prefix="/organizations", tags=["Organizations & Subscriptions"])
api_router.include_router(onboarding_router, prefix="/onboarding", tags=["Onboarding"])
api_router.include_router(assets_router, prefix="/assets", tags=["Assets & Inventory"])
api_router.include_router(vulns_router, prefix="/vulnerabilities", tags=["Vulnerabilities & CVEs"])
api_router.include_router(telemetry_router, prefix="/telemetry", tags=["Telemetry & Alerts"])
api_router.include_router(simulations_router, prefix="/simulations", tags=["Attack Simulations"])
api_router.include_router(risk_router, prefix="/risk", tags=["Risk Quantification"])
api_router.include_router(investments_router, prefix="/investments", tags=["Investment Optimization"])
api_router.include_router(audit_router, prefix="/audit", tags=["Audit & Blockchain"])
api_router.include_router(market_router, prefix="/market", tags=["Market Benchmarks"])
api_router.include_router(admin_router, prefix="/admin", tags=["Super Admin"])
api_router.include_router(demo_router, prefix="/demo", tags=["Demo Requests"])
api_router.include_router(blockchain_router, prefix="/blockchain", tags=["Hyperledger Fabric"])

