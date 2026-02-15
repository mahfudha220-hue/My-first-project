import Sidebar from './Sidebar' 
import Navbar from './Navbar'

export default function DashboardLayout({ children }) {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Navbar />
        <div className="container-fluid p-4">{children}</div>
      </div>
    </div>
  )
}
