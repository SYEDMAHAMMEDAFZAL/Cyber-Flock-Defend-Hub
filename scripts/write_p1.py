import os

target = r"backend\app\services\fake_data_generator.py"

p1 = """import uuid
import random
import json
import hashlib
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import (
    Organization, Plan, Subscription, User, UserRole,
    Asset, Endpoint, Application, CriticalityLevel, AssetType,
    Vulnerability, CVE, VulnStatus,
    SIEMEvent, EDRAlert, PAMEvent, DetectionStatus,
    AttackTechnique, AttackPath, SecurityControl, AttackScenario,
    Simulation, SimulationStatus, RiskResult, LossDistribution,
    InvestmentRecommendation, HashRecord, BlockchainAnchor, MarketData
)
from app.security.jwt import get_password_hash

def seed_database(db: Session, force: bool = False):
    existing_orgs = db.query(Organization).count()
    if existing_orgs >= 10 and not force:
        print("Database already seeded with synthetic data. Skipping.")
        return

    print("Initiating full synthetic cybersecurity data generation...")

    # 1. Plans
    plans_data = [
        {
            "name": "Essential", "slug": "essential",
            "monthly_price": 49999.0, "annual_price": 499990.0, "currency": "INR",
            "max_endpoints": 500, "max_users": 5, "max_simulations_per_month": 25,
            "vulnerability_monitoring": True, "siem_monitoring": True, "attack_simulation": True,
            "risk_quantification": True, "ale_enabled": True, "var_enabled": True,
            "monte_carlo_enabled": False, "investment_optimization": False,
            "audit_reports": True, "blockchain_verification": False,
            "api_access": False, "advanced_reports": False
        },
        {
            "name": "Professional", "slug": "professional",
            "monthly_price": 149999.0, "annual_price": 1499990.0, "currency": "INR",
            "max_endpoints": 2500, "max_users": 20, "max_simulations_per_month": 100,
            "vulnerability_monitoring": True, "siem_monitoring": True, "attack_simulation": True,
            "risk_quantification": True, "ale_enabled": True, "var_enabled": True,
            "monte_carlo_enabled": True, "investment_optimization": True,
            "audit_reports": True, "blockchain_verification": True,
            "api_access": True, "advanced_reports": True
        },
        {
            "name": "Enterprise Defense", "slug": "enterprise",
            "monthly_price": 349999.0, "annual_price": 3499990.0, "currency": "INR",
            "max_endpoints": 15000, "max_users": 100, "max_simulations_per_month": 500,
            "vulnerability_monitoring": True, "siem_monitoring": True, "attack_simulation": True,
            "risk_quantification": True, "ale_enabled": True, "var_enabled": True,
            "monte_carlo_enabled": True, "investment_optimization": True,
            "audit_reports": True, "blockchain_verification": True,
            "api_access": True, "advanced_reports": True
        }
    ]

    plan_objects = []
    for pd in plans_data:
        existing = db.query(Plan).filter(Plan.slug == pd["slug"]).first()
        if not existing:
            p = Plan(id=str(uuid.uuid4()), **pd)
            db.add(p)
            plan_objects.append(p)
        else:
            plan_objects.append(existing)
    db.commit()

    # 2. Super Admin User
    admin_user = db.query(User).filter(User.email == "admin@cyberflock.defense").first()
    if not admin_user:
        admin_user = User(
            id=str(uuid.uuid4()),
            email="admin@cyberflock.defense",
            full_name="Global Super Administrator",
            hashed_password=get_password_hash("AdminSecurePassword123!"),
            role=UserRole.SUPER_ADMIN,
            organization_id=None,
            is_active=True,
            is_verified=True,
            auth_provider="local"
        )
        db.add(admin_user)
        db.commit()

    # 3. 10 Organizations
    org_configs = [
        ("Bharat Financial Core Bank", "Banking & Financial Services", "1000-5000", 3500, 4200, 450000000.0, 45000000.0, 12500000.0, "Core Banking, SWIFT API, NetBanking, Treasury", "AWS / Azure Hybrid", "Splunk ES", "CrowdStrike Falcon Complete", "CyberArk Privilege Cloud"),
        ("Deccan Cloud Infrastructure Ltd", "Cloud & Datacenter Hosting", "500-1000", 850, 2100, 180000000.0, 22000000.0, 6800000.0, "Kubernetes Control Plane, OpenStack, Ceph Storage", "AWS & GCP Multi-Cloud", "Microsoft Sentinel", "Microsoft Defender for Endpoint", "HashiCorp Vault Enterprise"),
        ("ZenHealth Diagnostics & Life Sciences", "Healthcare & Pharma", "1000-5000", 2400, 3100, 290000000.0, 25000000.0, 7500000.0, "EMR HealthCloud, PACS Imaging, Genomic Data Warehouse", "Azure Cloud", "IBM QRadar", "SentinelOne Singularity", "BeyondTrust PAM"),
        ("Indus Defense Systems & Avionics", "Aerospace & Defense", "500-1000", 920, 1450, 320000000.0, 38000000.0, 14000000.0, "CAD Vault, Flight Telemetry Server, SCADA Controller", "On-Premise Private Air-Gapped", "Elastic SIEM", "Trellix EDR", "Thycotic Secret Server"),
        ("Tata Smart Automotive Robotics", "Manufacturing & IoT", "5000+", 8400, 11200, 950000000.0, 75000000.0, 18000000.0, "MES Production Floor, SAP S/4HANA, Supply Chain EDI", "AWS Industrial IoT", "Splunk Cloud", "Carbon Black Cloud", "CyberArk Enterprise"),
        ("CyberShield Payments Gateway", "Fintech & UPI Switch", "100-500", 320, 890, 85000000.0, 14000000.0, 5200000.0, "NPCI UPI Switch, Merchant Settlement API, Card Tokenizer", "AWS Mumbai (ap-south-1)", "Datadog Security", "Wiz & SentinelOne", "Teleport Access"),
        ("Mumbai Gateway Container Terminal", "Logistics & Maritime", "500-1000", 780, 1200, 140000000.0, 12000000.0, 3900000.0, "TOS Terminal Operating System, Customs EDI, RFID Gate", "Oracle Cloud Infrastructure", "LogRhythm", "Trend Micro Apex One", "Wallix PAM"),
        ("Nova Retail Omnichannel Commerce", "E-Commerce & Retail", "1000-5000", 1900, 3400, 260000000.0, 28000000.0, 8100000.0, "Magento Enterprise, Order Fulfillment, POS Terminals", "GCP & Cloudflare", "Sumo Logic", "CrowdStrike Falcon", "Okta PAM"),
        ("Apex Power Transmission Grid", "Energy & Critical Utilities", "1000-5000", 1400, 2800, 510000000.0, 48000000.0, 16500000.0, "SCADA Master Station, Energy Management EMS, Substation RTU", "Hybrid Private Cloud", "Micro Focus ArcSight", "Fortinet FortiEDR", "CyberArk Core PAS"),
        ("Pegasus Satellite Comms & Telecom", "Telecommunications", "5000+", 6200, 9800, 780000000.0, 65000000.0, 19500000.0, "5G Core AMF/UPF, OSS/BSS Billing, Satellite Ground Station", "AWS & Telco Edge", "QRadar SIEM", "Palo Alto Cortex XDR", "BeyondTrust")
    ]

    org_objects = []
    for idx, (name, ind, sz, emp, endp, rev, it_b, cyb_b, crit_apps, c_prov, siem, edr, pam) in enumerate(org_configs):
        existing = db.query(Organization).filter(Organization.name == name).first()
        if not existing:
            org = Organization(
                id=f"ORG-{idx+1:03d}",
                name=name,
                industry=ind,
                size=sz,
                number_of_employees=emp,
                number_of_endpoints=endp,
                annual_revenue=rev,
                it_budget=it_b,
                cybersecurity_budget=cyb_b,
                critical_applications=crit_apps,
                cloud_provider=c_prov,
                existing_siem=siem,
                existing_edr=edr,
                existing_pam=pam,
                compliance_requirements="ISO 27001, SOC 2 Type II, RBI Cyber Framework, DPDP Act 2023",
                is_onboarded=True,
                is_active=True,
                is_simulated=True
            )
            db.add(org)
            org_objects.append(org)
            
            sub = Subscription(
                id=str(uuid.uuid4()),
                organization_id=org.id,
                plan_id=plan_objects[min(idx % 3, len(plan_objects)-1)].id,
                billing_cycle="annual",
                start_date=datetime.utcnow() - timedelta(days=90),
                current_simulations_used=random.randint(5, 45)
            )
            db.add(sub)
        else:
            org_objects.append(existing)
    db.commit()

    # 4. Users (50 users)
    roles_pool = [UserRole.ORG_ADMIN, UserRole.CISO, UserRole.SECURITY_ANALYST, UserRole.RED_TEAM, UserRole.VIEWER]
    first_names = ["Arjun", "Priya", "Vikram", "Sneha", "Rohan", "Ananya", "Dev", "Kavita", "Siddharth", "Meera", "Kabir", "Neha", "Aditya", "Pooja", "Rahul", "Nisha", "Sameer", "Tanvi", "Gaurav", "Simran"]
    last_names = ["Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Deshmukh", "Choudhury", "Bose", "Kulkarni", "Menon", "Kapoor", "Rao", "Gupta", "Saxena", "Mehta", "Malhotra", "Joshi", "Bhat", "Das"]

    for i in range(50):
        org = org_objects[i % len(org_objects)]
        fn = first_names[i % len(first_names)]
        ln = last_names[(i * 3) % len(last_names)]
        role = UserRole.CISO if i < 10 else roles_pool[i % len(roles_pool)]
        email = f"{fn.lower()}.{ln.lower()}{i+1}@{org.name.split()[0].lower()}.com"
        
        if not db.query(User).filter(User.email == email).first():
            u = User(
                id=str(uuid.uuid4()),
                email=email,
                full_name=f"{fn} {ln}",
                hashed_password=get_password_hash("Password123!"),
                role=role,
                organization_id=org.id,
                is_active=True,
                is_verified=True,
                auth_provider="local",
                last_login=datetime.utcnow() - timedelta(hours=random.randint(1, 72))
            )
            db.add(u)
    db.commit()
"""

with open(target, "w", encoding="utf-8") as f:
    f.write(p1)
print(f"Wrote part 1 ({len(p1)} bytes)")
