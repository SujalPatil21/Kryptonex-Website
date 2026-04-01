import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
    isAdmin: boolean
    login: () => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)

    useEffect(() => {
        // Sync with localStorage on mount
        const storedAdmin = localStorage.getItem('isAdmin')
        if (storedAdmin === 'true') {
            setIsAdmin(true)
        }
    }, [])

    const login = () => {
        localStorage.setItem('isAdmin', 'true')
        setIsAdmin(true)
    }

    const logout = () => {
        localStorage.removeItem('isAdmin')
        setIsAdmin(false)
    }

    return (
        <AuthContext.Provider value={{ isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
