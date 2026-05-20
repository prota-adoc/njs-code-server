#!/bin/sh

# Postavi Git konfiguraciju ako su varijable prosleđene
if [ -n "$GIT_USER_NAME" ]; then
    git config --global user.name "$GIT_USER_NAME"
fi

if [ -n "$GIT_USER_EMAIL" ]; then
    git config --global user.email "$GIT_USER_EMAIL"
fi

# Pokreni glavnu aplikaciju
exec code-server --bind-addr '0.0.0.0:8080' --config /dev/null .