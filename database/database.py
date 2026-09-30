import os
import sqlite3
from pathlib import Path

from flask import g

DB_PATH = Path(__file__).resolve().parent.parent / "pingala.db"


def get_db():
    if "db" not in g:
        connection = sqlite3.connect(str(DB_PATH), timeout=30)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA journal_mode=WAL;")
        g.db = connection
    return g.db


def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    connection = sqlite3.connect(str(DB_PATH), timeout=30)
    connection.execute("PRAGMA journal_mode=WAL;")
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS generation_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            n INTEGER NOT NULL,
            total_combinations INTEGER NOT NULL,
            generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    connection.commit()
    connection.close()
