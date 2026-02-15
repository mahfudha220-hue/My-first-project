-- Seed data migrated from backend/data/store.json

INSERT INTO invoices (id, customer, amount, status, due_date, created_at) VALUES
  ('INV001', 'Ali Hassan', 50000, 'Unpaid', '2026-02-15', '2026-02-10T09:30:00.000Z'),
  ('INV002', 'Sara Juma', 75000, 'Paid', '2026-02-10', '2026-02-08T10:15:00.000Z');

INSERT INTO payments (id, invoice, amount, method, date, created_at) VALUES
  ('PAY001', 'INV002', 75000, 'Mobile Money', '2026-02-10', '2026-02-10T10:25:00.000Z'),
  ('PAY002', 'INV001', 1000, 'Cash', '2026-02-13', '2026-02-13T12:01:11.264Z');

INSERT INTO users (id, name, role, username, password) VALUES
  ('USR001', 'Admin User', 'admin', 'Mahfudha', '123'),
  ('USR002', 'Cashier One', 'cashier', 'cashier', 'cashier123'),
  ('USR003', 'Manager One', 'manager', 'Mahfudha', '123'),
  ('USR004', 'Cashier Test', 'cashier', 'cashier_new_1959', 'secret123'),
  ('USR005', 'Lujaina Kunta', 'cashier', 'Lujaina', 'Kunta@123'),
  ('USR006', 'Ashfaina Ali', 'cashier', 'Ashfaina', '123@45A'),
  ('USR007', 'Mahfudha', 'cashier', 'Mahfudha', 'Maha@2004');

INSERT INTO backup (id, last_backup, last_restore) VALUES
  (1, '2026-02-13T11:53:27.572Z', '2026-02-13T11:53:29.060Z');
