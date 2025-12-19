
# Harmonic

Harmonic is an app that connects people through shared musical taste!

## Installation

### Requirements

Install [Docker](https://www.docker.com/products/docker-desktop/) on your system.

### Start project

Use the following command to build and launch the full environment. It installs all required dependencies automatically.

```bash
docker-compose up --build
```

### Development

Open the development environment with this command:

```bash
npm run dev
```

### Database

The project uses Drizzle ORM for schema management. SQL generation and execution require manual steps. Apply them in order:

```bash
npx drizzle-kit generate

npx drizzle-kit migrate

npx drizzle-kit push

```

Access the Drizzle Studio interface for database inspection and management with:

```bash
npx drizzle kit studio
```











