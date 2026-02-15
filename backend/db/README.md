# Postgres Migration Files

This folder contains the SQL needed to migrate the current JSON data into a
Postgres database.

Files:
- `backend/db/schema.sql` creates tables.
- `backend/db/seed.sql` inserts the current data.

How to use:
1. Create a database in Postgres.
2. Run `schema.sql`, then `seed.sql` on that database.

Example:
```
psql -d your_db_name -f backend/db/schema.sql
psql -d your_db_name -f backend/db/seed.sql
```

Notes:
- The backend still uses `backend/data/store.json` until we wire Postgres into
  `backend/server.js`.
- Tell me your Postgres connection details when you’re ready, and I’ll switch
  the backend to use Postgres.
