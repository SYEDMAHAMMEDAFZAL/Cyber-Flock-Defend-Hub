"""
Cyber Flock Defense Hub - MySQL Setup & Migration Utility
Connects to MySQL, creates database if missing, generates tables, and seeds initial data.
"""

import os
import sys
import argparse
import pymysql
from sqlalchemy import create_engine

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.database import Base
from app.seed import seed_database
import app.models  # load all models for metadata

def setup_mysql(host="localhost", port=3306, user="root", password="", db_name="cyber_flock_db"):
    print("=" * 65)
    print("CYBER FLOCK DEFENSE HUB - MYSQL CONFIGURATION UTILITY")
    print("=" * 65)
    print(f"[*] Target MySQL Server: {user}@{host}:{port}")
    print(f"[*] Target Database:     {db_name}")

    try:
        print("[1/4] Connecting to MySQL server...")
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            charset="utf8mb4",
            autocommit=True
        )
        with conn.cursor() as cursor:
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        conn.close()
        print(f"[+] Database `{db_name}` is ready!")
    except Exception as e:
        print(f"[-] Failed to connect to MySQL server: {e}")
        print("    Please ensure MySQL Server is installed, running on the given port, and credentials are correct.")
        return False

    db_url = f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}?charset=utf8mb4"
    try:
        print("[2/4] Initializing SQLAlchemy engine and creating database schema...")
        engine = create_engine(db_url, pool_pre_ping=True)
        Base.metadata.create_all(bind=engine)
        print("[+] All tables successfully created in MySQL!")
    except Exception as e:
        print(f"[-] Failed to generate database tables: {e}")
        return False

    try:
        print("[3/4] Seeding initial enterprise organizations, users, and telemetry...")
        from sqlalchemy.orm import sessionmaker
        Session = sessionmaker(bind=engine)
        session = Session()
        seed_database(session)
        session.close()
        print("[+] Initial data seeding completed successfully!")
    except Exception as e:
        print(f"[-] Notice during seeding: {e}")

    try:
        print("[4/4] Updating backend/.env configuration...")
        env_path = os.path.join(BASE_DIR, ".env")
        lines = []
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
        
        found = False
        new_lines = []
        for line in lines:
            if line.strip().startswith("DATABASE_URL="):
                new_lines.append(f"DATABASE_URL={db_url}\n")
                found = True
            else:
                new_lines.append(line)
        if not found:
            new_lines.append(f"\nDATABASE_URL={db_url}\n")

        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
        print(f"[+] Updated .env with DATABASE_URL: {db_url}")
    except Exception as e:
        print(f"[-] Could not update .env: {e}")

    print("=" * 65)
    print("SUCCESS: CYBER FLOCK DEFENSE HUB IS NOW CONNECTED TO MYSQL!")
    print("=" * 65)
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Configure MySQL for Cyber Flock Defense Hub")
    parser.add_argument("--host", default=os.getenv("MYSQL_HOST", "localhost"), help="MySQL Host")
    parser.add_argument("--port", type=int, default=int(os.getenv("MYSQL_PORT", 3306)), help="MySQL Port")
    parser.add_argument("--user", default=os.getenv("MYSQL_USER", "root"), help="MySQL Username")
    parser.add_argument("--password", default=os.getenv("MYSQL_PASSWORD", ""), help="MySQL Password")
    parser.add_argument("--db", default=os.getenv("MYSQL_DATABASE", "cyber_flock_db"), help="MySQL Database Name")
    args = parser.parse_args()

    setup_mysql(
        host=args.host,
        port=args.port,
        user=args.user,
        password=args.password,
        db_name=args.db
    )
