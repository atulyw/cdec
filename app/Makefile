# CloudBlitz App Makefile

.PHONY: help build up down logs clean test

# Default target
help:
	@echo "CloudBlitz App - Available Commands:"
	@echo ""
	@echo "  make up          - Start all services with Docker Compose"
	@echo "  make down        - Stop all services"
	@echo "  make build       - Build all Docker images"
	@echo "  make logs        - View logs from all services"
	@echo "  make clean       - Clean up containers and volumes"
	@echo "  make test        - Run tests for all services"
	@echo "  make frontend    - Start frontend in development mode"
	@echo "  make backend     - Start all backend services locally"
	@echo ""

# Docker Compose commands
up:
	docker-compose up --build

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

# Development commands
frontend:
	cd frontend && npm install && npm run dev

backend:
	@echo "Starting backend services..."
	@echo "Make sure MongoDB is running: docker run -d -p 27017:27017 --name mongo mongo:7"
	@echo "Starting auth service..."
	cd backend/auth-service && ./mvnw spring-boot:run &
	@echo "Starting course service..."
	cd backend/course-service && ./mvnw spring-boot:run &
	@echo "Starting enrollment service..."
	cd backend/enrollment-service && ./mvnw spring-boot:run &
	@echo "All backend services started!"

# Testing
test:
	@echo "Running frontend tests..."
	cd frontend && npm test
	@echo "Running backend tests..."
	cd backend/auth-service && ./mvnw test
	cd backend/course-service && ./mvnw test
	cd backend/enrollment-service && ./mvnw test

# Health checks
health:
	@echo "Checking service health..."
	@curl -s http://localhost:8081/api/auth/health || echo "Auth service not responding"
	@curl -s http://localhost:8082/api/courses/health || echo "Course service not responding"
	@curl -s http://localhost:8083/api/enroll/health || echo "Enrollment service not responding"
	@curl -s http://localhost:5173 || echo "Frontend not responding"
