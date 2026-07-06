import os
import logging
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

if DATABASE_URL:
    db_type = "Database"
    if "postgresql" in DATABASE_URL:
        db_type = "PostgreSQL"
    elif "mssql" in DATABASE_URL:
        db_type = "SQL Server"
        
    try:
        logger.info(f"Attempting to connect to {db_type}...")
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=1800,
        )
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info(f"Successfully connected to {db_type}!")
    except Exception as e:
        # Avoid logging the connection string with passwords
        masked_url = DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else "configured DATABASE_URL"
        logger.warning(
            f"{db_type} connection to '{masked_url}' failed: {e}\n"
            f"Falling back to SQLite database..."
        )
        engine = None

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
