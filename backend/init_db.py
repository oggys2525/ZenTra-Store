import os
import re
import pyodbc
import sys

def get_installed_drivers():
    """Returns a list of installed ODBC drivers that support SQL Server."""
    all_drivers = pyodbc.drivers()
    sql_drivers = [d for d in all_drivers if 'sql server' in d.lower() or 'odbc driver' in d.lower()]
    return sql_drivers

def init_sql_server():
    server = r"DESKTOP-VUJ7B7V\SQLEXPRESS"
    db_name = "ZenTraDB"
    
    print("=== ZenTra Store SQL Server Initialization ===")
    
    # 1. Detect Drivers
    drivers = get_installed_drivers()
    if not drivers:
        print("ERROR: No SQL Server ODBC drivers found on this system!")
        print("Please install 'ODBC Driver 17 for SQL Server' from Microsoft website.")
        sys.exit(1)
        
    # Prefer newer drivers
    driver = None
    for d in ["ODBC Driver 18 for SQL Server", "ODBC Driver 17 for SQL Server", "SQL Server"]:
        if d in drivers:
            driver = d
            break
    if not driver:
        driver = drivers[0]
        
    print(f"Detected ODBC Drivers: {drivers}")
    print(f"Using Driver: {driver}")
    print(f"Connecting to Server: {server}...")

    # Connection string to master to create the database
    # Trusted_Connection=yes uses Windows Authentication
    # For Driver 18+, we add TrustServerCertificate=yes to prevent ssl errors in local environments
    conn_str = f"Driver={{{driver}}};Server={server};Database=master;Trusted_Connection=yes;"
    if "Driver 18" in driver:
        conn_str += "TrustServerCertificate=yes;"
        
    try:
        conn = pyodbc.connect(conn_str, autocommit=True)
        cursor = conn.cursor()
        
        # 2. Create Database
        print(f"Checking if database '{db_name}' exists...")
        cursor.execute(f"SELECT database_id FROM sys.databases WHERE name = '{db_name}'")
        row = cursor.fetchone()
        
        if row:
            print(f"Database '{db_name}' already exists. Skipping creation.")
        else:
            print(f"Creating database '{db_name}'...")
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"Database '{db_name}' created successfully.")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"ERROR connecting to master/creating DB: {e}")
        sys.exit(1)

    # 3. Connect to the new Database to run schema SQL script
    conn_str_db = f"Driver={{{driver}}};Server={server};Database={db_name};Trusted_Connection=yes;"
    if "Driver 18" in driver:
        conn_str_db += "TrustServerCertificate=yes;"

    try:
        print(f"Connecting to '{db_name}' to run SQL schema initialization...")
        conn = pyodbc.connect(conn_str_db, autocommit=True)
        cursor = conn.cursor()
        
        # Read database.sql file
        sql_file_path = os.path.join(os.path.dirname(__file__), "..", "database.sql")
        if not os.path.exists(sql_file_path):
            # Try root workspace path
            sql_file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database.sql")
            
        print(f"Reading SQL script from: {sql_file_path}")
        with open(sql_file_path, "r", encoding="utf-8") as f:
            sql_script = f.read()

        # Remove the USE statements or DB creations inside the SQL file if any, or let them execute
        # Pyodbc doesn't support 'GO' statements. We split by 'GO' (case-insensitive)
        statements = re.split(r'\bGO\b', sql_script, flags=re.IGNORECASE)
        
        print("Executing SQL statements...")
        executed_count = 0
        for stmt in statements:
            stmt = stmt.strip()
            # Skip empty statements or comments
            if not stmt or stmt.startswith('--'):
                continue
            try:
                cursor.execute(stmt)
                executed_count += 1
            except Exception as stmt_err:
                # Some conditional DROP statements might fail if objects aren't there yet, log but continue
                print(f"Warning/Error on statement: {stmt[:60]}... \nReason: {stmt_err}")
                
        print(f"Successfully executed {executed_count} SQL statement blocks.")
        cursor.close()
        conn.close()
        print("Database schema loaded and seeded successfully!")
        
    except Exception as e:
        print(f"ERROR initializing database schema: {e}")
        sys.exit(1)

    # 4. Update the .env file
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
        
    print(f"Updating connection URL inside: {env_path}")
    
    # Format database URL for SQLAlchemy
    # Format: mssql+pyodbc://@<server>/<database>?driver=<driver>&trusted_connection=yes
    # Replace backslashes with url-encoded or pass properly. SQLAlchemy pyodbc connection:
    # mssql+pyodbc://@DESKTOP-VUJ7B7V\SQLEXPRESS/ZenTraDB?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes
    driver_url_param = driver.replace(" ", "+")
    db_url = f"mssql+pyodbc://@{server}/{db_name}?driver={driver_url_param}&trusted_connection=yes"
    if "Driver 18" in driver:
        db_url += "&TrustServerCertificate=yes"
        
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        new_lines = []
        for line in lines:
            if line.startswith("DATABASE_URL="):
                new_lines.append(f"DATABASE_URL={db_url}\n")
            else:
                new_lines.append(line)
                
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
            
        print(f"Successfully configured .env with SQL Server Database URL:")
        print(f"  {db_url}")
        print("\n=== Setup Complete! You can now run the backend. ===")
        
    except Exception as e:
        print(f"ERROR writing to .env file: {e}")

if __name__ == "__main__":
    init_sql_server()
