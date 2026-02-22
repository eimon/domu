# =========================
# Base (misma imagen en todos los stages)
# =========================
FROM node:24-alpine AS base
WORKDIR /app

# =========================
# Deps: instala dependencias UNA sola vez
# =========================
FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

# =========================
# Dev: hot reload (sin build)
# =========================
FROM base AS dev

ENV NODE_ENV=development

# Reutiliza node_modules del stage deps
COPY --from=deps /app/node_modules ./node_modules

# El código se monta por volumen (NO se copia acá)
EXPOSE 3000

CMD ["npm", "run", "dev"]

# =========================
# Builder: build de Next
# =========================
FROM base AS builder

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# =========================
# Runner: producción
# =========================
FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Usuario no-root (buena práctica)
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npm", "run", "start"]