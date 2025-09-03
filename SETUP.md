# 🚀 MannMitra Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git

## 🏗️ Project Structure
```
mannmitra/
├── backend-api/     # Node.js + Express backend
├── frontend/        # React + TypeScript frontend
├── mobile-app/      # React Native mobile app
└── docs/           # Documentation
```

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd mannmitra
```

### 2. Backend Setup
```bash
cd backend-api

# Install dependencies
npm install

# Copy environment template
cp env.template .env

# Edit .env with your configuration
# Required: DB_*, JWT_SECRET, SESSION_SECRET

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### 4. Mobile App Setup (Optional)
```bash
cd mobile-app

# Install dependencies
npm install

# iOS (requires macOS)
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## 🔧 Environment Configuration

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mannmitra_db
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key
```

### Frontend
- No environment variables needed for development
- Backend URL is configured in `src/services/api.ts`

## 🗄️ Database Setup

1. **Install PostgreSQL**
2. **Create database:**
   ```sql
   CREATE DATABASE mannmitra_db;
   ```
3. **Run migrations (when available):**
   ```bash
   cd backend-api
   npm run migrate
   ```

## 🧪 Testing the Setup

1. **Backend health check:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Frontend:**
   - Open http://localhost:3000
   - Try the OTP login flow

## 🚨 Troubleshooting

### Common Issues
- **Port 5000 already in use:** Change PORT in .env
- **Database connection failed:** Check PostgreSQL is running
- **OTP not working:** Check backend logs for errors

### Backend Logs
Look for:
- ✅ Database connection established
- ✅ Session middleware initialized
- ✅ Server running on port 5000

### Frontend Issues
- Check browser console for errors
- Verify backend is running
- Check network tab for API calls

## 🤝 Team Development

### Git Workflow
1. **Create feature branch:** `git checkout -b feature/your-feature`
2. **Make changes and commit:** `git add . && git commit -m "Add feature"`
3. **Push and create PR:** `git push origin feature/your-feature`

### Code Standards
- Use meaningful commit messages
- Test your changes before pushing
- Update documentation for new features

## 📱 Features to Work On

- [ ] Dashboard UI/UX improvements
- [ ] AI Chat integration
- [ ] Mood tracking analytics
- [ ] Activity recommendations
- [ ] Mobile app development
- [ ] Testing and quality assurance

## 🆘 Need Help?

- Check the backend logs for errors
- Review the API documentation
- Ask in team chat/standup
- Check GitHub issues

---

**Happy Coding! 🎉**
