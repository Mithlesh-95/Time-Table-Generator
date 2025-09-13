Backend (Django + DRF) for NEP 2020 TTG

Quick start (local)
- Create .env from .env.example and adjust if needed
- Install deps: pip install -r requirements.txt
- Apply migrations: python manage.py migrate
- Create superuser: python manage.py createsuperuser
- Run: python manage.py runserver 0.0.0.0:8000

Auth
- POST /api/auth/token/ {"username","password"} -> {access,refresh}
- Use Authorization: Bearer <access>

Master Data endpoints (JWT required)
- /api/departments/
- /api/faculties/  (bulk upload: POST /api/faculties/bulk-upload/ with file=.csv/.xlsx)
- /api/students/   (bulk upload: POST /api/students/bulk-upload/ with file=.csv/.xlsx)
- /api/rooms/
- /api/subjects/
- /api/sections/

CORS
- Allow all by default. Set CORS_ALLOWED_ORIGINS for Vercel domain in prod.

Deploy
- Use Render/Railway; set PYTHON_VERSION=3.11, build: pip install -r requirements.txt; start: gunicorn ttg.wsgi
- Set env vars: DJANGO_SECRET_KEY, DJANGO_DEBUG=False, API_PREFIX=/api, DATABASE_URL, CORS_ALLOWED_ORIGINS

Neon (free Postgres) setup
1) Create a Neon account → New Project
	- Project name: Time-Table-Generator
	- Postgres version: 17
	- Cloud: AWS
	- Region: AWS US East 1 (N. Virginia) (closest to your app)
2) Copy the provided connection string (it contains sslmode=require)
3) In api/.env, set DATABASE_URL to that string. Example:
	DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB?sslmode=require
4) Our settings enforce SSL for hosted Postgres automatically.
5) Run migrations and create admin.

Frontend integration (Vercel)
- Set NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain/api in Vercel Project Settings → Environment Variables
- The frontend axios client adds JWT from localStorage (authToken)

Windows PowerShell quick commands
```powershell
cd d:\SIH\Time-Table-Generator\api
python -m venv .venv ; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Edit .env and set DATABASE_URL from Neon
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

JWT quick test (after createsuperuser)
- POST /api/auth/token/ with { "username": "<admin>", "password": "<pass>" } → { access, refresh }
- Use Authorization: Bearer <access> for subsequent API calls
