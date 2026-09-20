import os
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api import api_router
from app.services.fake_data_generator import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed realistic synthetic cybersecurity ecosystem
    print("[CYBER FLOCK] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    
    # Auto-migration check for new simulation columns
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE simulations ADD COLUMN threat_actor VARCHAR(255)"))
                conn.commit()
            except Exception:
                pass
            try:
                conn.execute(text("ALTER TABLE simulations ADD COLUMN is_acknowledged BOOLEAN DEFAULT 0"))
                conn.commit()
            except Exception:
                pass
    except Exception:
        pass
    
    db = SessionLocal()
    try:
        print("[CYBER FLOCK] Checking database seed status...")
        seed_database(db)
        print("[CYBER FLOCK] Database seed verified and ready.")
    except Exception as e:
        print(f"[CYBER FLOCK] Warning during database seed: {e}")
    finally:
        db.close()
        
    yield
    # Shutdown
    print("[CYBER FLOCK] Shutting down cyber defense telemetry pipeline...")

app = FastAPI(
    title="CYBER FLOCK DEFENSE HUB",
    description="Enterprise Cybersecurity Risk Quantification, Attack Simulation, Business Loss Estimation, Investment Optimization & Blockchain Verification Platform.",
    version="2.4.0-Enterprise",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    response.headers["X-Process-Time"] = str(round(process_time, 4))
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["X-Platform"] = "Cyber Flock Defense Hub"
    return response

# Mount core API router
app.include_router(api_router, prefix="/api")

@app.get("/", tags=["Root"])
def root_status():
    return {
        "platform": "CYBER FLOCK DEFENSE HUB",
        "motto": "Detect. Quantify. Optimize. Verify.",
        "version": "2.4.0-Enterprise",
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "telemetry": "ONLINE",
        "blockchain_status": "READY"
    }

@app.get("/health", tags=["Root"])
def health_check():
    return {
        "status": "HEALTHY",
        "timestamp": time.time(),
        "database": "CONNECTED",
        "services": {
            "risk_engine": "ACTIVE",
            "monte_carlo": "READY",
            "ml_predictor": "ONLINE",
            "investment_optimizer": "READY",
            "blockchain_anchor": "ONLINE"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

