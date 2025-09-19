# ===== Development image =====
FROM node:20-alpine AS dev
WORKDIR /app

# Salin manifest dulu agar cache npm ci efisien
COPY package*.json ./
RUN npm ci

# Default env untuk dev
# ENV NODE_ENV=development
# ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3123

CMD ["npm","run","dev","--","-H","0.0.0.0","-p","3123"] 

