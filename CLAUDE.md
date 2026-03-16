# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
node app.js                # Start server (port 3000, 16 cluster workers)
docker-compose up -d       # Start API + MySQL + MongoDB via Docker
docker-compose down        # Stop all containers
```

No `npm install` needed for local dev — dependencies are committed in `node_modules/`. For Docker, `npm install` runs inside the container to rebuild native modules for Linux.

## Architecture

Early-era Node.js project (Express 2.5, Node 0.10.x). Entry point is `app.js` which uses the `cluster` npm package (not the built-in module) to spawn 16 workers.

**Request flow:** `app.js` → `boot.js` (auto-discovers controllers, maps exported function names to route patterns) → `controller/data/*.js` → response (XML or JSON)

### Key patterns

- **`boot.js` convention-based routing:** Recursively walks `controller/`, requires each file, and maps exported function names (`index`, `city`, `area`, `meituan`, `hao123v2`, `tuan800`) to route patterns. The function name determines the route type (e.g. `meituan` → regex-based path, `city` → `/city/:city`).
- **Dual database:** `meituan` and `city` controllers use MySQL (`dao/common.js`); `hao123v2` and `tuan800` use MongoDB via Mongoose (`dao/mongodb.js`).
- **Config files** in `config/` hold DB credentials (`database.js`, `mongodb.js`) and parameter mappings (`contant.js` for meituan price/category/order constants).
- **Response formats:** All endpoints support `.json` and `.xml` via the `:type` path param. Default is XML. Each controller has its own `_rebuild` function for format conversion.
- **Gzip compression:** hao123v2 and tuan800 responses are gzip-compressed.
- **No package.json originally** — `package.json` was added for Docker builds. Dependencies are pinned to their committed versions.

## Environment Variables

Used by `config/database.js` and `config/mongodb.js` with localhost defaults:

- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `MONGODB_URI`

## Dependencies (committed in node_modules)

express 2.5.0, cluster 0.7.7, mongoose 2.3.13, mysql 0.9.4, gzip 0.1.0, libxmljs 0.4.2
