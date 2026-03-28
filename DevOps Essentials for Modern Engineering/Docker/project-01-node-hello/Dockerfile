# build stage — install npm packages here
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

# final stage — only what we need to run the app
FROM node:20-alpine AS final
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY server.js package.json ./
EXPOSE 3000
CMD ["node", "server.js"]
