import { motion } from 'framer-motion'

export default function AdminDashboard() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden bg-[#050505]">
            {/* Background grid */}
            <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

            <div className="relative max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 text-center md:text-left"
                >
                    <p className="font-mono text-[#D4AF37] text-[10px] tracking-[0.4em] uppercase">Control Panel / Main</p>
                    <h1 className="font-orbitron font-black text-4xl md:text-6xl text-[#F5F5F5] tracking-tight">Admin Dashboard</h1>
                    <div className="h-px w-24 bg-[#D4AF37] mt-4" />
                </motion.div>

                {/* Dashboard Sections Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Events Management */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#0A0A0A] border border-white/5 p-8 group hover:border-[#D4AF37]/30 transition-all duration-300"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-sm bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="font-orbitron text-xl text-white font-bold tracking-wider">Events Management</h2>
                        </div>
                        <p className="font-inter text-white/40 text-sm mb-8 leading-relaxed">Create, edit, or delete events. Control the featured status for the main homepage display.</p>
                        <button className="font-mono text-[10px] text-[#D4AF37] tracking-[0.2em] border border-[#D4AF37]/40 px-4 py-2 hover:bg-[#D4AF37] hover:text-black transition-all duration-300">
                            [ GOTO EVENTS ]
                        </button>
                    </motion.div>

                    {/* Team Management */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#0A0A0A] border border-white/5 p-8 group hover:border-[#D4AF37]/30 transition-all duration-300"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-sm bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                                <svg className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h2 className="font-orbitron text-xl text-white font-bold tracking-wider">Team Management</h2>
                        </div>
                        <p className="font-inter text-white/40 text-sm mb-8 leading-relaxed">Update the core leadership and team members. Manage roles, descriptions, and profile links.</p>
                        <button className="font-mono text-[10px] text-[#D4AF37] tracking-[0.2em] border border-[#D4AF37]/40 px-4 py-2 hover:bg-[#D4AF37] hover:text-black transition-all duration-300">
                            [ GOTO TEAM ]
                        </button>
                    </motion.div>
                </div>

                {/* System Status */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-12 border-t border-white/5 flex items-center gap-2"
                >
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                    <span className="font-mono text-[10px] text-white/25 uppercase tracking-widest">Admin system active — encrypted session established</span>
                </motion.div>
            </div>
        </main>
    )
}
