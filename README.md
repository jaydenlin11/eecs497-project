# EECS 497 Project

A kids' learning dashboard with a React frontend and FastAPI backend.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) 3.10+
- [PostgreSQL](https://www.postgresql.org/) 13+

## Setup

### PostgreSQL

1. Install PostgreSQL if you haven't already:
   - **macOS**: `brew install postgresql@16 && brew services start postgresql@16`
   - **Ubuntu/Debian**: `sudo apt install postgresql && sudo systemctl start postgresql`
   - **Windows**: Download from https://www.postgresql.org/download/windows/

2. Create the database:
   ```bash
   createdb kids_dashboard
   ```

3. Set the `DATABASE_URL` environment variable (optional — defaults to `postgresql://localhost/kids_dashboard`):
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost/kids_dashboard"
   ```
   Add this to your shell profile (`.zshrc`, `.bashrc`, etc.) to make it permanent.

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running

Start both servers in separate terminals.

**Frontend** (http://localhost:5173):
```bash
cd frontend
npm run dev
```

**Backend** (http://localhost:8000):
```bash
cd backend
source venv/bin/activate   # Windows: venv\Scripts\activate
uvicorn main:app --reload
```

API docs are available at http://localhost:8000/docs once the backend is running.
