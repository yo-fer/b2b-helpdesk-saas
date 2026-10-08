FROM node:20-bookworm-slim

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends git procps curl \
    && npm install -g pnpm@9 \
    && npm install -g @nestjs/cli

WORKDIR /workspace