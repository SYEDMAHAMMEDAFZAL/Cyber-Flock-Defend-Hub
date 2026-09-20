import uuid
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
    InvestmentRecommendation, HashRecord, BlockchainAnchor, MarketData, AuditReport
)
from app.models.organization import SubscriptionStatus
from app.security.jwt import get_password_hash

def seed_database(db: Session, force: bool = False):
    if db.query(Organization).count() >= 10 and not force:
        print("Database already seeded. Skipping.")
        return

    print("Generating simulated cybersecurity ecosystem...")

    # 1. Subscription Plans (Affordable B2B Tiers strictly below ₹1 Lakh)
    plans = [
        ("Essential", "essential", 1999.0, 19990.0, 500, 5, 25, False, False, False),
        ("Professional", "professional", 4999.0, 49990.0, 2500, 20, 100, True, True, True),
        ("Enterprise Defense", "enterprise", 8999.0, 89990.0, 15000, 100, 500, True, True, True)
    ]
    p_objs = []
    for name, slug, mp, ap, me, mu, ms, mc, io, bv in plans:
        existing = db.query(Plan).filter(Plan.slug == slug).first()
        if not existing:
            p = Plan(
                id=str(uuid.uuid4()),
                name=name,
                slug=slug,
                monthly_price=mp,
                annual_price=ap,
                currency="INR",
                max_endpoints=me,
                max_users=mu,
                max_simulations_per_month=ms,
                vulnerability_monitoring=True,
                siem_monitoring=True,
                attack_simulation=True,
                risk_quantification=True,
                ale_enabled=True,
                var_enabled=True,
                monte_carlo_enabled=mc,
                investment_optimization=io,
                audit_reports=True,
                blockchain_verification=bv,
                api_access=True,
                advanced_reports=True
            )
            db.add(p)
            p_objs.append(p)
        else:
            p_objs.append(existing)
    db.commit()

    # 2. 20 Organizations across diverse industries
    org_templates = [
        ("Indus Delta Financial", "BFSI", "5000+", 6200, 8500, 950000000.0, 85000000.0, 24000000.0, "Core Banking, Treasury, SWIFT", "AWS, On-Premise DC", "Splunk Enterprise ES", "CrowdStrike Falcon", "CyberArk Vault", "RBI, ISO 27001, PCI-DSS 4.0"),
        ("Aethelgard Health Systems", "Healthcare", "1000-5000", 3100, 4200, 420000000.0, 38000000.0, 9500000.0, "EHR Portal, PACS Imaging", "Azure Health Cloud", "Microsoft Sentinel", "Microsoft Defender", "BeyondTrust", "HIPAA, ISO 27799"),
        ("Nexis Cloud Infrastructure", "Technology", "500-1000", 850, 1900, 280000000.0, 45000000.0, 16000000.0, "Kubernetes Platform, Billing Engine", "AWS, GCP Multi-Cloud", "Datadog Cloud SIEM", "SentinelOne", "HashiCorp Vault", "SOC 2 Type II, ISO 27001"),
        ("Vanguard Grid & Utilities", "Critical Infrastructure", "5000+", 7800, 12000, 1200000000.0, 110000000.0, 32000000.0, "SCADA Master, Substation Telemetry", "Private Sovereign Cloud", "IBM QRadar", "Trellix EDR", "CyberArk", "NCIIPC Guidelines"),
        ("Zenith Logistics & Maritime", "Transportation", "1000-5000", 2400, 3600, 350000000.0, 28000000.0, 7200000.0, "Fleet Tracking ERP, Customs", "AWS Cloud", "Elastic SIEM", "Sophos Intercept X", "Wallix", "ISO 27001, NIS2 Directive"),
        ("Cobalt Defense & Aerospace", "Defense", "500-1000", 920, 1600, 520000000.0, 55000000.0, 22000000.0, "CAD Vault, Avionics Simulation", "Isolated Air-Gapped Cloud", "Splunk GovCloud", "CrowdStrike Falcon", "CyberArk Gov", "NIST SP 800-171"),
        ("Kavach Payment Technologies", "FinTech", "100-500", 350, 850, 180000000.0, 25000000.0, 8500000.0, "UPI Switch, Merchant API", "AWS Mumbai (ap-south-1)", "Sumo Logic", "Wiz + SentinelOne", "Teleport", "PCI-DSS 4.0"),
        ("Bharat Biotech Therapeutics", "Pharmaceuticals", "1000-5000", 1850, 2900, 480000000.0, 40000000.0, 11000000.0, "LIMS Lab System, Clinical Trial Data", "Azure Cloud", "Microsoft Sentinel", "Trend Micro Apex One", "ManageEngine PAM", "FDA 21 CFR Part 11"),
        ("OmniRetail Global Commerce", "Retail", "5000+", 8900, 9800, 880000000.0, 72000000.0, 18500000.0, "POS In-Store Network, Web", "GCP + Azure Hybrid", "Google Chronicle", "CrowdStrike Falcon", "Thycotic PAM", "PCI-DSS, CCPA"),
        ("Apex Auto Robotics", "Manufacturing", "1000-5000", 2200, 3100, 310000000.0, 24000000.0, 6800000.0, "PLC Line Controllers, MRP", "AWS IoT Core + Edge", "AlienVault USM", "Carbon Black EDR", "CyberArk", "ISA/IEC 62443"),
        ("Tata Cyber Systems", "IT Services", "10000+", 12000, 15000, 2500000000.0, 250000000.0, 85000000.0, "Global SOC, Code Repositories", "Multi-Cloud", "Splunk Enterprise", "CrowdStrike", "CyberArk", "ISO 27001, SOC 2"),
        ("Reliance Digital Commerce", "Retail", "5000+", 11000, 13000, 3200000000.0, 300000000.0, 95000000.0, "E-commerce Platform, Payment Gateway", "AWS + Azure", "Microsoft Sentinel", "SentinelOne", "BeyondTrust", "PCI-DSS 4.0"),
        ("Mahindra Aerospace Defense", "Defense", "1000-5000", 4500, 6000, 850000000.0, 95000000.0, 32000000.0, "Defense Design Vault, SCADA", "On-Premise Air-Gapped", "IBM QRadar", "Trellix EDR", "CyberArk Gov", "NIST SP 800-171"),
        ("HDFC Horizon Banking", "BFSI", "5000+", 9500, 12000, 1800000000.0, 180000000.0, 65000000.0, "Core Banking, Mobile APIs", "AWS + On-Prem", "Google Chronicle", "CrowdStrike", "CyberArk Vault", "RBI, ISO 27001"),
        ("Infosys Cloud Networks", "Technology", "10000+", 18000, 22000, 2200000000.0, 210000000.0, 72000000.0, "SaaS Delivery, HRIS, CRM", "Azure", "Datadog Cloud SIEM", "Microsoft Defender", "HashiCorp Vault", "GDPR, SOC 2 Type II"),
        ("Adani Green Grid", "Critical Infrastructure", "5000+", 6200, 8500, 1500000000.0, 140000000.0, 45000000.0, "Smart Grid SCADA, Billing", "Private Sovereign Cloud", "Splunk", "Trellix EDR", "Thycotic PAM", "NCIIPC Guidelines"),
        ("Wipro Cyber X", "IT Services", "10000+", 14000, 16000, 1900000000.0, 195000000.0, 68000000.0, "Managed SOC, Identity Provider", "GCP", "Elastic SIEM", "SentinelOne", "Teleport", "ISO 27001"),
        ("L&T Metro Infra", "Transportation", "1000-5000", 3800, 5000, 650000000.0, 55000000.0, 18000000.0, "Signaling Network, Ticketing", "AWS", "AlienVault USM", "Sophos Intercept X", "Wallix", "ISO 27001"),
        ("Cipla Bio Sciences", "Pharmaceuticals", "1000-5000", 4200, 5500, 950000000.0, 85000000.0, 28000000.0, "R&D Vault, Trial Databases", "Azure Health Cloud", "Microsoft Sentinel", "Trend Micro", "ManageEngine", "FDA 21 CFR Part 11"),
        ("Zomato Edge Delivery", "FoodTech", "1000-5000", 3500, 4500, 750000000.0, 65000000.0, 22000000.0, "Order APIs, Driver Tracking", "AWS Mumbai", "Sumo Logic", "Wiz + SentinelOne", "CyberArk", "DPDP Act 2023, PCI-DSS")
    ]
    org_objs = []
    for name, ind, size, emp, endp, rev, it_b, sec_b, apps, cld, siem, edr, pam, comp in org_templates:
        existing_org = db.query(Organization).filter(Organization.name == name).first()
        if not existing_org:
            org = Organization(
                id=str(uuid.uuid4()), name=name, organization_type="Enterprise", industry=ind,
                size=size, number_of_employees=emp, number_of_endpoints=endp, annual_revenue=rev,
                it_budget=it_b, cybersecurity_budget=sec_b, critical_applications=apps,
                cloud_provider=cld, existing_siem=siem, existing_edr=edr, existing_pam=pam,
                compliance_requirements=comp, is_onboarded=True, is_active=True, is_simulated=True
            )
            db.add(org)
            org_objs.append(org)
        else:
            org_objs.append(existing_org)
    db.commit()

    # 3. Subscriptions
    for idx, org in enumerate(org_objs):
        if not db.query(Subscription).filter(Subscription.organization_id == org.id).first():
            plan_pick = p_objs[2] if idx < 5 else (p_objs[1] if idx < 8 else p_objs[0])
            sub = Subscription(
                id=str(uuid.uuid4()),
                organization_id=org.id,
                plan_id=plan_pick.id,
                status=SubscriptionStatus.ACTIVE,
                billing_cycle="ANNUAL",
                start_date=datetime.utcnow() - timedelta(days=random.randint(30, 300)),
                current_simulations_used=random.randint(5, 45)
            )
            db.add(sub)
    db.commit()

    # 4. Users (50 users including super admin)
    roles = [UserRole.CISO, UserRole.SECURITY_ANALYST, UserRole.RED_TEAM, UserRole.AUDITOR, UserRole.IT_ADMIN]
    hashed_pass = get_password_hash("AdminSecurePassword123!")
    user_objs = []

    # Core platform demo accounts scoped to distinct enterprises
    demo_accounts = [
        ("admin@cyberflock.defense", "Cyber Flock Global Admin", UserRole.SUPER_ADMIN, "AdminSecurePassword123!", org_objs[0].id),
        ("analyst@cyberflock.defense", "Sarah Jenkins (Lead Analyst)", UserRole.SECURITY_ANALYST, "AnalystSecurePassword123!", org_objs[0].id),
        ("analyst.sarah@cyberflock.defense", "Sarah Jenkins (Analyst)", UserRole.SECURITY_ANALYST, "AnalystSecurePassword123!", org_objs[0].id),
        ("executive@cyberflock.defense", "Elena Rostova (CISO)", UserRole.CISO, "ExecutiveSecurePassword123!", org_objs[1].id),
        ("ciso.elena@cyberflock.defense", "Elena Rostova (CISO)", UserRole.CISO, "ExecutiveSecurePassword123!", org_objs[1].id),
        ("auditor@cyberflock.defense", "S. Md. Afzal (CEO & Lead Assurance Officer)", UserRole.AUDITOR, "AuditorSecurePassword123!", org_objs[2].id)
    ]
    for d_email, d_name, d_role, d_pass, d_org_id in demo_accounts:
        existing_u = db.query(User).filter(User.email == d_email).first()
        if not existing_u:
            u_demo = User(
                id=str(uuid.uuid4()), email=d_email, full_name=d_name,
                hashed_password=get_password_hash(d_pass), role=d_role, organization_id=d_org_id,
                job_title=d_role.value.replace('_', ' ').title(), is_active=True, is_verified=True, is_simulated=False
            )
            db.add(u_demo)
            user_objs.append(u_demo)
        else:
            existing_u.organization_id = d_org_id
            existing_u.full_name = d_name
            db.add(existing_u)
            user_objs.append(existing_u)

    # 5 users per organization
    first_names = ["Vikram", "Ananya", "Rohan", "Sneha", "Arjun", "Pooja", "Rajesh", "Kavita", "Siddharth", "Meera", "Aditya", "Neha", "Tarun", "Divya", "Karan"]
    last_names = ["Sharma", "Verma", "Patel", "Nair", "Rao", "Reddy", "Menon", "Deshmukh", "Chopra", "Mehta", "Iyer", "Banerjee", "Kapoor", "Bhat"]
    
    for org_idx, org in enumerate(org_objs):
        domain = org.name.lower().replace(" ", "").replace("&", "")[:12] + ".com"
        for u_i in range(5):
            role_choice = roles[u_i % len(roles)]
            fn = first_names[(org_idx * 5 + u_i) % len(first_names)]
            ln = last_names[(org_idx * 5 + u_i) % len(last_names)]
            email = f"{fn.lower()}.{ln.lower()}@{domain}"
            if not db.query(User).filter(User.email == email).first():
                u = User(
                    id=str(uuid.uuid4()), email=email, full_name=f"{fn} {ln}",
                    hashed_password=hashed_pass, role=role_choice, organization_id=org.id,
                    job_title=f"{role_choice.value.replace('_', ' ').title()} - Cyber Defense",
                    is_active=True, is_verified=True, is_simulated=True
                )
                db.add(u)
                user_objs.append(u)
    db.commit()

    # 5. Security Controls (20)
    controls = [
        ("Next-Gen Endpoint Detection & Response", "EDR", "Endpoint", 1850000.0, 32.0, 0.92, 95.0, 21),
        ("Zero Trust Multi-Factor Authentication", "MFA", "Identity", 650000.0, 24.0, 0.90, 99.0, 14),
        ("Privileged Access Management", "PAM", "Identity", 2400000.0, 28.0, 0.88, 85.0, 45),
        ("Web Application & API Protection", "WAF", "Network", 1450000.0, 19.0, 0.85, 90.0, 20),
        ("Cloud SIEM & Automated SOAR", "SIEM", "Operations", 3200000.0, 26.0, 0.89, 92.0, 60),
        ("Micro-segmentation & Zero Trust Network", "NET_SEG", "Network", 2800000.0, 22.0, 0.86, 80.0, 90),
        ("Immutable Air-Gapped Cloud Backups", "BACKUP", "Data Protection", 2100000.0, 30.0, 0.95, 98.0, 30),
        ("AI Email Threat Defense & DMARC", "EMAIL_SEC", "Application", 750000.0, 16.0, 0.87, 99.0, 10),
        ("Risk-Based Vulnerability Management", "VULN_MGMT", "Operations", 1200000.0, 20.0, 0.84, 94.0, 30),
        ("Zero Trust Network Access (ZTNA)", "ZTNA", "Network", 1950000.0, 21.0, 0.88, 88.0, 40),
        ("24/7 Managed SOC & Threat Hunting", "SOC_247", "Operations", 4500000.0, 34.0, 0.93, 96.0, 15),
        ("Host Configuration Hardening CIS L2", "HARDENING", "Endpoint", 400000.0, 12.0, 0.78, 92.0, 25),
        ("Data Loss Prevention & Tokenization", "DLP", "Data Protection", 1600000.0, 15.0, 0.82, 85.0, 45),
        ("Cloud Security Posture Management", "CSPM", "Cloud", 1350000.0, 18.0, 0.86, 95.0, 20),
        ("Database Activity Monitoring (DAM)", "DAM", "Data Protection", 1750000.0, 17.0, 0.84, 88.0, 35),
        ("Deception Canary Tokens & Lures", "DECEPTION", "Operations", 950000.0, 14.0, 0.80, 75.0, 20),
        ("Software Supply Chain SBOM Gatekeeper", "SBOM", "Application", 850000.0, 13.0, 0.81, 90.0, 30),
        ("External Attack Surface Management", "EASM", "Network", 1100000.0, 15.0, 0.83, 95.0, 15),
        ("Protective DNS Threat Filter Feed", "DNS_SEC", "Network", 550000.0, 11.0, 0.79, 99.0, 7),
        ("Emergency Incident Response Retainer", "IR_RETAINER", "Operations", 2500000.0, 20.0, 0.90, 100.0, 1)
    ]
    for cname, code_c, cat, cost, red, eff, cov, td in controls:
        if not db.query(SecurityControl).filter(SecurityControl.code == code_c).first():
            db.add(SecurityControl(
                id=str(uuid.uuid4()), name=cname, code=code_c, category=cat, cost_inr=cost,
                risk_reduction_percent=red, effectiveness_score=eff, coverage_percent=cov,
                implementation_time_days=td, is_simulated=True
            ))
    db.commit()

    # 6. Attack Techniques (12) & Paths (5)
    techniques = [
        ("T1190", "Exploit Public-Facing Application", "Initial Access"),
        ("T1078", "Valid Accounts & Credential Abuse", "Defense Evasion"),
        ("T1059", "Command and Scripting Interpreter", "Execution"),
        ("T1068", "Exploitation for Privilege Escalation", "Privilege Escalation"),
        ("T1021", "Remote Services (RDP, SSH, SMB)", "Lateral Movement"),
        ("T1003", "OS Credential Memory Extraction", "Credential Access"),
        ("T1082", "System Information Discovery", "Discovery"),
        ("T1110", "Brute Force & Password Spraying", "Credential Access"),
        ("T1486", "Data Encrypted for Impact", "Impact"),
        ("T1048", "Exfiltration Over Alternative Protocol", "Exfiltration"),
        ("T1562", "Impair Defensive Monitoring", "Defense Evasion"),
        ("T1071", "Application Layer Protocol C2", "Command and Control")
    ]
    for tid, tname, tac in techniques:
        if not db.query(AttackTechnique).filter(AttackTechnique.id == tid).first():
            db.add(AttackTechnique(id=tid, name=tname, tactic=tac, difficulty="Medium", is_simulated=True))
    db.commit()

    paths_data = [
        ("Simulated Multi-Stage Edge Impact Chain", "T1190", "T1021", "T1486", 0.72),
        ("Database Exfiltration via Credential Abuse", "T1110", "T1021", "T1048", 0.61),
        ("Privilege Escalation to Superuser UID 0", "T1190", "T1068", "T1562", 0.54),
        ("Supply Chain Code Tampering on Payment API", "T1190", "T1059", "T1048", 0.48),
        ("Critical Substation Control Disruption", "T1078", "T1021", "T1486", 0.39)
    ]
    path_objs = []
    for pname, iat, lmt, imp, prob in paths_data:
        p = db.query(AttackPath).filter(AttackPath.name == pname).first()
        if not p:
            stages = json.dumps([f"Phase 1: Initial Access via {iat}", f"Phase 2: Pivot via {lmt}", f"Phase 3: Impact via {imp}"])
            p = AttackPath(id=str(uuid.uuid4()), name=pname, stages=stages, initial_access_technique=iat, lateral_movement_technique=lmt, impact_technique=imp, overall_probability=prob, is_simulated=True)
            db.add(p)
        path_objs.append(p)
    db.commit()

    # 7. CVE Records (15)
    cves = [
        ("CVE-2024-3094", "Upstream Library Flaw in OpenSSH", 10.0, 0.94, True, "T1190"),
        ("CVE-2024-21413", "Outlook Moniker Link Remote Code Execution", 9.8, 0.88, True, "T1059"),
        ("CVE-2024-1709", "ScreenConnect Authentication Bypass", 10.0, 0.92, True, "T1190"),
        ("CVE-2024-6387", "OpenSSH Signal Handler Race Condition", 8.1, 0.62, False, "T1190"),
        ("CVE-2024-21762", "SSL-VPN Gateway Memory Corruption", 9.6, 0.89, True, "T1190"),
        ("CVE-2023-4863", "WebP Heap Buffer Overflow Codec Flaw", 8.8, 0.79, True, "T1190"),
        ("CVE-2023-38606", "Kernel Hardware Register Manipulation", 7.8, 0.45, True, "T1068"),
        ("CVE-2023-34362", "MOVEit Transfer Pre-Auth SQL Injection", 9.8, 0.96, True, "T1190"),
        ("CVE-2021-44228", "Apache Log4j2 JNDI Injection (Log4Shell)", 10.0, 0.98, True, "T1190"),
        ("CVE-2023-22515", "Confluence Broken Access Control", 9.8, 0.91, True, "T1190"),
        ("CVE-2024-27198", "JetBrains TeamCity Auth Bypass", 9.8, 0.85, True, "T1190"),
        ("CVE-2023-46805", "Ivanti Connect Secure Auth Bypass", 8.2, 0.90, True, "T1190"),
        ("CVE-2023-27997", "FortiOS SSL-VPN Heap Buffer Overflow", 9.8, 0.86, True, "T1190"),
        ("CVE-2023-20198", "Cisco IOS XE Web UI Privilege Escalation", 10.0, 0.93, True, "T1078"),
        ("CVE-2024-40766", "SonicOS Improper Access Control Flaw", 9.3, 0.82, True, "T1190"),
        ("CVE-2024-21887", "Ivanti Connect Secure Command Injection & SSRF", 9.1, 0.94, True, "T1190"),
        ("CVE-2024-23897", "Jenkins CLI Arbitrary File Read & Stored Injection", 9.8, 0.87, True, "T1059"),
        ("CVE-2024-28986", "SolarWinds Web Help Desk Java Deserialization RCE", 9.8, 0.95, True, "T1190")
    ]
    cve_objs = []
    for cid, ctit, cvss, epss, kev, mit in cves:
        c = db.query(CVE).filter(CVE.id == cid).first()
        if not c:
            c = CVE(id=cid, title=ctit, description=f"Synthetic security vulnerability definition for {cid}.", cvss_score=cvss, epss_score=epss, epss_percentile=0.92, cisa_kev=kev, mitre_attack_id=mit, patch_available=True, is_simulated=True)
            db.add(c)
        cve_objs.append(c)
    db.commit()

    # 8. 100 Assets, 200 Endpoints, 100 Applications scaled for realistic B2B thousands
    asset_types = [
        (AssetType.DATABASE, "Core Database Cluster", 75000.0, 0.85, False),
        (AssetType.SERVER, "Web Reverse Proxy Node", 28000.0, 0.65, True),
        (AssetType.DOMAIN_CONTROLLER, "Active Directory DC", 65000.0, 0.90, False),
        (AssetType.PAYMENT_GATEWAY, "PCI-DSS Payment Switch", 95000.0, 0.95, True),
        (AssetType.CLOUD_RESOURCE, "Kubernetes API Cluster", 55000.0, 0.75, True),
        (AssetType.APPLICATION, "Customer Banking Web Portal", 68000.0, 0.80, True),
        (AssetType.NETWORK_DEVICE, "Edge Firewall & VPN Gateway", 42000.0, 0.70, True),
        (AssetType.WORKSTATION, "CISO Admin Jump Station", 18000.0, 0.50, False)
    ]
    all_assets, all_endpoints, all_apps = [], [], []
    for org in org_objs:
        for a_i in range(10):
            atype, base_name, val, exp, is_ext = asset_types[a_i % len(asset_types)]
            crit = CriticalityLevel.CRITICAL if val >= 55000.0 else CriticalityLevel.HIGH
            ast = Asset(
                id=str(uuid.uuid4()), organization_id=org.id, name=f"{org.name.split()[0]}-{base_name}-{a_i+1:02d}",
                asset_type=atype, ip_address=f"10.{random.randint(10,80)}.{random.randint(1,254)}.{random.randint(2,250)}",
                hostname=f"{atype.value.lower()}-{a_i + 1}.internal.{org.name.split()[0].lower()}.net",
                criticality=crit, financial_value=val * random.uniform(0.85, 1.25), exposure_factor=exp,
                is_internet_facing=is_ext, location=f"DataCenter-Zone-{a_i%3 + 1}", status="ACTIVE", is_simulated=True
            )
            db.add(ast)
            all_assets.append(ast)
            for ep_i in range(2):
                ep = Endpoint(
                    id=str(uuid.uuid4()), asset_id=ast.id, organization_id=org.id,
                    endpoint_name=f"ep-{ast.name}-node-{ep_i + 1}", os_type="Ubuntu 22.04 LTS" if ep_i==0 else "Windows Server 2022",
                    ip_address=f"192.168.{random.randint(1,100)}.{random.randint(2,254)}",
                    edr_agent_installed=True, edr_status="ONLINE", is_simulated=True
                )
                db.add(ep)
                all_endpoints.append(ep)
        for app_i in range(10):
            app = Application(
                id=str(uuid.uuid4()), organization_id=org.id, name=f"App-{org.name.split()[0]}-{app_i + 1}",
                version=f"{app_i + 1}.0", criticality=CriticalityLevel.CRITICAL if app_i<4 else CriticalityLevel.HIGH,
                revenue_impact_per_hour=random.uniform(25000.0, 200000.0), is_internet_facing=(app_i%2==0),
                tech_stack="Python FastAPI, React, PostgreSQL", owner="DevSecOps", is_simulated=True
            )
            db.add(app)
            all_apps.append(app)
    db.commit()

    # 9. 320 Vulnerabilities
    all_vulns = []
    for i in range(320):
        org = org_objs[i % len(org_objs)]
        asset = all_assets[i % len(all_assets)]
        cve = cve_objs[i % len(cve_objs)]
        cf = 1.25 if asset.criticality == CriticalityLevel.CRITICAL else 1.0
        r_score = min(100.0, round((cve.cvss_score * 7.5 + cve.epss_score * 25.0) * cf, 1))
        e_loss = round(asset.financial_value * asset.exposure_factor * (cve.cvss_score / 10.0) * 0.35, 2)
        v = Vulnerability(
            id=str(uuid.uuid4()), organization_id=org.id, asset_id=asset.id, cve_id=cve.id,
            application_name=f"Service-{asset.name.split('-')[1]}",
            severity=CriticalityLevel.CRITICAL if cve.cvss_score >= 9.0 else CriticalityLevel.HIGH,
            cvss_score=cve.cvss_score, epss_score=cve.epss_score, is_exploitable=True,
            is_internet_facing=asset.is_internet_facing, risk_score=r_score, estimated_loss=e_loss,
            recommended_action=f"Apply vendor patch for {cve.id}. Restrict network access to port 443/22.",
            status=VulnStatus.OPEN if (i % 4 != 0) else VulnStatus.REMEDIATED,
            first_detected=datetime.utcnow() - timedelta(days=random.randint(1, 30)), is_simulated=True
        )
        db.add(v)
        all_vulns.append(v)
    db.commit()

    # 10. 520 SIEM Events, 210 EDR Alerts, 110 PAM Events
    siem_types = [
        ("Brute Force Authentication Spike", "T1110", "Brute Force", CriticalityLevel.HIGH),
        ("Suspicious Script Execution", "T1059.001", "Interpreter", CriticalityLevel.CRITICAL),
        ("Impossible Travel Geo-Velocity Anomaly", "T1078", "Valid Accounts", CriticalityLevel.HIGH),
        ("Privileged Account Added to High Role", "T1078.002", "Domain Accounts", CriticalityLevel.CRITICAL),
        ("Simulated Lateral Movement via Network Protocol", "T1021.002", "Admin Protocol", CriticalityLevel.HIGH),
        ("Simulated Encryption Impact Activity", "T1486", "Data Encrypted", CriticalityLevel.CRITICAL),
        ("Anomalous Outbound Data Transfer", "T1048", "Exfiltration", CriticalityLevel.CRITICAL),
        ("Internal Port Scan Reconnaissance", "T1046", "Discovery", CriticalityLevel.MEDIUM),
        ("Credential Stuffing Detected on Gateway", "T1110.004", "Credential Stuffing", CriticalityLevel.HIGH),
        ("SQL Injection Signature Blocked by WAF", "T1190", "Public Facing App", CriticalityLevel.MEDIUM)
    ]
    for s_i in range(520):
        org = org_objs[s_i % len(org_objs)]
        asset = all_assets[s_i % len(all_assets)]
        et, tid, tn, sev = siem_types[s_i % len(siem_types)]
        db.add(SIEMEvent(
            id=str(uuid.uuid4()), organization_id=org.id, asset_id=asset.id, event_type=et,
            severity=sev, source_ip=f"{random.randint(45,195)}.{random.randint(10,240)}.{random.randint(1,250)}.{random.randint(2,250)}",
            destination_ip=asset.ip_address, destination_port=random.choice([443, 22, 3389, 5432]),
            user_identity=f"svc_admin_{s_i%10}", endpoint_name=f"node-{asset.name}",
            mitre_technique_id=tid, mitre_technique_name=tn,
            detection_status=DetectionStatus.DETECTED if s_i % 3 != 0 else DetectionStatus.INVESTIGATING,
            risk_score=random.uniform(70.0, 95.0) if sev == CriticalityLevel.CRITICAL else random.uniform(45.0, 75.0),
            estimated_loss=round(asset.financial_value * 0.04 * random.uniform(0.5, 2.0), 2),
            recommended_action=f"Enforce automated containment and verify identity credentials for {et}.",
            timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 168)), is_simulated=True
        ))
    for e_i in range(210):
        org = org_objs[e_i % len(org_objs)]
        ep = all_endpoints[e_i % len(all_endpoints)]
        db.add(EDRAlert(
            id=str(uuid.uuid4()), organization_id=org.id, endpoint_name=ep.endpoint_name,
            process_name="worker_agent.exe", process_path="C:\\System\\worker_agent.exe",
            command_line=f"worker_agent.exe --exec-job id={uuid.uuid4().hex[:12]}",
            parent_process="services.exe", sha256_hash=uuid.uuid4().hex + uuid.uuid4().hex,
            threat_name="Suspicious Encrypted Worker Activity",
            severity=CriticalityLevel.CRITICAL if e_i % 2 == 0 else CriticalityLevel.HIGH,
            mitre_technique_id="T1059.001", is_blocked=True,
            detection_status=DetectionStatus.CONTAINED if e_i % 2 == 0 else DetectionStatus.DETECTED,
            timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 96)), is_simulated=True
        ))
    for p_i in range(110):
        org = org_objs[p_i % len(org_objs)]
        db.add(PAMEvent(
            id=str(uuid.uuid4()), organization_id=org.id, privileged_user=f"admin_svc_{p_i%5}",
            target_resource=f"prod-vault-{p_i%8}.internal", session_id=f"PAM-{uuid.uuid4().hex[:8].upper()}",
            action_performed="Privileged root session started without linked incident ticket",
            severity=CriticalityLevel.CRITICAL if p_i % 3 == 0 else CriticalityLevel.HIGH,
            mitre_technique_id="T1078.004", mfa_verified=(p_i % 2 == 0),
            timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 120)), is_simulated=True
        ))
    db.commit()

    # 11. 100 Simulations, Risk Results, Distributions & SHA-256 Hashes
    for r_i in range(100):
        org = org_objs[r_i % len(org_objs)]
        asset = all_assets[r_i % len(all_assets)]
        vuln = all_vulns[r_i % len(all_vulns)]
        path = path_objs[r_i % len(path_objs)]
        sim_id = str(uuid.uuid4())
        db.add(Simulation(
            id=sim_id, organization_id=org.id, simulation_name=f"Threat Simulation - {asset.name}",
            asset_id=asset.id, vulnerability_id=vuln.id, technique_id=path.initial_access_technique,
            attack_path_id=path.id, selected_control_codes=json.dumps(["EDR", "MFA", "WAF", "BACKUP"]),
            iterations=10000, status=SimulationStatus.COMPLETED, is_simulated=True
        ))
        sle = asset.financial_value * asset.exposure_factor
        aro = round(random.uniform(0.2, 1.4), 2)
        ale = round(sle * aro, 2)
        mc_mean = round(ale * random.uniform(0.88, 1.12), 2)
        mc_med = round(mc_mean * 0.88, 2)
        p90 = round(mc_mean * 1.65, 2)
        p95 = round(mc_mean * 2.10, 2)
        p99 = round(mc_mean * 3.35, 2)
        rev_l, op_l, down_c = round(mc_mean*0.35, 2), round(mc_mean*0.25, 2), round(mc_mean*0.15, 2)
        ir_c, rec_c, dat_c, comp_c = round(mc_mean*0.10, 2), round(mc_mean*0.08, 2), round(mc_mean*0.04, 2), round(mc_mean*0.03, 2)
        tot_l = rev_l + op_l + down_c + ir_c + rec_c + dat_c + comp_c

        c_dict = {
            "result_id": sim_id, "organization_id": org.id, "asset_id": asset.id,
            "risk_score": round(vuln.risk_score, 1), "ale": ale, "var_95": p95,
            "total_estimated_loss": tot_l, "timestamp": datetime.utcnow().isoformat(),
            "algorithm": "SHA-256", "is_simulated": True
        }
        c_str = json.dumps(c_dict, sort_keys=True)
        sha = hashlib.sha256(c_str.encode("utf-8")).hexdigest()
        anchored = (r_i % 2 == 0)
        tx_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex}" if anchored else None

        rr = RiskResult(
            id=str(uuid.uuid4()), simulation_id=sim_id, organization_id=org.id,
            risk_score=vuln.risk_score, single_loss_expectancy=sle, annualized_rate_of_occurrence=aro,
            annualized_loss_expectancy=ale, var_90=p90, var_95=p95, var_99=p99,
            monte_carlo_mean_loss=mc_mean, monte_carlo_median_loss=mc_med,
            p90_loss=p90, p95_loss=p95, p99_loss=p99, revenue_loss=rev_l, operational_loss=op_l,
            downtime_cost=down_c, incident_response_cost=ir_c, recovery_cost=rec_c,
            data_impact_cost=dat_c, compliance_legal_cost=comp_c, total_estimated_loss=tot_l,
            sha256_hash=sha, is_anchored=anchored, blockchain_tx_hash=tx_hash,
            currency="INR", is_simulated=True
        )
        db.add(rr)
        bins = [round(mc_mean * f, 2) for f in [0.2, 0.5, 0.8, 1.0, 1.3, 1.7, 2.2, 2.8, 3.5, 4.5]]
        freqs = [random.randint(200, 2500) for _ in range(len(bins))]
        db.add(LossDistribution(
            id=str(uuid.uuid4()), risk_result_id=rr.id, bins_json=json.dumps(bins),
            frequencies_json=json.dumps(freqs), percentiles_json=json.dumps({"p50": mc_med, "p90": p90, "p95": p95, "p99": p99})
        ))
        hr = HashRecord(
            id=str(uuid.uuid4()), result_id=sim_id, organization_id=org.id, sha256_hash=sha,
            canonical_json=c_str, algorithm="SHA-256", data_version="1.0"
        )
        db.add(hr)
        db.flush()
        if anchored:
            db.add(BlockchainAnchor(
                id=str(uuid.uuid4()), hash_record_id=hr.id, sha256_hash=sha,
                network="Hardhat Localhost (ChainID: 31337)", contract_address="0x5FbDB2315678afecb367f032d93F642f64180aa3",
                transaction_hash=tx_hash, block_number=random.randint(100, 1500), status="ANCHORED"
            ))
    db.commit()

    # 12. Market Intelligence Benchmarks
    m_data = [
        ("Financial Services Cybersecurity Benchmark", "Banking & Financial Services", 5800.0, 220000000.0, 110000000.0, 14.2, 360.0),
        ("Healthcare & Lifesciences Defense Benchmark", "Healthcare & Pharma", 4900.0, 185000000.0, 92000000.0, 11.8, 290.0),
        ("Critical Infrastructure & Energy Utilities", "Energy & Critical Infrastructure", 6400.0, 310000000.0, 140000000.0, 15.5, 410.0),
        ("Cloud & SaaS Technology Benchmark", "Cloud & Datacenter Hosting", 4200.0, 160000000.0, 75000000.0, 13.0, 340.0),
        ("Manufacturing & Supply Chain Benchmark", "Manufacturing & IoT", 3800.0, 145000000.0, 68000000.0, 9.5, 275.0)
    ]
    for bname, ind, cpe, dbl, rnp, spit, roi in m_data:
        if not db.query(MarketData).filter(MarketData.benchmark_name == bname).first():
            db.add(MarketData(
                id=str(uuid.uuid4()), benchmark_name=bname, industry=ind,
                cost_per_endpoint_annual_inr=cpe, avg_data_breach_loss_inr=dbl,
                avg_ransomware_payout_inr=rnp, security_budget_pct_of_it=spit,
                avg_roi_cyber_investment=roi, source_label="DEMO DATA Intelligence",
                is_simulated=True
            ))
    db.commit()

    # 13. Executive Audit Reports with Unique SHA-256 Hashes and Full Date & Time
    if db.query(AuditReport).count() < 8:
        report_templates = [
            ("Cyber Risk Quantification & Defense Attestation", "EXECUTIVE_BOARD_SUMMARY", 0, 0, 14, 32, 15),
            ("NIST CSF 2.0 & ISO 27001 Regulatory Compliance Audit", "REGULATORY_COMPLIANCE", 1, 1, 11, 45, 20),
            ("Zero-Trust Ingress Security & Perimeter Breach Assessment", "TECHNICAL_ASSESSMENT", 2, 2, 16, 20, 48),
            ("CISO Annual Board Risk Exposure & VaR Dossier", "EXECUTIVE_BOARD_SUMMARY", 0, 3, 9, 15, 33),
            ("Third-Party Supply Chain & API Security Evaluation", "THIRD_PARTY_VENDOR", 1, 4, 18, 50, 12),
            ("Cloud Workload Hardening & Kubernetes Attestation", "TECHNICAL_ASSESSMENT", 2, 5, 13, 5, 59),
            ("Cyber Insurance Underwriting & Loss Limit Attestation", "INSURANCE_AUDIT", 0, 6, 10, 40, 44),
            ("SOC 2 Type II Readiness & Cryptographic Verification Seal", "REGULATORY_COMPLIANCE", 1, 7, 15, 22, 10),
        ]
        for title, rtype, o_idx, days_ago, hour, minute, sec in report_templates:
            org = org_objs[o_idx % len(org_objs)]
            rep_id = str(uuid.uuid4())
            ts = datetime.utcnow() - timedelta(days=days_ago, hours=hour, minutes=minute, seconds=sec)
            canonical_payload = json.dumps({
                "report_id": rep_id,
                "organization_id": org.id,
                "organization_name": org.name,
                "report_title": f"{title} - {org.name}",
                "report_type": rtype,
                "timestamp": ts.isoformat(),
                "standard": "FAIR / NIST CSF 2.0 / ISO 27001",
                "auditor": "S. Md. Afzal (CEO & Lead Assurance Officer)"
            }, sort_keys=True)
            u_hash = hashlib.sha256(canonical_payload.encode('utf-8')).hexdigest()

            rep = AuditReport(
                id=rep_id,
                organization_id=org.id,
                report_title=f"{title} - {org.name}",
                assessment_id=f"CFA-{u_hash[:8].upper()}",
                summary_markdown=f"# {title}\nAudited entity: **{org.name}**\nCryptographic Seal: `{u_hash}`",
                sha256_hash=u_hash,
                blockchain_tx_hash=f"0x{hashlib.sha256((u_hash + 'tx').encode()).hexdigest()}",
                verification_status="VERIFIED",
                created_at=ts,
                is_simulated=True
            )
            db.add(rep)

            # Add to HashRecord for instantaneous cryptographic verification
            db.add(HashRecord(
                id=str(uuid.uuid4()),
                result_id=rep_id,
                organization_id=org.id,
                sha256_hash=u_hash,
                canonical_json=canonical_payload,
                algorithm="SHA-256",
                data_version="1.0",
                created_at=ts
            ))
        db.commit()

    print("Seed finished successfully!")

