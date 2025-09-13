# Getting Started: Complete Setup Guide for New GitHub Users

## Step 1: Clone the Project to Your System

1. **Install Git** (if not already installed):
   - Download and install Git from: https://git-scm.com/download/windows
   - Follow the installation wizard with default settings.

2. **Clone the repository**:
   - Open VS Code.
   - Open the terminal in VS Code (`Ctrl+`` or from the menu: Terminal > New Terminal).
   - Navigate to where you want to save the project (e.g., Desktop):
   ```
   cd Desktop
   ```
   - Clone the repository:
   ```
   git clone https://github.com/Mithlesh-95/Time-Table-Generator.git
   ```
   - Navigate into the project folder:
   ```
   cd Time-Table-Generator
   ```

## Step 2: Switch from Main Branch to Your Module Branch

After you have cloned the project to your system, follow these steps to switch from the main branch to your assigned module branch using the VS Code terminal:

1. Make sure you are in the project directory (should already be there from Step 1).
2. List all available branches to confirm they exist:
   ```
   git branch -a
   ```
3. Switch to your assigned branch:
   ```
   git checkout <your-branch-name>
   ```
   Replace `<your-branch-name>` with the branch for your module (see the list below).

**Example:**
```
git checkout module-3-curriculum-management
```

4. Verify you're on the correct branch:
   ```
   git branch
   ```
   (The current branch will be highlighted with an asterisk *)

Now you can start working in your module branch!

## Project Structure & Folder Guidelines

**Frontend Team (Module 5):**
- Use the `frontend/` folder for all React.js, HTML, CSS, JavaScript files
- **Deployment:** Will be hosted on **Vercel** for optimal frontend performance

**Backend Team (Modules 1, 2, 3, 4, 6):**
- Use the `api/` folder for all backend development
- Create your Django APIs, database models, and business logic here
- **Deployment:** Will be hosted on **Render** for optimal Python/Django performance

**Why this hosting strategy?**
- **Vercel** → Perfect for React.js frontend (fast, reliable, easy deployment)
- **Render** → Perfect for Python/Django backend (better than Vercel for server-side logic)
- Separate hosting allows independent scaling and optimization
- Frontend can easily connect to backend via API calls

# Team Guide: Getting Started

All module branches have already been created. Each team member should:

1. Identify your assigned module and its corresponding branch from the list below.
2. Switch to your module branch using:
   - `git checkout <your-branch-name>`
3. Work only in your respective branch. When pushing or pulling code, always do so with respect to your module branch:
   - To push: `git push origin <your-branch-name>`
   - To pull: `git pull origin <your-branch-name>`

**Branch names:**
- `module-1-user-auth-system`
- `module-2-master-data-management`
- `module-3-curriculum-management`
- `module-4-scheduling-algorithm`
- `module-5-frontend-ui`
- `module-6-report-generation`

Do not add code or implementation details to this README; use it only as a reference for module responsibilities and project structure. Begin development in your branch, following the module guidelines. Use this document as a guide for your tasks and inter-module dependencies.

# 🎓 NEP 2020 Compliant AI-Based Timetable Generator

## 📋 Team Collaboration Guide for Beginners

> **Project Repository:** [Time-Table-Generator](https://github.com/Mithlesh-95/Time-Table-Generator)

This project addresses the complex scheduling challenges introduced by NEP 2020's flexible curriculum structure. Here's a comprehensive module breakdown for our **6-member team** working in parallel.


## 🚀 Getting Started for Team Members

### 📋 Prerequisites
1. **Git** installed on your system
2. **Python 3.8+** for backend modules
3. **Node.js 16+** for frontend module
4. **PostgreSQL** for database

**Start development** following your module guidelines

### 📝 Collaboration Guidelines

#### 🔄 Git Workflow for Beginners

1. **Always pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Work on your feature branch:**
   ```bash
   git add .
   git commit -m "Add: Module X feature description"
   ```

3. **Push your changes:**
   ```bash
   git push origin feature/module-X-your-name
   ```

4. **Create Pull Request** on GitHub

#### 📞 Communication Channels
- **Daily Standups:** 7:00 PM
- **Team Chat:** Whatsapp Group
- **Code Reviews:** All PRs require 1 approval

---

## 🎯 Success Metrics

- ✅ **Individual Module Completion:** 100%
- ✅ **Integration Success:** All modules working together
- ✅ **Code Quality:** Passes all tests and reviews
- ✅ **Documentation:** Complete API and user docs
- ✅ **Deployment:** Successfully deployed and accessible

---

**💡 This modular approach ensures parallel development while maintaining clear boundaries and dependencies. Each team member can work independently while contributing to the overall system functionality.**

---

### 📞 Need Help?
- Check the [Wiki](https://github.com/Mithlesh-95/Time-Table-Generator/wiki)
- Create an [Issue](https://github.com/Mithlesh-95/Time-Table-Generator/issues)

