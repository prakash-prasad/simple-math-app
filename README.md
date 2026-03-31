# Math Tracker

A browser-based math application with click tracking and heatmap analytics.

## Prerequisites

- Python 3.9+

## Setup & Run

```bash
cd math-app
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

Then open **http://localhost:8000** in your browser.

## Usage

1. **Login page** (`/`) — enter any User ID and click GO
2. **App page** (`/app.html`) — switch between Addition / Subtraction / Multiplication tabs, click Show Result
3. **Analytics page** (`/analytics.html`) — view click heatmap, filter by user

## Project Structure

```
math-app/
├── backend/
│   ├── main.py          # FastAPI app
│   ├── database.py      # SQLite helpers
│   ├── models.py        # Pydantic schemas
│   └── routes/
│       ├── clicks.py    # POST/GET /api/clicks, GET /api/heatmap
│       └── health.py    # GET /api/health
├── frontend/
│   ├── index.html       # Login
│   ├── app.html         # Tabbed math page
│   ├── analytics.html   # Heatmap
│   ├── css/
│   └── js/
└── data/                # clicks.db created here at runtime
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/clicks` | Record a click event |
| GET | `/api/clicks` | List events (query: user_id, button_name, page, limit) |
| GET | `/api/heatmap` | Click counts per button (query: users — comma-separated or "all") |

## Tracked Buttons

| button_name | Description |
|-------------|-------------|
| `tab_addition` | Addition tab click |
| `tab_subtraction` | Subtraction tab click |
| `tab_multiplication` | Multiplication tab click |
| `show_addition` | Show Result on Addition panel |
| `show_subtraction` | Show Result on Subtraction panel |
| `show_multiplication` | Show Result on Multiplication panel |
