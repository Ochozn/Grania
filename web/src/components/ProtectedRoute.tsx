import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
    }
    const isAuthenticated = !!getCookie('user_id')

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
