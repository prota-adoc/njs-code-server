FROM node:20-bullseye

# Install prerequisites and code-server
RUN apt-get update \
  && apt-get install -y curl ca-certificates build-essential git \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://code-server.dev/install.sh | sh

# Prvo kopiramo entrypoint dok smo još uvek ROOT korisnik
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Kreiranje korisnika i postavljanje prava unutar home direktorijuma
RUN useradd -m -s /bin/bash coder
WORKDIR /home/coder/project
RUN chown -R coder:coder /home/coder

# Tek sada prelazimo na ne-privilegovanog korisnika
USER coder
ENV HOME=/home/coder

EXPOSE 3000

# Pozivamo entrypoint sa sigurne lokacije koja se ne preklapa sa volumenom
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]