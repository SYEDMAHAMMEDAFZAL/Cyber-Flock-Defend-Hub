import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

import logging

logger = logging.getLogger("cyber_flock.database")

# Multi-DB Engine: Support SQLite WAL, MySQL (via PyMySQL), and PostgreSQL
database_url = settings.DATABASE_URL
engine = None

def create_sqlite_engine(url=None):
    if not url:
        db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'cyber_flock.db').replace('\\', '/')
        url = f"sqlite:///{db_path}"
    sq_engine = create_engine(url, connect_args={"check_same_thread": False})
    from sqlalchemy import event
    @event.listens_for(sq_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()
    return sq_engine

if database_url.startswith("sqlite"):
    engine = create_sqlite_engine(database_url)
elif "mysql" in database_url:
    # Ensure URL uses pymysql driver if generic mysql:// was specified
    if database_url.startswith("mysql://"):
        database_url = database_url.replace("mysql://", "mysql+pymysql://", 1)
    try:
        mysql_engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_recycle=3600,
            pool_size=10,
            max_overflow=20
        )
        # Test connection
        with mysql_engine.connect() as conn:
            logger.info("Successfully connected to MySQL database engine.")
        engine = mysql_engine
    except Exception as e:
        logger.warning(
            f"[DATABASE NOTICE] MySQL database connection could not be established ({e}). "
            f"Falling back to local SQLite WAL so services remain 100% active."
        )
        engine = create_sqlite_engine()
else:
    try:
        engine = create_engine(database_url, pool_pre_ping=True, pool_size=10, max_overflow=20)
    except Exception as e:
        logger.warning(f"Error initializing database engine: {e}. Falling back to SQLite.")
        engine = create_sqlite_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
