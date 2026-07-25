FROM node:24-alpine AS base
WORKDIR /opt/app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /opt/app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /opt/app/node_modules ./node_modules
COPY . .
EXPOSE 1337
CMD ["npm", "run", "develop"]

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/dist ./dist
COPY --from=builder /opt/app/build ./build
COPY . .
EXPOSE 1337
CMD ["npm", "run", "start"]
