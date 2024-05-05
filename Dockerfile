FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
ARG PORT
ARG REDISHOST
ARG REDISPORT
ARG OMNIVORE_API_KEY
ARG OMNIVORE_USER_ID
ARG MISTRAL_API_KEY

ENV PORT=${PORT}
ENV REDISHOST=${REDISHOST}
ENV REDISPORT=${REDISPORT}
ENV OMNIVORE_API_KEY=${OMNIVORE_API_KEY}
ENV OMNIVORE_USER_ID=${OMNIVORE_USER_ID}
ENV MISTRAL_API_KEY=${MISTRAL_API_KEY}

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# Install dependencies
RUN pnpm install -g pm2
RUN apt-get update && apt-get install curl -y

EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD curl -f http://localhost:${PORT}/health || exit 1
USER node
CMD ["pm2-runtime", "start", "dist/src/main.js"]
