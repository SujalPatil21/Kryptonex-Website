import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface AdminLoginModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            const response = await fetch('http://localhost:8080/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            const result = await response.json()

            if (response.ok && result.success) {
                login()
                onClose()
                navigate('/admin')
            } else {
                setError(result.message || 'Invalid credentials')
            }
        } catch (err) {
            setError('Server unavailable. Please try again later.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#0A0A0A] border border-[#D4AF37]/30 p-8 shadow-[0_0_50px_rgba(212,175,55,0.1)] rounded-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/30 hover:text-[#D4AF37] transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="font-orbitron font-bold text-2xl text-[#F5F5F5] tracking-widest uppercase">Admin Login</h2>
                            <div className="h-px w-12 bg-[#D4AF37] mx-auto mt-2" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-transparent border border-white/10 px-4 py-3 text-white font-inter focus:border-[#D4AF37]/50 focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent border border-white/10 px-4 py-3 text-white font-inter focus:border-[#D4AF37]/50 focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-red-500 font-mono text-[10px] text-center uppercase tracking-widest"
                                >
                                    !! {error} !!
                                </motion.p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full py-4 font-orbitron text-xs tracking-[0.3em] font-bold border border-[#D4AF37] text-[#D4AF37] overflow-hidden transition-all duration-300 hover:text-black uppercase"
                            >
                                <span className={`absolute inset-0 bg-[#D4AF37] transition-transform duration-300 ease-out ${isLoading ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`} />
                                <span className="relative">{isLoading ? 'Authenticating...' : '[ Authorize ]'}</span>
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
