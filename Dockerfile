# syntax=docker/dockerfile:1

########## base ##########
FROM node:24-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

########## deps de produção ##########
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

########## dev (usado pelo docker compose) ##########
FROM base AS dev
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY --chown=node:node . .
USER node
EXPOSE 3000
CMD ["npm", "run", "dev"]

########## produção ##########
FROM base AS prod
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
