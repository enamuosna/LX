FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx medusa build

FROM node:22-bookworm-slim
ENV NODE_ENV=production MEDUSA_DISABLE_TELEMETRY=1
WORKDIR /app
COPY --from=build /app/.medusa/server ./
RUN npm install --omit=dev --no-audit --no-fund
COPY docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh && mkdir -p /app/static
EXPOSE 9000
ENTRYPOINT ["entrypoint.sh"]
