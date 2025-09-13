# Time Table Generator - Setup Instructions

## For New Team Members

### 1. Clone the Repository
```bash
git clone https://github.com/Mithlesh-95/Time-Table-Generator.git
cd Time-Table-Generator
```

### 2. Backend Setup (Django API)

#### Prerequisites
- Python 3.8+ installed
- PostgreSQL or use Neon (free cloud database)

#### Steps:
```bash
# Navigate to API folder
cd api

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Database Setup (Choose one option):

**Option A: Use your own Neon database (Recommended)**
1. Go to [Neon.tech](https://neon.tech) and create free account
2. Create new database
3. Copy the connection string
4. Create `.env` file in `api/` folder:
```env
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
DEBUG=True
SECRET_KEY=your-secret-key-here
CORS_ALLOW_ALL_ORIGINS=True
```

**Option B: Use shared database (Ask team lead for DATABASE_URL)**

#### Run Migrations & Create Superuser:
```bash
# Apply database migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Load sample data (optional)
python create_sample_data.py

# Start Django server
python manage.py runserver
```

### 3. Frontend Setup (Next.js)

```bash
# Navigate to frontend folder
cd Frontend/basic_ui

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

### 5. Test the Setup

1. Go to http://localhost:3000
2. Navigate to "Add Data" from the menu
3. Try adding a department or faculty member
4. Check if data appears in the lists

### 6. API Endpoints

The following endpoints are available:
- `/api/departments/` - Departments CRUD
- `/api/faculty/` - Faculty CRUD + bulk upload
- `/api/students/` - Students CRUD + bulk upload  
- `/api/rooms/` - Rooms CRUD
- `/api/subjects/` - Subjects CRUD
- `/api/sections/` - Sections CRUD

### 7. Authentication

The API uses JWT authentication. Tokens are automatically handled by the frontend.

### Troubleshooting

#### Database Connection Issues:
- Check your DATABASE_URL in `.env`
- Ensure your database is running
- Try running `python manage.py dbshell` to test connection

#### CORS Issues:
- Make sure `CORS_ALLOW_ALL_ORIGINS=True` is in your `.env`
- Check that Django server is running on port 8000

#### Frontend Issues:
- Clear browser cache
- Check if backend is running
- Look for errors in browser console

### Project Structure

```
Time-Table-Generator/
├── api/                          # Django backend
│   ├── ttg/                     # Main Django project
│   ├── master_data/             # Master data app
│   ├── requirements.txt         # Python dependencies
│   ├── manage.py               # Django management
│   └── create_sample_data.py   # Sample data script
├── Frontend/basic_ui/           # Next.js frontend
│   ├── app/                    # App router pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities and API client
│   └── types/                  # TypeScript definitions
└── README.md                   # This file
```

### Need Help?

1. Check existing issues in the repository
2. Ask team members in the group chat
3. Refer to Django and Next.js documentation
