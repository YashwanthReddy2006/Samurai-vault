# SamuraiVault ⚔️

A **production-grade password manager** with a dark black & red samurai theme.

## Features

- 🔐 AES-256-GCM encrypted vault
- 🔑 Argon2id key derivation
- 📱 TOTP two-factor authentication
- 📊 Password strength analysis
- 🕵️ Breach detection (HIBP integration)
- 📈 Security analytics dashboard
- 🎨 Dark samurai-themed UI

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/vault/list | List passwords |
| POST | /api/vault/add | Add password |
| PUT | /api/vault/{id} | Update password |
| DELETE | /api/vault/{id} | Delete password |
| POST | /api/mfa/setup | Setup MFA |
| GET | /api/analytics/dashboard | Security stats |

## Security

- Passwords encrypted client-side before transmission
- Master password never stored, only used for key derivation
- JWT tokens with short expiration
- Rate limiting on auth endpoints
- All communication over HTTPS (in production)

## Tech Stack

**Backend:** Python, FastAPI, SQLite, Argon2, AES-GCM
**Frontend:** React, Vite, Vanilla CSS

---

Built with 🗡️ by SamuraiVault
