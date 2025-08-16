# Build stage
FROM docker.io/oven/bun:latest AS build
WORKDIR /app

ENV NODE_ENV=production

COPY . .
RUN bun install --frozen-lockfile
RUN bun build --compile --target bun --minify --outfile server ./src/index.ts

# Run stage
FROM docker.io/alpine:latest AS runner
WORKDIR /app

USER 65532:65532

COPY --from=build --chown=65532:65532 /app/server /app/server

EXPOSE 3000/tcp
ENTRYPOINT ["/app/server"]
