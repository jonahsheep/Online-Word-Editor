# Online Word Editor

A web-based rich text editor with PIN-based document sharing. Built with Flask (backend) and React/ReactQuill (frontend).

**Live app:** [https://online-word-editor-frontend.onrender.com](https://online-word-editor-frontend.onrender.com)

## Features

- Rich text editing with formatting toolbar (headings, bold, italic, lists, links, images)
- PIN-based document save/retrieve with 10-minute expiry
- Auto-save (30s debounce) with save status indicator
- DOCX and PDF export
- Version history (last 5 saves per document)
- Dark mode (system preference + manual toggle)
- PIN sharing via link (?pin=)
- Document word/character count
- Recent PINs in localStorage (up to 5)
- Image compression on paste (max 1920x1080, JPEG 70%)
- Responsive design (768px and 480px breakpoints)
- Rate limiting (200 req/min total, 50 req/min per IP)
- HTML sanitization with bleach (restricted tags/attributes)
- Security headers (CSP, X-Frame-Options, etc.)

## Tech Stack

- **Backend**: Python/Flask, fpdf, python-docx, bleach, flask-limiter
- **Frontend**: React 18, ReactQuill, axios
- **Deployment**: Render (gunicorn + static build)

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
python server.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

The app runs at `http://localhost:3000` with the backend at `http://localhost:5000`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `DOCUMENT_EXPIRY` | `600` | Document expiry in seconds (10min) |
| `STORAGE_LIMIT` | `1000` | Max stored documents |
| `MAX_CONTENT_LENGTH` | `524288` | Max request size in bytes (512KB) |
| `CORS_ORIGINS` | `*` | Allowed CORS origins |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Server health + active document count |
| `POST` | `/save` | Save document (creates or updates by PIN) |
| `GET` | `/retrieve/<pin>` | Retrieve document by PIN |
| `GET` | `/history/<pin>` | Get version history for document |
| `POST` | `/restore/<pin>` | Restore document to a previous version |
| `POST` | `/download/pdf` | Download as PDF |
| `POST` | `/download/docx` | Download as DOCX |

## Deployment

This app is designed for Render:

1. Push to GitHub
2. Create a **Web Service** for the backend:
   - Root directory: `backend/`
   - Start command: `gunicorn server:app`
3. Create a **Static Site** for the frontend:
   - Root directory: `frontend/`
   - Build command: `npm install && npm run build`
   - Publish directory: `build`
4. Set `REACT_APP_API_URL` in frontend env to the backend URL
5. Set `CORS_ORIGINS` in backend env to the frontend URL

## License

MIT
