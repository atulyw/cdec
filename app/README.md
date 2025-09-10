# CloudBlitz Student App

A minimal mono-repo for a CloudBlitz student application with React frontend and Spring Boot microservices.

## 🏗️ Architecture

### Frontend
- **Technology**: React with Vite, TypeScript, and Tailwind CSS
- **Hosting**: https://cloudblitz.in (production)
- **Local Development**: http://localhost:5173

### Backend Services
- **Technology**: Spring Boot 3.2.0 with Java 21
- **Hosting**: https://api.cloudblitz.in (production)
- **Local Development**: http://localhost:8081-8083

### Database
- **Technology**: MongoDB
- **Local Development**: mongodb://localhost:27017

## 📁 Project Structure

```
app/
├── frontend/                 # React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # Auth context
│   │   └── utils/           # API utilities
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── auth-service/        # JWT authentication service
│   ├── course-service/      # Course CRUD operations
│   └── enrollment-service/  # User enrollments
├── docker-compose.yml       # Local development setup
└── README.md
```

## 🚀 Services Overview

### 1. Auth Service (Port 8081)
- **Endpoints**: `/register`, `/login`, `/me`, `/health`
- **Database**: `cb_auth`
- **Features**: JWT-based authentication with HS256

### 2. Course Service (Port 8082)
- **Endpoints**: `/` (CRUD), `/health`
- **Database**: `cb_courses`
- **Features**: Course management with 3 demo courses seeded on startup

### 3. Enrollment Service (Port 8083)
- **Endpoints**: `/` (list, enroll), `/health`
- **Database**: `cb_enrollments`
- **Features**: User enrollment management with JWT validation

## 🌐 Domain Configuration

### Production URLs
- **Frontend**: https://cloudblitz.in
- **Backend APIs**: https://api.cloudblitz.in
- **CORS**: All backend services allow requests from https://cloudblitz.in

### Local Development URLs
- **Frontend**: http://localhost:5173
- **Auth Service**: http://localhost:8081
- **Course Service**: http://localhost:8082
- **Enrollment Service**: http://localhost:8083
- **MongoDB**: mongodb://localhost:27017

## 🛠️ Setup Instructions

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Java 21 (for local backend development)
- Maven 3.6+ (for local backend development)

### Option 1: Docker Compose (Recommended)

1. **Clone and navigate to the project**:
   ```bash
   git clone <repository-url>
   cd app
   ```

2. **Start all services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Auth Service: http://localhost:8081/api/auth/health
   - Course Service: http://localhost:8082/api/courses/health
   - Enrollment Service: http://localhost:8083/api/enroll/health

### Option 2: Local Development

#### Backend Services

1. **Start MongoDB**:
   ```bash
   docker run -d -p 27017:27017 --name mongo mongo:7
   ```

2. **Run each service individually**:
   ```bash
   # Auth Service
   cd backend/auth-service
   ./mvnw spring-boot:run

   # Course Service (in another terminal)
   cd backend/course-service
   ./mvnw spring-boot:run

   # Enrollment Service (in another terminal)
   cd backend/enrollment-service
   ./mvnw spring-boot:run
   ```

#### Frontend

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Create environment file**:
   ```bash
   cp env.example .env
   ```

3. **Update .env for local development**:
   ```env
   VITE_AUTH_API=http://localhost:8081/api/auth
   VITE_COURSE_API=http://localhost:8082/api/courses
   VITE_ENROLL_API=http://localhost:8083/api/enroll
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

### Backend Services
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `SERVER_PORT`: Port for the service (8081, 8082, 8083)

### Frontend
- `VITE_AUTH_API`: Auth service API URL
- `VITE_COURSE_API`: Course service API URL
- `VITE_ENROLL_API`: Enrollment service API URL

## 📱 Frontend Features

### Pages
- **Login/Register**: Authentication forms with validation
- **Dashboard**: Welcome page with course listing and enrollment
- **Enrollments**: User's enrolled courses with status tracking

### Components
- `LoginForm`: Authentication form with toggle between login/register
- `CourseList`: Displays available courses with enrollment buttons
- `EnrollmentsTable`: Shows user's enrollments with status
- `ProtectedRoute`: Route protection based on authentication

### Authentication
- JWT token stored in localStorage
- Automatic token validation
- Protected routes for authenticated users

## 🔐 API Endpoints

### Auth Service (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user (requires JWT)
- `GET /health` - Health check

### Course Service (`/api/courses`)
- `GET /` - List all courses
- `GET /{id}` - Get course by ID
- `POST /` - Create new course
- `PUT /{id}` - Update course
- `DELETE /{id}` - Delete course
- `GET /health` - Health check

### Enrollment Service (`/api/enroll`)
- `GET /` - Get user enrollments (requires JWT)
- `POST /` - Enroll in course (requires JWT)
- `GET /health` - Health check

## 🗄️ Database Schema

### Users Collection (`cb_auth`)
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "password": "string (bcrypt hashed)"
}
```

### Courses Collection (`cb_courses`)
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "instructor": "string",
  "duration": "number (hours)",
  "price": "number"
}
```

### Enrollments Collection (`cb_enrollments`)
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "courseId": "string",
  "courseTitle": "string",
  "enrolledAt": "datetime",
  "status": "string (active/completed/cancelled)"
}
```

## 🧪 Testing the Application

### 1. Register a new user
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### 3. Get courses
```bash
curl http://localhost:8082/api/courses/
```

### 4. Enroll in a course (replace TOKEN with actual JWT)
```bash
curl -X POST http://localhost:8083/api/enroll/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"courseId":"1"}'
```

## 🚀 Production Deployment

### Environment Variables for Production
```env
# Backend
MONGO_URI=mongodb://your-production-mongo-uri
JWT_SECRET=your-strong-jwt-secret

# Frontend
VITE_AUTH_API=https://api.cloudblitz.in/api/auth
VITE_COURSE_API=https://api.cloudblitz.in/api/courses
VITE_ENROLL_API=https://api.cloudblitz.in/api/enroll
```

### Build Commands
```bash
# Frontend
cd frontend
npm run build

# Backend services
cd backend/auth-service && ./mvnw clean package
cd backend/course-service && ./mvnw clean package
cd backend/enrollment-service && ./mvnw clean package
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure all backend services have CORS configured for `https://cloudblitz.in`

2. **JWT Token Issues**: Verify JWT_SECRET is the same across auth and enrollment services

3. **MongoDB Connection**: Check MongoDB is running and accessible

4. **Port Conflicts**: Ensure ports 8081-8083 and 5173 are available

### Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth-service
docker-compose logs -f course-service
docker-compose logs -f enrollment-service
docker-compose logs -f frontend
```

## 📝 Development Notes

- All services use consistent JSON response format: `{ success: boolean, data: any, error: string }`
- JWT tokens expire after 24 hours
- Demo courses are automatically seeded when course service starts
- Frontend uses absolute URLs for API calls (configurable via environment variables)
- All services include health check endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
