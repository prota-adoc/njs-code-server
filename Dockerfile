FROM node:20-bullseye

# Install prerequisites and code-server
RUN apt-get update \
  && apt-get install -y curl ca-certificates build-essential git \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://code-server.dev/install.sh | sh

# Create a user to avoid running as root
RUN useradd -m coder
WORKDIR /home/coder/project
RUN chown -R coder:coder /home/coder

USER coder
ENV HOME=/home/coder

EXPOSE 8080

# Apply git identity from env vars if provided, then start code-server
CMD ["sh", "-c", "if [ -n \"$GIT_USER_NAME\" ]; then git config --global user.name \"$GIT_USER_NAME\"; fi; if [ -n \"$GIT_USER_EMAIL\" ]; then git config --global user.email \"$GIT_USER_EMAIL\"; fi; exec code-server --bind-addr '0.0.0.0:8080' --auth 'password' ."]
