FROM node:20.11-slim as dependencies
WORKDIR /app

# Install pnpm and build dependencies
RUN npm install -g pnpm@9.4.0 && \
    apt-get update -qq && \
    apt-get install -y python3 build-essential && \
    rm -rf /var/lib/apt/lists/*

# Create the environments directory and env file FIRST
RUN mkdir -p src/environments && \
    echo "PLAYWRIGHT_BROWSERS_PATH=/app/pw-browsers" > src/environments/browser-path.env

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies and extra packages needed for content generation
ENV PLAYWRIGHT_BROWSERS_PATH=/app/pw-browsers
ENV HUSKY=0
RUN pnpm install && \
    pnpm playwright install chromium

# Content generation stage
FROM dependencies as content-builder
WORKDIR /app

# Copy source files
COPY . .

# Copy over the node_modules and Playwright browsers
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/pw-browsers ./pw-browsers
COPY --from=dependencies /app/src/environments/browser-path.env ./src/environments/browser-path.env

# First generate the content
RUN pnpm run epub & pnpm run social-previews:build & wait

# Run just the Astro build
RUN pnpm exec astro build --experimental-integrations || if [ -d "dist" ]; then \
        exit 0; \
    else \
        exit 1; \
    fi

# Production stage for static files
FROM nginx:alpine
COPY --from=content-builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
