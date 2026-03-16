# Meituan RESTful API

A RESTful API aggregating deal data from Meituan and other Chinese group-buying platforms (Hao123 Tuan, Tuan800). Built as a personal Node.js learning project, it ran in a production environment for several months.

> **Note:** Meituan has since discontinued the API this project depended on, so it is no longer functional against live data. The code is preserved here for reference.

## Data Sources

| Controller | Database | Description |
|---|---|---|
| `meituan` | MySQL | Meituan deals — queried via SQL with city/area/price/category filters |
| `hao123v2` | MongoDB | Hao123 aggregated deals — Mongoose queries with full-text search |
| `tuan800` | MongoDB | Tuan800 deals — Mongoose queries with shop-area and tag filters |
| `city` | MySQL | City/area lookup — hierarchical city tree |

## Prerequisites

- Node.js 0.10.x (Express 2.5 era)
- MySQL with the `meituan` schema (tables: `ware`, `navsite`, `category`, `city`)
- MongoDB with `hao123v2` and `tuan800` databases (collection: `urls`)

## Setup

1. Fill in MySQL connection credentials in `config/database.js`.
2. Set the MongoDB connection string in `config/mongodb.js` (default: `mongodb://localhost/`).
3. Ensure all deal data is pre-populated in the databases.
4. Start the server:

```bash
node app.js
```

The server starts on port 3000 with 16 cluster workers.

## API Endpoints

All endpoints support `.json` and `.xml` response formats (default: `xml`).

### Meituan Deals

```
GET /data/meituan.:type?/city/:city/area/:area/price/:price/category/:category/order/:order/k/:keyword/pagesize/:pagesize/page/:page
```

All path segments after the format are optional. Examples:

```
GET /data/meituan.json
GET /data/meituan.xml/city/beijing
GET /data/meituan.json/city/beijing/category/cm/order/jg-desc/page/2
```

**Parameters:**
- `price`: `a` (0-50), `b` (50-100), `c` (100-150), `d` (200+)
- `category`: `cm`, `xy`, `mb`, `sf`, `wg`, `qt`
- `order`: `jg` (price), `zk` (rebate), `gm` (bought) + `-asc`/`-desc`
- `k`: keyword search in title and detail

### City Lookup

```
GET /data/city.:type?             # List all cities
GET /data/city.:type?/city/:city  # Get areas in a city
GET /data/city.:type?/city/:city/area/:area  # Get sub-areas
```

### Hao123 & Tuan800 Deals

```
GET /data/hao123v2.:type?/key/:key/city/:city/...
GET /data/tuan800.:type?/key/:key/city/:city/...
```

These support additional filters: `range`, `price` (min-max), `rebate`, `category`, `subcategory`, `start`/`end` dates, `order`, `k` (keyword), `pagesize`, `page`.

## Docker

```bash
docker-compose up -d
```

This starts the API server, MySQL, and MongoDB. See `docker-compose.yml` for configuration.

## Architecture

```
app.js              # Entry point — Express + cluster (16 workers, port 3000)
boot.js             # Auto-discovers controllers, maps actions to routes
config/
  database.js       # MySQL connection config
  mongodb.js        # MongoDB connection string
  contant.js        # Meituan parameter mappings (price ranges, categories, sort fields)
  hao123v2.js       # Hao123 sort field config
  tuan800.js        # Tuan800 sort field config
controller/data/
  meituan.js        # Meituan deals — MySQL queries, XML/JSON response builder
  hao123v2.js       # Hao123 deals — MongoDB/Mongoose queries with gzip response
  tuan800.js        # Tuan800 deals — MongoDB/Mongoose queries with gzip response
  city.js           # City/area hierarchy — MySQL queries
dao/
  common.js         # MySQL client factory
  mongodb.js        # MongoDB/Mongoose client factory with schema definitions
```

`boot.js` auto-loads all files under `controller/` and maps exported function names (`index`, `city`, `area`, `meituan`, `hao123v2`, `tuan800`) to corresponding route patterns via convention.

## Dependencies

All dependencies are committed in `node_modules/` (no `package.json` in the original project):

- express 2.5.0
- cluster 0.7.7
- mongoose 2.3.13
- mysql 0.9.4
- gzip 0.1.0
- libxmljs 0.4.2

## License

MIT
