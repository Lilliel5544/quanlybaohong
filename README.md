# Quan ly bao hong giang duong

Hệ thống quản lý báo hỏng giảng đường (Django + Vite/React). Frontend hiện dùng thư mục `new_Front_End`.

## Prerequisites
- Python 3.11+
- Node.js 18+
- MySQL/MariaDB

## 1) Database (MySQL)
1. Start MySQL/MariaDB service.
2. Create database `quan_ly_bao_hong`.
3. (Optional) Import sample data:
   ```sql
   SOURCE Database/database_quan_ly_bao_hong.sql;
   ```

## 2) Backend (Django) - Local
1. Go to backend folder:
   ```powershell
   cd Back_End
   ```
2. Create `.env` and update DB info:
   ```powershell
   Copy-Item .env.example .env
   # Edit .env (DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT)
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
   python -m pip install -r requirements.txt
   ```
6. Migrate:
   ```powershell
   python manage.py migrate
   ```
7. Run server:
   ```powershell
   python manage.py runserver 8000
   ```
   Backend runs at http://localhost:8000

## 3) Frontend (Vite + React) - Local
1. Open new terminal and go to frontend folder:
   ```powershell
   cd new_Front_End
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Create `.env`:
   ```ini
   VITE_API_BASE=http://localhost:8000/api
   ```
4. Start dev server:
   ```powershell
   npm run dev
   ```
   Frontend runs at http://localhost:5173

## API Notes
- `GET /api/catalog/` returns facilities, buildings, equipment defaults for new_Front_End.
- `GET /api/meta/` returns facilities + categories.

## Production Deploy (Linux VPS)
### Backend (Gunicorn + Nginx)
1. Set environment:
   ```ini
   DEBUG=false
   SECRET_KEY=change-me
   ALLOWED_HOSTS=your-domain
   DB_NAME=quan_ly_bao_hong
   DB_USER=your-user
   DB_PASSWORD=your-password
   DB_HOST=127.0.0.1
   DB_PORT=3306
   CORS_ALLOWED_ORIGINS=https://your-domain
   CSRF_TRUSTED_ORIGINS=https://your-domain
   ```
2. Install deps, migrate, then run Gunicorn:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   python -m pip install -r requirements.txt
   python manage.py migrate
   gunicorn backend.wsgi:application --bind 127.0.0.1:8000
   ```

### Frontend (Build + Nginx)
```bash
cd new_Front_End
npm install
npm run build
```

Serve `new_Front_End/dist` with Nginx and proxy `/api/` to Gunicorn.

## Notes
- Run backend + frontend together for local testing.
- Use `localhost` consistently for both to avoid session/CSRF issues.
