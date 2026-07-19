import os
import logging
import time
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database")

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SQLITE_FALLBACK_URL = os.getenv("SQLITE_FALLBACK_URL", "sqlite:///./zentra_store.db")

# Convert relative SQLite fallback path to absolute path relative to workspace root
if SQLITE_FALLBACK_URL.startswith("sqlite:///"):
    # connection.py is in backend/app/database
    db_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    workspace_root = os.path.dirname(db_dir)
    db_filename = SQLITE_FALLBACK_URL.replace("sqlite:///./", "").replace("sqlite:///", "")
    absolute_db_path = os.path.abspath(os.path.join(workspace_root, db_filename))
    SQLITE_FALLBACK_URL = f"sqlite:///{absolute_db_path}"

# Standardize postgres scheme for SQLAlchemy 1.4+ (Render uses postgres:// by default)
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

Base = declarative_base()

# Attempt to create database engine
engine = None
is_sqlite = False

is_production = os.getenv("RENDER") == "true" or (DATABASE_URL and ("render.com" in DATABASE_URL or "postgresql" in DATABASE_URL))

if DATABASE_URL:
    db_type = "Database"
    if "postgresql" in DATABASE_URL:
        db_type = "PostgreSQL"
    elif "mssql" in DATABASE_URL:
        db_type = "SQL Server"
        
    max_retries = 5
    retry_delay = 2  # seconds
    
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Attempting to connect to {db_type} (Attempt {attempt}/{max_retries})...")
            engine = create_engine(
                DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=1800,
            )
            
            # Configure Unicode encoding/decoding settings for pyodbc connection
            @event.listens_for(engine, "connect")
            def set_mssql_encoding(dbapi_connection, connection_record):
                try:
                    import pyodbc
                    dbapi_connection.setdecoding(pyodbc.SQL_CHAR, encoding='utf-8')
                    dbapi_connection.setdecoding(pyodbc.SQL_WCHAR, encoding='utf-8')
                    dbapi_connection.setencoding(encoding='utf-8')
                except Exception as ex:
                    logger.warning(f"Failed to set pyodbc encoding: {ex}")
            # Test connection
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info(f"Successfully connected to {db_type}!")
            break
        except Exception as e:
            masked_url = DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else "configured DATABASE_URL"
            logger.warning(f"Connection attempt {attempt} failed: {e}")
            engine = None
            if attempt < max_retries:
                time.sleep(retry_delay)
            else:
                if is_production:
                    logger.error(
                        f"CRITICAL: Failed to connect to production {db_type} at '{masked_url}' after {max_retries} attempts.\n"
                        f"Disabling SQLite fallback in production to prevent data loss."
                    )
                    raise e
                else:
                    logger.warning(
                        f"Local development connection to '{masked_url}' failed.\n"
                        f"Falling back to SQLite database..."
                    )

if engine is None:
    logger.info(f"Using SQLite fallback database at {SQLITE_FALLBACK_URL}...")
    is_sqlite = True
    # SQLite connection
    engine = create_engine(
        SQLITE_FALLBACK_URL,
        connect_args={"check_same_thread": False}  # Required for SQLite multi-threading in FastAPI
    )
    
    # Enable foreign keys for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
