# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Accept build arguments for environment variables
ARG VITE_AUTH_API
ARG VITE_COURSE_API
ARG VITE_ENROLL_API

# Set environment variables for build
ENV VITE_AUTH_API=$VITE_AUTH_API
ENV VITE_COURSE_API=$VITE_COURSE_API
ENV VITE_ENROLL_API=$VITE_ENROLL_API

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 5173 (as specified in requirements)
EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
