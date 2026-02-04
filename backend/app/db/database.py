"""Database connection and initialization."""

import aiosqlite
from pathlib import Path
from app.utils import logger

DB_PATH = Path(__file__).parent.parent.parent / "vault.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"


class Database:
    """Async SQLite database manager."""
    
    def __init__(self, db_path: str = str(DB_PATH)):
        self.db_path = db_path
        self._connection = None
    
    async def connect(self):
        """Establish database connection."""
        self._connection = await aiosqlite.connect(self.db_path)
        self._connection.row_factory = aiosqlite.Row
        await self._connection.execute("PRAGMA foreign_keys = ON")
        logger.info(f"Database connected: {self.db_path}")
        return self._connection
    
    async def disconnect(self):
        """Close database connection."""
        if self._connection:
            await self._connection.close()
            self._connection = None
            logger.info("Database disconnected")
    
    async def init_schema(self):
        """Initialize database schema from SQL file."""
        if not self._connection:
            await self.connect()
        
        with open(SCHEMA_PATH, 'r') as f:
            schema_sql = f.read()
        
        await self._connection.executescript(schema_sql)
        await self._connection.commit()
        logger.info("Database schema initialized")
    
    @property
    def connection(self):
        """Get current connection."""
        return self._connection
    
    async def execute(self, query: str, params: tuple = ()):
        """Execute a query and return cursor."""
        if not self._connection:
            await self.connect()
        cursor = await self._connection.execute(query, params)
        await self._connection.commit()
        return cursor
    
    async def fetch_one(self, query: str, params: tuple = ()):
        """Fetch single row."""
        if not self._connection:
            await self.connect()
        cursor = await self._connection.execute(query, params)
        return await cursor.fetchone()
    
    async def fetch_all(self, query: str, params: tuple = ()):
        """Fetch all rows."""
        if not self._connection:
            await self.connect()
        cursor = await self._connection.execute(query, params)
        return await cursor.fetchall()


# Global instance
db = Database()
