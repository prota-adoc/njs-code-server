# Docker Node.js development workspace with PostgreSQL and Redis

A fully containerized Node.js development environment with PostgreSQL database, Redis caching/job queues, and code-server for browser-based development.

## Features

- **PostgreSQL**: Relational database with Prisma ORM
- **Redis**: In-memory cache and job queue support (using Bull)
- **Code-server**: VS Code in your browser
- **Docker Compose**: Multi-service orchestration with health checks
- **Hot reload**: Nodemon for automatic restart on file changes

## Quick Start

1. Copy `.env.example` to `.env` so Docker Compose can load the environment variables:

```bash
cp .env.example .env
```
2. Start all services with Docker Compose:

```bash
docker compose -f docker-compose.dev.yml up --build
```

3. Change owner of files

```bash
docker exec -u 0 -it node-dev chown -R coder:coder /home/coder/project
```


4. Open code-server at `http://localhost:8080` (password in `.env`)


# Install dependencies (run in code server terminal):

```bash
npm install
```

# Initialize the database:

```bash
npm run db:push
npm run db:seed
```

# Your Node app runs on `http://localhost:8080/proxy/3001/` and `http://localhost:3001/`

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check (DB + Redis status)
- `GET /tasks` - List all tasks
- `POST /tasks` - Create a new task
- `GET /cache-example` - Demo caching with Redis

## Database Commands

```bash
# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

## Services

- **Node App** (port 3001): Your application server
- **Code-server** (port 8080): Browser-based IDE
- **PostgreSQL** (port 5432): Database service
- **Redis** (port 6379): Cache and job queue service

## Environment Variables

See `.env.example` for all available options:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NODE_ENV`: Environment (development/production)
- `APP_PORT`: Application port (default: 3000)

## Project Structure

```
.
├── index.js               # Main application entry
├── package.json           # Dependencies and scripts
├── docker-compose.yml     # Services configuration
├── entrypoint.sh          # docker start script
├── Dockerfile             # Node.js container image
├── lib/
│   ├── db.js              # Prisma database client
│   ├── redis.js           # Redis client
│   └── jobs.js            # Bull job queue setup
└── prisma/
    ├── schema.prisma      # Database schema
    └── seed.js            # Sample data
```

## Development Workflow

1. Modify code in any editor - nodemon auto-reloads
2. Run DB migrations: `npm run db:migrate`
3. Check health: `curl http://localhost:3001/health`
4. View Redis UI: Use CLI or GUI tools
5. Commit code to version control
