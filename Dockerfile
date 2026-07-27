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

# Expose the API port (Hugging Face default port is 7860)
EXPOSE 7860

# Define environment variables (These should be passed in at runtime)
ENV NODE_ENV=production
ENV PORT=7860

# Start the engine API server in serve mode
CMD ["npx", "tsx", "bhrmshree.ts", "serve"]
