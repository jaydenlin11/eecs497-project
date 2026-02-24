# EECS 497 Project

A kids' learning dashboard with a React frontend and FastAPI backend.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) 3.10+

## Setup

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
