"""SQLite data store for project persistence."""

from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

_SCHEMA_PATH = Path(__file__).parent / "schema.sql"


class DataStore:
    """CRUD wrapper around the project SQLite database."""

    def __init__(self, db_path: str | Path) -> None:
        self._db_path = str(db_path)
        self._conn = sqlite3.connect(self._db_path)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA foreign_keys = ON")
        self._init_schema()

    def _init_schema(self) -> None:
        schema = _SCHEMA_PATH.read_text()
        self._conn.executescript(schema)
        self._conn.commit()

    def close(self) -> None:
        self._conn.close()

    def create_project(
        self, name: str, folder_path: str, description: str = ""
    ) -> str:
        pid = str(uuid.uuid4())
        self._conn.execute(
            "INSERT INTO projects (id, name, folder_path, created_at, description)"
            " VALUES (?, ?, ?, ?, ?)",
            (pid, name, folder_path, _now(), description),
        )
        self._conn.commit()
        return pid

    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        row = self._conn.execute(
            "SELECT * FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
        return dict(row) if row else None

    def list_projects(self) -> List[Dict[str, Any]]:
        rows = self._conn.execute(
            "SELECT * FROM projects ORDER BY created_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]

    def update_project(
        self, project_id: str, **kwargs: Any
    ) -> None:
        allowed = {"name", "description", "metadata_json"}
        updates = []
        params: list = []
        for key, value in kwargs.items():
            if key not in allowed:
                raise KeyError(f"Cannot update field: {key!r}")
            updates.append(f"{key} = ?")
            params.append(value)
        if not updates:
            return
        params.append(project_id)
        self._conn.execute(
            f"UPDATE projects SET {', '.join(updates)} WHERE id = ?", params
        )
        self._conn.commit()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()
