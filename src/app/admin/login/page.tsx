'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Shield, Loader2, Lock, Mail, AlertTriangle, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AdminLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/admin';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (attempts >= 5) {
            setError('Too many failed attempts. Security lock engaged.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Using default redirection (redirect: true) is the most reliable way 
            // to ensure cookies are set and the session is established before arriving 
            // at the protected route.
            await signIn('credentials', {
                email,
                password,
                callbackUrl: callbackUrl,
                redirect: true,
            });
        } catch (err) {
            setError('Authentication service unavailable.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FDFBF7] relative overflow-hidden">
            {/* Background High-End Texture/Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(197,165,114,0.06),transparent_70%)] blur-3xl mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(197,165,114,0.04),transparent_70%)] blur-3xl mix-blend-multiply" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C5A572]/20 to-transparent" />
            </div>

            {/* Cinematic Noise/Grid */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#C5A572 1px, transparent 1px), linear-gradient(90deg, #C5A572 1px, transparent 1px)',
                    backgroundSize: '100px 100px'
                }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-[420px] px-6"
            >
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/80 backdrop-blur-sm border border-[#C5A572]/20 shadow-[0_10px_30px_rgba(197,165,114,0.1)] mb-8 group"
                    >
                        <Shield className="w-8 h-8 text-[#C5A572] transition-transform duration-500 group-hover:scale-110" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h1 className="font-heading text-3xl text-gray-900 tracking-tight mb-3">Admin Console</h1>
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-px w-8 bg-[#C5A572]/30" />
                            <p className="font-body text-[9px] tracking-[0.4em] uppercase text-gray-500">Authorized Personnel</p>
                            <div className="h-px w-8 bg-[#C5A572]/30" />
                        </div>
                    </motion.div>
                </div>

                {/* Login Form Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden group"
                >
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#C5A572]/60 to-transparent" />

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div className="space-y-4">
                            <div className="group/input relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/input:text-[#C5A572] transition-colors" />
                                <input
                                    required
                                    type="email"
                                    placeholder="Admin Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/50 border border-gray-200/60 rounded-xl pl-12 pr-4 py-4 font-body text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#C5A572]/40 focus:ring-4 focus:ring-[#C5A572]/10 transition-all"
                                    autoComplete="email"
                                />
                            </div>
                            <div className="group/input relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/input:text-[#C5A572] transition-colors" />
                                <input
                                    required
                                    type="password"
                                    placeholder="Access Key"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/50 border border-gray-200/60 rounded-xl pl-12 pr-4 py-4 font-body text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-[#C5A572]/40 focus:ring-4 focus:ring-[#C5A572]/10 transition-all"
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 bg-red-50/80 border border-red-100 rounded-xl px-4 py-3"
                            >
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <p className="text-[11px] text-red-600 font-body tracking-wide">{error}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || attempts >= 5}
                            className="w-full bg-[#111] text-white font-body text-[10px] font-bold tracking-[0.3em] uppercase py-4 rounded-xl hover:bg-[#C5A572] hover:shadow-[0_15px_30px_rgba(197,165,114,0.2)] transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none group/btn"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Authenticate
                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    {attempts > 0 && attempts < 5 && (
                        <p className="text-center text-[10px] font-body text-gray-500 mt-6 tracking-wide italic">
                            {5 - attempts} security attempts remaining
                        </p>
                    )}
                </motion.div>

                {/* Secure Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 text-center"
                >
                    <p className="font-body text-[8px] tracking-[0.5em] uppercase text-gray-400 flex items-center justify-center gap-2">
                        <Lock className="w-3 h-3" />
                        Balaji Enterprise Security Framework v2.0
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex items-center justify-center bg-[#FBFBFA]">
                <Loader2 className="w-8 h-8 text-[#C5A572] animate-spin" />
            </div>
        }>
            <AdminLoginContent />
        </Suspense>
    );
}
