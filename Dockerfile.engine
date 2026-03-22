# Use the official Microsoft Playwright image as the base.
# This image comes pre-installed with Node.js and all the required Linux
# system dependencies (libgbm, libnss3, etc.) to run Chromium/WebKit headlessly.
FROM mcr.microsoft.com/playwright:v1.49.0-jammy

# Set working directory
WORKDIR /app

# Copy package metadata securely
COPY package.json package-lock.json* ./

# Install dependencies (including TypeScript, Express, Supabase SDK, AI SDKs)
RUN npm install

# Copy the rest of the backend codebase
# (Excludes dashboard/ and mcp/ via .dockerignore)
COPY . .

# Expose the API port that the Next.js dashboard will talk to
EXPOSE 4005

# Define environment variables (These should be passed in at runtime)
ENV NODE_ENV=production
ENV PORT=4005

# Start the engine API server using tsx
CMD ["npx", "tsx", "engine/server.ts"]
