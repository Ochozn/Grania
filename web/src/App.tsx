import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import Categories from './pages/Categories'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Dashboard Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/transactions" element={<Transactions />} />
                    <Route path="/dashboard/transactions" element={<Transactions />} />
                    <Route path="/dashboard/reports" element={<Reports />} />
                    <Route path="/dashboard/categories" element={<Categories />} />
                    <Route path="/dashboard/settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
