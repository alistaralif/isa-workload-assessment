# --- Build Stage ---
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy project files
    COPY . .
    
    # Build Next.js (normal mode, not compile)
    RUN npm run build
    
    
    # --- Production Stage ---
    FROM node:20-alpine AS runner
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV PORT=3000
    
    # Copy build output and node_modules
    COPY --from=builder /app ./
    
    # Install production dependencies only
    RUN npm install --omit=dev
    
    EXPOSE 3000
    
    # Start Next.js
    CMD ["npm", "run", "start"]
    