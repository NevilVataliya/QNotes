# QNotes — AI‑powered audio → notes

QNotes is a full‑stack app that turns **audio recordings**, **text**, and **PDF files** into clean, structured notes using AI. It supports **note versioning**, **playlists**, **public sharing**, **claps**, and **AI‑generated quizzes**.

- Backend (API): Node.js + Express + MongoDB
- Frontend (web): React + Vite + Tailwind + Redux

## Live

- https://qnotes.nevil.codes

## What you can do

- Create notes from:
	- Audio upload (server compresses with FFmpeg, stores in Cloudinary, transcribes + summarizes via Groq)
	- Raw text
	- File upload (plain text / PDF)
- Edit notes, manage **versions**, and “star” the best version
- Organize notes into **playlists** and optionally publish playlists
- Publish notes and let others **clap** (Medium‑style claps)
- Generate **MCQ quizzes** from a note
- Auth with **email verification**, **password reset**, and **httpOnly cookie-based authentication**

## Repo structure

```
backend/   # Express API + MongoDB
frontend/  # React web app
```

## Tech stack

**Backend**

- Node.js, Express 5
- MongoDB + Mongoose
- Auth: JWT access/refresh (httpOnly cookies) + email verification
- Uploads: Multer (memory), Cloudinary
- Audio: fluent-ffmpeg (requires FFmpeg installed)
- AI: Groq (Whisper transcription + Note Generation + Quiz Generation)
- Email: Nodemailer
- Tests: Jest + Supertest

**Frontend**

- React 18 + Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Markdown + Math rendering (GFM, KaTeX)

## Quick start (local)

### 1) Backend

Prereqs:

- Node.js 18+ recommended
- MongoDB running (local or Atlas)
- **FFmpeg installed and available in PATH** (required for audio processing)

Install + run:

```bash
cd backend
pnpm install
cp .env.example .env
pnpm dev
```

### 2) Frontend

Install + run:

```bash
cd frontend
pnpm install
cp .env.example .env
pnpm dev
```

Set `VITE_BACKEND_URL` in `frontend/.env` to your backend URL, e.g. `http://localhost:8000`.

## Environment variables

### Backend (`backend/.env`)

Create `backend/.env` (see `backend/.env.example`).

- `PORT` — API port (default: `8000`)
- `MONGODB_URI` — MongoDB connection string (without DB name; DB name is set in code as `Qnotes`)
- `CORS_ORIGIN` — Comma-separated allowed origins, or `*` (example: `http://localhost:5173`)

- `ACCESS_TOKEN_SECRET` — JWT secret for access token
- `ACCESS_TOKEN_EXPIRY` — e.g. `1d`
- `REFRESH_TOKEN_SECRET` — JWT secret for refresh token
- `REFRESH_TOKEN_EXPIRY` — e.g. `10d`
- `JWT_SECRET` — used for email verification / password reset tokens

- `GROQ_API_KEY` — Groq API key

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

- `EMAIL` — SMTP sender email (used by Nodemailer)
- `EMAIL_PASSWORD` — SMTP password/app-password
- `FRONTEND_URL` — frontend base URL (used to generate verification/reset links; example: `http://localhost:5173`)

### Frontend (`frontend/.env`)

- `VITE_BACKEND_URL` — backend base URL (example: `http://localhost:8000`)
- `PORT` (optional) — dev server port (Vite reads it in `frontend/vite.config.js`)

## API overview

Base path: `/api/v1`

### Auth / user

- `POST /user/register` (multipart/form-data) — fields: `username`, `email`, `fullname`, `password`, optional `avatar`, `coverImage`
- `POST /user/login` — email+password or username+password
- `POST /user/logout`
- `POST /user/refresh-access-token`
- `POST /user/verify-email` — token or email+otp
- `POST /user/resend-verification-email`
- `PATCH /user/change-password`
- `POST /user/initiate-forget-password`
- `POST /user/forget-password`
- `GET /user/get-user`

### Notes

- `POST /note/create-note` (multipart/form-data) — field: `audio`
- `POST /note/create-note-by-text` — body: `{ "text": "..." }`
- `POST /note/create-note-by-file` (multipart/form-data) — field: `file` (PDF or plain text)
- `GET /note/get-notes`
- `GET /note/n/:noteId` — fetch a note (works for owner; also supports public access)
- `PATCH /note/update-noteinfo/:noteId`
- `POST /note/create-new-version-note/:noteId`
- `GET /note/get-note-versions/:noteId`
- `PATCH /note/star-note/:noteId/:noteVersionId`
- `DELETE /note/delete-note/:noteId`
- `DELETE /note/delete-note-version/:noteId/:noteVersionId`
- `GET /note/u/:username` — public notes by username
- `GET /note/public-notes` — public feed

### Playlists

- `POST /playlist/create-playlist`
- `PATCH /playlist/update-playlist/:playlistId`
- `PUT /playlist/add-note/:playlistId/:noteId`
- `DELETE /playlist/remove-note/:playlistId/:noteId`
- `DELETE /playlist/delete-playlist/:playlistId`
- `GET /playlist/get-playlist-by-user`
- `GET /playlist/get-playlist/:playlistId` — owner or public
- `GET /playlist/get-playlist-by-username/:username` — public playlists

### Claps

- `PATCH /clap/increment/:noteId` — body: `{ "amount": 1 }`
- `PATCH /clap/decrement/:noteId` — body: `{ "amount": 1 }`
- `GET /clap/get-claps/:noteId` — returns `{ userClaps, totalClaps }`
- `GET /clap/total-claps/:userId`

### Quiz

- `POST /quiz/create-quiz/:noteId` — body: `{ "quantity": 10 }` (min 5, max 25)
- `GET /quiz/get-quiz/:noteId`
- `DELETE /quiz/delete-quiz/:noteId`

## Testing

Backend tests:

```bash
cd backend
pnpm test
```

## Common issues

- **CORS errors**: set `CORS_ORIGIN` to include your frontend URL and restart the backend.
- **401 “Email not verified”**: you must verify the account before using protected endpoints.
- **Audio processing fails**: ensure FFmpeg is installed and available on PATH.
- **Groq rate limits**: the backend tries multiple models, but can still hit limits—retry after a bit.

## Deployment notes

- Both `backend/` and `frontend/` include `vercel.json` files for Vercel deployments.
- The repo also includes Render-oriented config (the API is already deployed on Render).

## Contact

If you’re a recruiter or collaborator and want a walkthrough of the architecture/AI pipeline, open an issue or reach out via GitHub/LinkedIn.
