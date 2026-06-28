# Ignition Sprint Backend

FastAPI backend for a gamified, AI-assisted task execution app.

## Quick Start

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:GEMINI_API_KEY="your-key"
uvicorn app.main:app --reload
```

Open:

- API docs: http://127.0.0.1:8000/docs
- Test frontend: http://127.0.0.1:8000/

If `GEMINI_API_KEY` is not set, the app uses deterministic fallback data so the API and frontend can still be tested.

## Calendar-Aware Sprints

`POST /api/sprint/initialize` accepts an optional `calendar_events` array. The calendar service asks Gemini 2.5 Pro to detect deadline pressure and whether the generated 15-minute tasks can fit before upcoming deadlines.
