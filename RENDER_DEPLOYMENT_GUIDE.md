# Deploying Time-Table-Generator Backend to Render

This guide will help you deploy your Django backend to Render with PostgreSQL database.

## Prerequisites

1. A GitHub account with your code pushed to a repository
2. A Render account (free tier available)
3. Your code should be on the branch you want to deploy

## Step-by-Step Deployment Process

### 1. Prepare Your Repository

Make sure your latest changes are pushed to GitHub:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main  # or your current branch
```

### 2. Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New"** → **"PostgreSQL"**
3. Fill in the details:
   - **Name**: `timetable-db` (or any name you prefer)
   - **Database**: `timetable_generator`
   - **User**: `timetable_user` (or any username)
   - **Region**: Choose closest to your location
   - **Plan**: Free (or paid if you need more resources)
4. Click **"Create Database"**
5. **IMPORTANT**: Copy the **External Database URL** from the database info page
   - It will look like: `postgresql://username:password@hostname:port/database_name`
   - You'll need this for the web service

### 3. Create Web Service on Render

1. In Render Dashboard, click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Fill in the service details:

   **Basic Info:**
   - **Name**: `timetable-backend` (or your preferred name)
   - **Region**: Same as your database
   - **Branch**: `main` (or your deployment branch)
   - **Root Directory**: `api` (since your Django app is in the api folder)
   - **Runtime**: `Python 3`

   **Build & Deploy:**
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `gunicorn ttg.wsgi:application --host 0.0.0.0 --port $PORT`

### 4. Configure Environment Variables

In the web service settings, add these environment variables:

**Required Variables:**
```
DJANGO_SECRET_KEY=your-super-secret-key-here-generate-a-new-one
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=your-service-name.onrender.com
DATABASE_URL=your-postgresql-external-url-from-step-2
CORS_ALLOW_ALL=False
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
CSRF_TRUSTED_ORIGINS=https://your-service-name.onrender.com
API_PREFIX=/api
```

**How to set environment variables:**
1. Go to your web service dashboard
2. Click on **"Environment"** tab
3. Add each variable with **"Add Environment Variable"**

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will automatically start building and deploying
3. Watch the build logs for any errors
4. Once deployed, your API will be available at: `https://your-service-name.onrender.com`

### 6. Test Your Deployment

Test your API endpoints:
- Health check: `https://your-service-name.onrender.com/api/`
- Admin panel: `https://your-service-name.onrender.com/admin/`

### 7. Create Superuser (Optional)

If you need admin access:
1. Go to your web service dashboard
2. Click on **"Shell"** tab
3. Run: `python manage.py createsuperuser`
4. Follow the prompts to create an admin user

## Important Notes

### Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- Database has storage limits
- First request after sleep may be slow (30-60 seconds)

### Security Considerations
- Never use `DJANGO_DEBUG=True` in production
- Generate a strong `DJANGO_SECRET_KEY`
- Set proper `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
- Use environment variables for all sensitive data

### Database Management
- Your PostgreSQL database URL is automatically provided by Render
- Migrations run automatically during deployment
- Database persists between deployments

### Troubleshooting

**Build Fails:**
- Check build logs in Render dashboard
- Ensure all dependencies are in `requirements.txt`
- Verify Python version in `runtime.txt`

**Database Connection Issues:**
- Verify `DATABASE_URL` environment variable
- Check if database service is running
- Ensure database and web service are in same region

**Static Files Issues:**
- Verify `collectstatic` runs in build command
- Check whitenoise is installed and configured

**CORS Issues:**
- Update `CORS_ALLOWED_ORIGINS` with your frontend domain
- Ensure `CSRF_TRUSTED_ORIGINS` includes your backend domain

## Next Steps

1. Update your frontend API URL to point to your Render service
2. Test all endpoints thoroughly
3. Set up monitoring and alerts if needed
4. Consider upgrading to paid plan for production use

## Useful Commands

**View logs:**
```bash
# In Render dashboard → Your Service → Logs tab
```

**Run management commands:**
```bash
# In Render dashboard → Your Service → Shell tab
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic
```

Your Django backend should now be successfully deployed on Render! 🚀
