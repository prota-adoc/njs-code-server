# ---------------- DEV ----------------
FROM node:20-bullseye AS development

RUN apt-get update \
  && apt-get install -y curl ca-certificates build-essential git \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://code-server.dev/install.sh | sh

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN useradd -m -s /bin/bash coder
WORKDIR /home/coder/project
RUN chown -R coder:coder /home/coder

USER coder
ENV HOME=/home/coder

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]


# ---------------- BUILD ----------------
FROM node:20-bullseye AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm install


# ---------------- PROD ----------------
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=build /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main.js"]