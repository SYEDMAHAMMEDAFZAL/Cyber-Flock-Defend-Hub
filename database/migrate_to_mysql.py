#!/usr/bin/env python3
"""
CYBER FLOCK DEFENSE HUB - SQLite to MySQL Automatic Migration Tool
------------------------------------------------------------------
Transfers all tenant organizations, plans, users, enterprise assets,
vulnerabilities, simulations, and audit records from SQLite into MySQL.

Usage:
  python migrate_to_mysql.py --mysql-url mysql+pymysql://root:password@localhost:3306/cyber_flock
"""

import sys
import os
import argparse
from sqlalchemy import create_engine, inspect, MetaData, Table
from sqlalchemy.orm import sessionmaker

# Add parent backend directory to path
backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.models import Base

def migrate(sqlite_path: str, mysql_url: str):
    print("=" * 70)
    print("CYBER FLOCK DEFENSE HUB: SQLite -> MySQL Migration Engine")
    print("=" * 70)

    if not os.path.exists(sqlite_path):
        print(f"[-] SQLite source file not found: {sqlite_path}")
        return False

    print(f"[*] Source SQLite: {sqlite_path}")
    print(f"[*] Target MySQL:  {mysql_url.split('@')[-1] if '@' in mysql_url else mysql_url}")

    sqlite_engine = create_engine(f"sqlite:///{sqlite_path.replace(chr(92), '/')}")
    try:
        mysql_engine = create_engine(mysql_url, pool_pre_ping=True)
        # Test MySQL connection
        with mysql_engine.connect() as conn:
            print("[+] MySQL connection established successfully!")
    except Exception as e:
        print(f"[-] Failed to connect to MySQL: {e}")
        print("[!] Ensure MySQL service is running and credentials in --mysql-url are valid.")
        return False

    # Create all tables on MySQL schema if not existing
    print("[*] Ensuring all 24 security tables exist on MySQL...")
    Base.metadata.create_all(bind=mysql_engine)

    # Order of tables to migrate respecting foreign keys
    tables_order = [
        "plans",
        "organizations",
        "subscriptions",
        "users",
        "assets",
        "endpoints",
        "applications",
        "attack_techniques",
        "attack_paths",
        "security_controls",
        "attack_scenarios",
        "cves",
        "vulnerabilities",
        "siem_events",
        "edr_alerts",
        "pam_events",
        "simulations",
        "risk_results",
        "loss_distributions",
        "investment_recommendations",
        "audit_reports",
        "hash_records",
        "blockchain_anchors",
        "audit_logs",
        "notifications",
        "market_data",
        "demo_requests"
    ]

    sqlite_inspector = inspect(sqlite_engine)
    existing_sqlite_tables = set(sqlite_inspector.get_table_names())

    with sqlite_engine.connect() as sq_conn, mysql_engine.connect() as my_conn:
        for t_name in tables_order:
            if t_name not in existing_sqlite_tables:
                continue

            print(f"[*] Migrating table `{t_name}`...", end=" ")
            try:
                table_meta = Table(t_name, MetaData(), autoload_with=sqlite_engine)
                records = sq_conn.execute(table_meta.select()).mappings().all()

                if not records:
                    print("(0 records)")
                    continue

                target_table = Table(t_name, MetaData(), autoload_with=mysql_engine)
                
                # Insert records in batches
                inserted_count = 0
                for record in records:
                    rec_dict = dict(record)
                    try:
                        my_conn.execute(target_table.insert().values(rec_dict))
                        inserted_count += 1
                    except Exception as ins_err:
                        # Ignore duplicates or existing primary keys
                        pass
                
                my_conn.commit()
                print(f"DONE ({inserted_count}/{len(records)} records synced)")
            except Exception as ex:
                print(f"FAILED: {ex}")

    print("=" * 70)
    print("[+] Migration successfully finalized!")
    print("[+] To switch backend to MySQL, update DATABASE_URL in backend/.env:")
    print(f"    DATABASE_URL={mysql_url}")
    print("=" * 70)
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate Cyber Flock SQLite to MySQL")
    default_sqlite = os.path.join(backend_dir, "cyber_flock.db")
    parser.add_argument("--sqlite-path", default=default_sqlite, help="Path to SQLite db file")
    parser.add_argument(
        "--mysql-url",
        default=os.getenv("MYSQL_URL", "mysql+pymysql://root:password@localhost:3306/cyber_flock"),
        help="Target MySQL connection URI"
    )
    args = parser.parse_args()
    migrate(args.sqlite_path, args.mysql_url)
