# Payment Management System

## Run frontend
```powershell
cd "c:\Users\MI AMOR\Desktop\paymentfrontend\payment-management-system"
npm.cmd run dev
```

## Run frontend + backend together
```powershell
cd "c:\Users\MI AMOR\Desktop\paymentfrontend\payment-management-system"
npm.cmd run dev:all
```

## Run backend
```powershell
cd "c:\Users\MI AMOR\Desktop\paymentfrontend\payment-management-system"
npm.cmd run api
```

Backend URL: `http://localhost:4000`  
Health check: `http://localhost:4000/health`

The Vite dev server proxies `/api/*` to backend port `4000`, so frontend calls use relative URLs like `/api/invoices`.

## Login Accounts
- Admin: `admin` / `admin123`
- Manager: `manager` / `manager123`
- Cashier: register from login page first, then login with created account
- Existing seeded accounts may also work (for example `Mahfudha` / `123` for admin/manager in older seed data)

## Role Access
- `admin`: all pages
- `manager`: dashboard, invoices, create invoice, payments
- `cashier`: dashboard, invoices, make payment, payments
