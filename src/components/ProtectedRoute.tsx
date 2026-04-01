import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
    children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAdmin } = useAuth()

    // If not admin, redirect to home
    if (!isAdmin) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

export default ProtectedRoute
