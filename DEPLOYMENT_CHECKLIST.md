# 🚀 Render Deployment Checklist

## Before You Deploy

- [ ] **Push your code to GitHub**
  ```bash
  git add .
  git commit -m "Ready for Render deployment"
  git push origin main
  ```

- [ ] **Review your environment variables** in `.env.example`
- [ ] **Generate a strong Django secret key** (use online generator)

## Render Configuration Quick Reference

### 1. PostgreSQL Database
```
Name: timetable-db
Database: timetable_generator
User: timetable_user
Plan: Free (or paid)
```

### 2. Web Service Settings
```
Name: timetable-backend
Root Directory: api
Runtime: Python 3
Build Command: pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
Start Command: gunicorn ttg.wsgi:application --host 0.0.0.0 --port $PORT
```

### 3. Environment Variables (Copy External Database URL from PostgreSQL service)
```
DJANGO_SECRET_KEY=your-generated-secret-key
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=your-service-name.onrender.com
DATABASE_URL=postgresql://user:pass@host:port/db
CORS_ALLOW_ALL=False
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
CSRF_TRUSTED_ORIGINS=https://your-service-name.onrender.com
API_PREFIX=/api
```

## After Deployment

- [ ] **Test health check**: `https://your-service-name.onrender.com/health/`
- [ ] **Check API endpoints**: `https://your-service-name.onrender.com/api/`
- [ ] **Create superuser** (optional):
  ```bash
  # In Render Shell
  python manage.py setup_production --create-superuser
  ```
- [ ] **Load sample data** (optional):
  ```bash
  # In Render Shell
  python manage.py setup_production --load-sample-data
  ```

## Useful URLs After Deployment

- **API Base**: `https://your-service-name.onrender.com/api/`
- **Health Check**: `https://your-service-name.onrender.com/health/`
- **Admin Panel**: `https://your-service-name.onrender.com/admin/`

## Common Issues & Solutions

### Build Fails
- Check build logs in Render dashboard
- Verify `requirements.txt` has all dependencies
- Ensure `runtime.txt` has correct Python version

### Database Connection Error
- Copy the correct External Database URL from PostgreSQL service
- Ensure both services are in the same region

### Static Files Not Loading
- Verify whitenoise is in `requirements.txt`
- Check `collectstatic` runs in build command

### CORS Issues
- Add your frontend domain to `CORS_ALLOWED_ORIGINS`
- Include backend domain in `CSRF_TRUSTED_ORIGINS`

## Security Reminders

- ✅ `DJANGO_DEBUG=False` in production
- ✅ Strong `DJANGO_SECRET_KEY`
- ✅ Specific `ALLOWED_HOSTS` (not `*`)
- ✅ Proper CORS configuration
- ✅ Environment variables for secrets

---

You're all set! Follow the detailed guide in `RENDER_DEPLOYMENT_GUIDE.md` for complete instructions.
