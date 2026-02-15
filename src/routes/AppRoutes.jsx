import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedLayout from './ProtectedLayout'
import RoleRoute from './RoleRoute'

import Dashboard from '../pages/dashboard/Dashboard' 
import InvoiceList from '../pages/dashboard/invoices/InvoiceList' 
import CreateInvoice from '../pages/dashboard/invoices/CreateInvoice' 
import PaymentList from '../pages/dashboard/payments/PaymentList' 
import MakePayment from '../pages/dashboard/payments/MakePayment' 
import UserManagement from '../pages/dashboard/users/UserManagement' 
import Backup from '../pages/dashboard/backup/Backup'
import AdminLogin from '../pages/auth/AdminLogin'
import ManagerLogin from '../pages/auth/ManagerLogin'
import CashierLogin from '../pages/auth/CashierLogin'
import CashierRegister from '../pages/auth/CashierRegister'

export default function AppRoutes() { 
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/login/admin" replace />} />
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/login/manager" element={<ManagerLogin />} />
      <Route path="/login/cashier" element={<CashierLogin />} />
      <Route path="/register/cashier" element={<CashierRegister />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/payments" element={<PaymentList />} />

        <Route
          path="/create-invoice"
          element={
            <RoleRoute roles={['admin', 'manager']}>
              <CreateInvoice />
            </RoleRoute>
          }
        />
        <Route
          path="/make-payment"
          element={
            <RoleRoute roles={['admin', 'cashier']}>
              <MakePayment />
            </RoleRoute>
          }
        />
        <Route
          path="/users"
          element={
            <RoleRoute roles={['admin']}>
              <UserManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/backup"
          element={
            <RoleRoute roles={['admin']}>
              <Backup />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
