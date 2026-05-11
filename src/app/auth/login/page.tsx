'use client';

import { Suspense, useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ShieldCheck, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (searchParams.get("registered")) {
            setSuccess("Account created successfully. Please sign in.");
        }

        // Handle the case where user is already logged in but visits /auth/login
        const checkSession = async () => {
            const session = await getSession();
            if (session) {
                if ((session.user as any)?.role === "ADMIN") {
                    router.push("/admin");
                } else {
                    router.push(callbackUrl);
                }
            }
        };
        checkSession();
    }, [searchParams, router, callbackUrl]);

    const handleManualLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password. Please try again.");
            } else {
                const session = await getSession();
                if ((session?.user as any)?.role === "ADMIN") {
                    router.push("/admin");
                } else {
                    router.push(callbackUrl);
                }
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/60 backdrop-blur-3xl border border-white p-8 md:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] rounded-[4px]">
            <div className="text-center mb-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block mb-3"
                >
                    <img src="/balaji-enterprise-logo.png" alt="Balaji Enterprise" className="h-9 w-auto grayscale" />
                </motion.div>
                <h1 className="font-heading text-3xl text-black mb-1 tracking-tighter">Sign In</h1>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-gold/80 font-medium font-bold italic">Identity Verification</p>
            </div>

            <div className="space-y-5">
                <button
                    onClick={() => signIn("google", { callbackUrl })}
                    className="group w-full flex items-center justify-center gap-3 bg-white text-black border border-gray-200 font-body text-[10px] tracking-[0.1em] uppercase py-3.5 hover:bg-gray-50 transition-all duration-300 rounded-[2px] shadow-sm"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign In with Google
                </button>

                <div className="relative py-1 flex items-center gap-3">
                    <div className="flex-1 h-[1px] bg-gray-100" />
                    <span className="font-body text-[8px] tracking-[0.2em] uppercase text-gray-400 font-medium">Or use email</span>
                    <div className="flex-1 h-[1px] bg-gray-100" />
                </div>

                <form onSubmit={handleManualLogin} className="space-y-3">
                    <div className="space-y-3">
                        <input
                            required
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-300 py-2.5 font-body text-sm text-black focus:outline-none focus:border-gold transition-all placeholder:text-gray-400"
                        />
                        <input
                            required
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-300 py-2.5 font-body text-sm text-black focus:outline-none focus:border-gold transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {error && (
                        <p className="text-[10px] text-red-500 font-body text-center">{error}</p>
                    )}

                    {success && (
                        <p className="text-[10px] text-green-600 font-body text-center">{success}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white border border-black font-body text-[10px] tracking-[0.2em] uppercase py-3.5 mt-2 hover:bg-gold hover:border-gold hover:text-black transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                    </button>
                </form>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
                <Link
                    href={`/auth/register?callbackUrl=${callbackUrl}`}
                    className="font-body text-[10px] tracking-widest uppercase text-gray-500 hover:text-gold transition-colors font-medium border-b border-gray-200"
                >
                    Don't have an account? Sign Up
                </Link>
            </div>
        </div>
    );
}

export default function LoginPage() {
    const router = useRouter();

    return (
        <div className="h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#FBFBFA]">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(197,165,114,0.05),transparent_70%)]" />
            </div>

            {/* Exit Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => router.push('/')}
                className="absolute top-6 right-6 z-[100] p-2 rounded-full hover:bg-black/5 transition-all duration-300 group"
            >
                <X className="w-5 h-5 text-gray-400 group-hover:text-black" />
            </motion.button>

            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-[400px] flex flex-col justify-center px-6"
            >
                <Suspense fallback={
                    <div className="bg-white/60 backdrop-blur-3xl border border-white p-20 flex flex-col items-center justify-center rounded-[4px]">
                        <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
                        <p className="font-body text-[10px] tracking-[0.4em] uppercase text-muted-foreground">Initializing...</p>
                    </div>
                }>
                    <LoginContent />
                </Suspense>

                <div className="mt-4 text-center">
                    <Link href="/" className="font-body text-[9px] tracking-[0.4em] uppercase text-gray-400 hover:text-black transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
