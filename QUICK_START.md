# MannMitra - Quick Start Guide

## 🚀 Getting Started

This guide will help you set up and run the MannMitra AI Mental Wellness Platform in under 30 minutes.

### Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**
- **OpenAI API Key** (for AI features)
- **Twilio Account** (for SMS/OTP)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/mannmitra.git
cd mannmitra
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend-api

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your configuration
# Required: DB_*, JWT_SECRET, OPENAI_API_KEY
nano .env
```

### 3. Database Setup

```bash
# Create PostgreSQL database
createdb mannmitra_db

# Run migrations (when available)
npm run migrate

# Seed initial data (when available)
npm run seed
```

### 4. Start Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

### 5. Test the API

```bash
# Health check
curl http://localhost:5000/health

# Should return:
# {
#   "status": "OK",
#   "message": "MannMitra API is running",
#   "timestamp": "2024-01-01T00:00:00.000Z"
# }
```

### 6. Mobile App Setup (Optional)

```bash
# Navigate to mobile app
cd ../mobile-app

# Install dependencies
npm install

# iOS (requires macOS)
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in `backend-api/` with:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mannmitra_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_here

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/auth/send-otp` | POST | Send OTP |
| `/api/auth/verify-otp` | POST | Verify OTP & login |
| `/api/chat/start-session` | POST | Start chat session |
| `/api/chat/send` | POST | Send message to AI |
| `/api/mood/log` | POST | Log mood entry |
| `/api/crisis/detect` | POST | Crisis detection |

## 🧪 Testing

### API Testing

```bash
# Install test dependencies
npm install --save-dev jest supertest

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Manual Testing

1. **Send OTP**
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'
```

2. **Verify OTP**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456",
    "userData": {
      "name": "Test User",
      "age": 25,
      "gender": "male",
      "location": "Mumbai",
      "education_level": "graduate",
      "occupation": "student"
    }
  }'
```

3. **Start Chat Session**
```bash
curl -X POST http://localhost:5000/api/chat/start-session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check PostgreSQL is running
   sudo service postgresql status
   
   # Create database if it doesn't exist
   createdb mannmitra_db
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   
   # Kill process
   kill -9 <PID>
   ```

3. **OpenAI API Error**
   - Verify your API key is correct
   - Check your OpenAI account has credits
   - Ensure the key has proper permissions

4. **Node Modules Issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Logs

```bash
# View application logs
tail -f logs/app.log

# View error logs
tail -f logs/error.log
```

## 📱 Mobile App Development

### Prerequisites for Mobile

- **React Native CLI**
- **Android Studio** (for Android)
- **Xcode** (for iOS, macOS only)
- **Java Development Kit (JDK)**

### Setup Mobile Environment

```bash
# Install React Native CLI
npm install -g react-native-cli

# Install Android Studio and configure ANDROID_HOME
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Run Mobile App

```bash
# Start Metro bundler
npx react-native start

# Run on Android
npx react-native run-android

# Run on iOS
npx react-native run-ios
```

## 🔒 Security Considerations

### Development

1. **Never commit `.env` files**
2. **Use strong JWT secrets**
3. **Enable HTTPS in production**
4. **Implement rate limiting**
5. **Validate all inputs**

### Production

1. **Use environment-specific configurations**
2. **Enable database encryption**
3. **Implement proper logging**
4. **Set up monitoring and alerts**
5. **Regular security audits**

## 📊 Monitoring

### Health Checks

```bash
# API Health
curl http://localhost:5000/health

# Database Health
curl http://localhost:5000/health/db

# AI Service Health
curl http://localhost:5000/health/ai
```

### Metrics

- **Response Time**: < 200ms
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%
- **Memory Usage**: < 80%

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t mannmitra-api .

# Run container
docker run -p 5000:5000 --env-file .env mannmitra-api
```

### Cloud Deployment

1. **AWS**
   - Use Elastic Beanstalk
   - Configure RDS for PostgreSQL
   - Set up CloudFront for CDN

2. **Azure**
   - Use App Service
   - Configure Azure Database
   - Set up Azure CDN

3. **Google Cloud**
   - Use App Engine
   - Configure Cloud SQL
   - Set up Cloud CDN

## 📚 Next Steps

1. **Read the full documentation** in `/docs/`
2. **Review the implementation plan** in `IMPLEMENTATION_PLAN.md`
3. **Join the development team** on Slack/Discord
4. **Contribute to the project** by submitting PRs
5. **Report issues** on GitHub

## 🤝 Support

- **Documentation**: `/docs/`
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@mannmitra.com

---

**Happy Coding! 🎉**

*Remember: Mental health support should be accessible to everyone. Let's build something that makes a real difference.*
