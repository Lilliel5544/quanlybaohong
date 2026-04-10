# Quan ly bao hong giang duong - Local setup

This guide shows how to run the project on local machine (Windows + PowerShell).

## Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL/MariaDB (XAMPP is OK)

## 1) Database
1. Start MySQL/MariaDB service.
2. Create database `quan_ly_bao_hong`.
3. Import SQL file: `Database/database_quan_ly_bao_hong.sql`.

## 2) Backend (Django)
1. Go to backend folder:
   ```powershell
   cd Back_End
   ```
2. Create `.env` from `.env.example` and update DB info:
   ```powershell
   Copy-Item .env.example .env
   # Edit .env if needed (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT)
   ```
3. Create venv (skip if you already have `.venv`):
   ```powershell
   python -m venv .venv
   ```
4. Activate venv:
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```
5. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
6. Migrate:
   ```powershell
   python manage.py migrate
   ```
7. Run server:
   ```powershell
   python manage.py runserver
   ```
   Backend runs at http://localhost:8000

## 3) Frontend (Vite + React)
1. Open new terminal and go to frontend folder:
   ```powershell
   cd Front_End
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. (Optional) Set API base (default is http://localhost:8000/api):
   ```powershell
   $env:VITE_API_BASE = "http://localhost:8000/api"
   ```
4. Start dev server:
   ```powershell
   npm run dev
   ```
   Frontend runs at http://localhost:5173

## Notes
- Make sure both backend and frontend are running.
- If login/session errors happen, use `localhost` consistently for both frontend and backend.
