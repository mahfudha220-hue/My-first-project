-- Payment Management System schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_role_unique ON users (username, role);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  invoice TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  method TEXT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS backup (
  id INTEGER PRIMARY KEY,
  last_backup TIMESTAMPTZ,
  last_restore TIMESTAMPTZ
);
