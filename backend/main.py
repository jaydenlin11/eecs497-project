from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import bcrypt as _bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import psycopg2
import psycopg2.extras
import uuid
import os
from typing import Optional

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY = "kids-dashboard-secret-key-change-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://localhost/kids_dashboard"
)

bearer_scheme = HTTPBearer()

app = FastAPI(title="Kids Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Database ──────────────────────────────────────────────────────────────────

def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    return conn


def get_cursor(conn):
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def init_db():
    conn = get_db()
    cur = get_cursor(conn)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS parents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS children (
            id TEXT PRIMARY KEY,
            parent_id TEXT NOT NULL REFERENCES parents(id),
            name TEXT NOT NULL,
            age INTEGER NOT NULL,
            avatar TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            parent_id TEXT PRIMARY KEY REFERENCES parents(id),
            screen_time_limit INTEGER NOT NULL DEFAULT 60,
            audio_enabled INTEGER NOT NULL DEFAULT 1,
            pin_hash TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            child_id TEXT NOT NULL REFERENCES children(id),
            game TEXT NOT NULL,
            score INTEGER NOT NULL DEFAULT 0,
            duration_seconds INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    cur.close()
    conn.close()


init_db()


# ── Auth helpers ──────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return _bcrypt.hashpw(password.encode(), _bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(parent_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": parent_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def get_current_parent_id(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ── Pydantic models ───────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    parent_name: str
    email: str
    password: str
    child_name: str
    child_age: int
    child_avatar: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ChildCreate(BaseModel):
    name: str
    age: int
    avatar: str

class ChildUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    avatar: Optional[str] = None

class VerifyPinRequest(BaseModel):
    pin: str

class SetPinRequest(BaseModel):
    pin: str

class UpdateSettingsRequest(BaseModel):
    screen_time_limit: Optional[int] = None
    audio_enabled: Optional[bool] = None

class SessionCreate(BaseModel):
    child_id: str
    game: str
    score: int
    duration_seconds: int


# ── Auth endpoints ────────────────────────────────────────────────────────────

@app.post("/auth/register")
def register(req: RegisterRequest):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT id FROM parents WHERE email = %s", (req.email,))
        existing = cur.fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        now = datetime.now(timezone.utc).isoformat()
        parent_id = str(uuid.uuid4())
        child_id = str(uuid.uuid4())

        cur.execute(
            "INSERT INTO parents (id, name, email, password_hash, created_at) VALUES (%s, %s, %s, %s, %s)",
            (parent_id, req.parent_name, req.email, hash_password(req.password), now),
        )
        cur.execute(
            "INSERT INTO children (id, parent_id, name, age, avatar, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
            (child_id, parent_id, req.child_name, req.child_age, req.child_avatar, now),
        )
        # Default PIN is "0000"
        cur.execute(
            "INSERT INTO settings (parent_id, screen_time_limit, audio_enabled, pin_hash) VALUES (%s, %s, %s, %s)",
            (parent_id, 60, 1, hash_password("0000")),
        )
        conn.commit()

        token = create_token(parent_id)
        return {"token": token, "parent": {"id": parent_id, "name": req.parent_name, "email": req.email}}
    finally:
        cur.close()
        conn.close()


@app.post("/auth/login")
def login(req: LoginRequest):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT * FROM parents WHERE email = %s", (req.email,))
        row = cur.fetchone()
        if not row or not verify_password(req.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_token(row["id"])
        return {"token": token, "parent": {"id": row["id"], "name": row["name"], "email": row["email"]}}
    finally:
        cur.close()
        conn.close()


@app.get("/auth/me")
def get_me(parent_id: str = Depends(get_current_parent_id)):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT id, name, email FROM parents WHERE id = %s", (parent_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Parent not found")
        return {"id": row["id"], "name": row["name"], "email": row["email"]}
    finally:
        cur.close()
        conn.close()


# ── Children endpoints ────────────────────────────────────────────────────────

@app.get("/children")
def list_children(parent_id: str = Depends(get_current_parent_id)):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT * FROM children WHERE parent_id = %s", (parent_id,))
        rows = cur.fetchall()
        return [dict(r) for r in rows]
    finally:
        cur.close()
        conn.close()


@app.post("/children", status_code=201)
def create_child(req: ChildCreate, parent_id: str = Depends(get_current_parent_id)):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        child_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        cur.execute(
            "INSERT INTO children (id, parent_id, name, age, avatar, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
            (child_id, parent_id, req.name, req.age, req.avatar, now),
        )
        conn.commit()
        return {"id": child_id, "parent_id": parent_id, "name": req.name, "age": req.age, "avatar": req.avatar}
    finally:
        cur.close()
        conn.close()


@app.put("/children/{child_id}")
def update_child(child_id: str, req: ChildUpdate, parent_id: str = Depends(get_current_parent_id)):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "SELECT * FROM children WHERE id = %s AND parent_id = %s", (child_id, parent_id)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Child not found")

        name = req.name if req.name is not None else row["name"]
        age = req.age if req.age is not None else row["age"]
        avatar = req.avatar if req.avatar is not None else row["avatar"]

        cur.execute("UPDATE children SET name=%s, age=%s, avatar=%s WHERE id=%s", (name, age, avatar, child_id))
        conn.commit()
        return {"id": child_id, "parent_id": parent_id, "name": name, "age": age, "avatar": avatar}
    finally:
        cur.close()
        conn.close()


@app.delete("/children/{child_id}", status_code=204)
def delete_child(child_id: str, parent_id: str = Depends(get_current_parent_id)):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "SELECT id FROM children WHERE id = %s AND parent_id = %s", (child_id, parent_id)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Child not found")
        cur.execute("DELETE FROM children WHERE id = %s", (child_id,))
        conn.commit()
    finally:
        cur.close()
        conn.close()


# ── Settings endpoints ────────────────────────────────────────────────────────

@app.get("/settings")
def get_settings(parent_id: str = Depends(get_current_parent_id)):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT * FROM settings WHERE parent_id = %s", (parent_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Settings not found")
        return {
            "screen_time_limit": row["screen_time_limit"],
            "audio_enabled": bool(row["audio_enabled"]),
            "has_pin": row["pin_hash"] is not None,
        }
    finally:
        cur.close()
        conn.close()


@app.put("/settings")
def update_settings(req: UpdateSettingsRequest, parent_id: str = Depends(get_current_parent_id)):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT * FROM settings WHERE parent_id = %s", (parent_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Settings not found")

        limit = req.screen_time_limit if req.screen_time_limit is not None else row["screen_time_limit"]
        audio = (1 if req.audio_enabled else 0) if req.audio_enabled is not None else row["audio_enabled"]

        cur.execute(
            "UPDATE settings SET screen_time_limit=%s, audio_enabled=%s WHERE parent_id=%s",
            (limit, audio, parent_id),
        )
        conn.commit()
        return {"screen_time_limit": limit, "audio_enabled": bool(audio), "has_pin": row["pin_hash"] is not None}
    finally:
        cur.close()
        conn.close()


@app.post("/settings/verify-pin")
def verify_pin(req: VerifyPinRequest, parent_id: str = Depends(get_current_parent_id)):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute("SELECT pin_hash FROM settings WHERE parent_id = %s", (parent_id,))
        row = cur.fetchone()
        if not row or not row["pin_hash"]:
            raise HTTPException(status_code=400, detail="No PIN set")
        if not verify_password(req.pin, row["pin_hash"]):
            raise HTTPException(status_code=401, detail="Incorrect PIN")
        return {"valid": True}
    finally:
        cur.close()
        conn.close()


@app.post("/settings/set-pin")
def set_pin(req: SetPinRequest, parent_id: str = Depends(get_current_parent_id)):
    if len(req.pin) != 4 or not req.pin.isdigit():
        raise HTTPException(status_code=400, detail="PIN must be exactly 4 digits")
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "UPDATE settings SET pin_hash=%s WHERE parent_id=%s", (hash_password(req.pin), parent_id)
        )
        conn.commit()
        return {"success": True}
    finally:
        cur.close()
        conn.close()


# ── Sessions endpoint ─────────────────────────────────────────────────────────

@app.post("/sessions", status_code=201)
def create_session(req: SessionCreate, parent_id: str = Depends(get_current_parent_id)):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "SELECT id FROM children WHERE id = %s AND parent_id = %s", (req.child_id, parent_id)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Child not found")

        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        cur.execute(
            "INSERT INTO sessions (id, child_id, game, score, duration_seconds, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
            (session_id, req.child_id, req.game, req.score, req.duration_seconds, now),
        )
        conn.commit()
        return {"id": session_id}
    finally:
        cur.close()
        conn.close()


# ── Insights endpoint ─────────────────────────────────────────────────────────

@app.get("/insights/{child_id}")
def get_insights(child_id: str, parent_id: str = Depends(get_current_parent_id)):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "SELECT * FROM children WHERE id = %s AND parent_id = %s", (child_id, parent_id)
        )
        child = cur.fetchone()
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")

        cur.execute(
            "SELECT * FROM sessions WHERE child_id = %s ORDER BY created_at DESC", (child_id,)
        )
        sessions = [dict(s) for s in cur.fetchall()]

        # Aggregate by game
        game_stats: dict = {}
        for s in sessions:
            g = s["game"]
            if g not in game_stats:
                game_stats[g] = {"sessions": 0, "total_score": 0, "total_duration": 0, "best_score": 0}
            game_stats[g]["sessions"] += 1
            game_stats[g]["total_score"] += s["score"]
            game_stats[g]["total_duration"] += s["duration_seconds"]
            if s["score"] > game_stats[g]["best_score"]:
                game_stats[g]["best_score"] = s["score"]

        total_sessions = len(sessions)
        total_duration_seconds = sum(s["duration_seconds"] for s in sessions)

        today = datetime.now(timezone.utc).date().isoformat()
        today_duration_seconds = sum(
            s["duration_seconds"] for s in sessions if s["created_at"].startswith(today)
        )

        return {
            "child": dict(child),
            "total_sessions": total_sessions,
            "total_duration_seconds": total_duration_seconds,
            "today_duration_seconds": today_duration_seconds,
            "game_stats": game_stats,
            "recent_sessions": sessions[:10],
        }
    finally:
        cur.close()
        conn.close()


# ── Screen time check ─────────────────────────────────────────────────────────

@app.get("/screen-time/{child_id}")
def get_screen_time(child_id: str, parent_id: str = Depends(get_current_parent_id)):
    conn = get_db()
    cur = get_cursor(conn)
    try:
        cur.execute(
            "SELECT id FROM children WHERE id = %s AND parent_id = %s", (child_id, parent_id)
        )
        child = cur.fetchone()
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")

        cur.execute(
            "SELECT screen_time_limit FROM settings WHERE parent_id = %s", (parent_id,)
        )
        settings_row = cur.fetchone()
        limit_minutes = settings_row["screen_time_limit"] if settings_row else 60

        today = datetime.now(timezone.utc).date().isoformat()
        cur.execute(
            "SELECT SUM(duration_seconds) as total FROM sessions WHERE child_id = %s AND created_at LIKE %s",
            (child_id, f"{today}%"),
        )
        row = cur.fetchone()
        used_seconds = row["total"] or 0
        used_minutes = used_seconds / 60

        return {
            "limit_minutes": limit_minutes,
            "used_seconds": used_seconds,
            "used_minutes": round(used_minutes, 1),
            "remaining_minutes": max(0.0, limit_minutes - used_minutes),
            "exceeded": used_minutes >= limit_minutes,
        }
    finally:
        cur.close()
        conn.close()


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "Kids Dashboard API"}


@app.get("/health")
async def health():
    return {"status": "ok"}
