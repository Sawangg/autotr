# Create base
FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# Install packages
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile --production

# Prepare the app
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun run build

# Run the app
FROM base AS release
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=prerelease /usr/src/app/package.json .
COPY --from=prerelease /usr/src/app/dist dist

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "start" ]
