'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPaymentIntent } from '@/app/actions/payments';
import { cancelOrder } from '@/app/actions/orders';
import { CreditCard, ShieldCheck, ChevronLeft, Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import CancellationModal from '@/components/checkout/CancellationModal';

export default function PaymentClient({ order }: { order: any }) {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [initError, setInitError] = useState<string | null>(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [policiesAccepted, setPoliciesAccepted] = useState(false);

    const handleForceCancel = async (reason: string) => {
        setIsProcessing(true);
        try {
            const res = await cancelOrder(order.id, reason);
            if (res.success) {
                toast.success('Acquisition cancelled.');
                router.push('/dashboard');
            } else {
                toast.error('Failed to cancel acquisition.');
            }
        } catch (e) {
            toast.error('Error occurred.');
        } finally {
            setIsProcessing(false);
            setShowCancelModal(false);
        }
    };

    // Cleanup Modem Pay UI on unmount
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined') {
                const elements = document.querySelectorAll('.modempay-checkout, #modempay-checkout, [class*="modempay"]');
                elements.forEach(el => el.remove());
            }
        };
    }, []);

    // Pre-create the payment intent on mount so sub_account split is applied server-side
    useEffect(() => {
        createPaymentIntent(order.total, order.id, order.customerEmail, order.customerName, order.customerPhone)
            .then(res => {
                if (res.success && res.intent?.payment_intent_id) {
                    setPaymentIntentId(res.intent.payment_intent_id);
                } else {
                    setInitError(res.error || 'Failed to initialise payment.');
                }
            })
            .catch(() => setInitError('Network error — please refresh.'))
            .finally(() => setIsInitializing(false));
    }, [order.id, order.total]);

    const handleMakePayment = () => {
        setIsProcessing(true);
        const mode = process.env.NEXT_PUBLIC_MODEM_PAY_MODE || 'test';
        const publicKey = mode === 'live'
            ? process.env.NEXT_PUBLIC_MODEM_PAY_LIVE_PUBLIC_KEY
            : process.env.NEXT_PUBLIC_MODEM_PAY_TEST_PUBLIC_KEY;

        if (!publicKey) {
            toast.error('Payment configuration error.');
            setIsProcessing(false);
            return;
        }

        // @ts-ignore
        if (typeof window === 'undefined' || !window.ModemPayCheckout) {
            toast.error('Payment Gateway failed to load. Please refresh the page.');
            setIsProcessing(false);
            return;
        }

        try {
            // @ts-ignore
            const modal = window.ModemPayCheckout({
                // Using the payment_intent_id ensures sub_account split routing is applied
                payment_intent_id: paymentIntentId,
                amount: order.total,
                currency: 'GMD',
                public_key: publicKey,
                callback: (transaction: any) => {
                    console.log('Payment completed:', transaction);
                    setIsSuccess(true);
                    setIsProcessing(false);
                    // @ts-ignore
                    if (modal && modal.close) modal.close();
                },
                onClose: (cancelled: boolean) => {
                    if (cancelled) {
                        setShowCancelModal(true);
                        // We keep isProcessing true while modal is up for better flow
                    } else {
                        setIsProcessing(false);
                    }
                }
            });
        } catch (error) {
            console.error('Modem Pay UI Error:', error);
            toast.error('Failed to launch Modem Pay interface.');
            setIsProcessing(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto mt-24 text-center">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-heading mb-4 text-gray-900">Payment Processed</h2>
                <p className="text-gray-500 font-body tracking-widest uppercase mb-6 text-sm">Validating via Webhook...</p>
                <p className="font-body text-xs text-gray-400 max-w-md mx-auto mb-12">Your payment has been successfully recorded on the gateway interface. Our backend system is securing the transaction with Modem Pay via Webhook. Your order status will update to PAID momentarily on your dashboard.</p>
                <Link href="/dashboard" className="px-6 py-3 border border-[#E5E5E5] text-xs font-body uppercase tracking-wider hover:bg-gray-50 transition-colors">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Modem Pay inline scripts */}
            <Script src="https://api.modempay.com/js/v1.js" strategy="afterInteractive" />
            <link rel="stylesheet" href="https://api.modempay.com/dist/main.css" />

            {/* Premium Cancel Confirmation Modal */}
            <AnimatePresence>
                {showCancelModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCancelModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden"
                        >
                            {/* Header matched to Modem Pay Teal */}
                            <div className="bg-[#003D4D] px-6 py-4 flex items-center justify-between">
                                <h3 className="text-white text-xs font-body uppercase tracking-[0.2em] font-medium">Payment Cancellation</h3>
                                <button onClick={() => setShowCancelModal(false)} className="text-white/60 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-8 text-center">
                                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h4 className="text-gray-900 font-heading text-lg mb-2">Abort Payment?</h4>
                                <p className="text-gray-500 font-body text-xs leading-relaxed mb-8 px-4">
                                    Are you sure you want to cancel this transaction? Your order will remain Pending until payment is secured.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => {
                                            setShowCancelModal(false);
                                            setIsProcessing(false);
                                            toast.info('Payment was cancelled.');
                                        }}
                                        className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-body text-[10px] tracking-widest uppercase transition-colors rounded-lg"
                                    >
                                        Yes, Abort Payment
                                    </button>
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-900 font-body text-[10px] tracking-widest uppercase transition-colors rounded-lg border border-gray-200"
                                    >
                                        No, Continue Checkout
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="mb-12">
                <Link href="/dashboard" className="text-[10px] font-body tracking-wider uppercase text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-2 mb-6">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to Orders
                </Link>
                <h1 className="text-3xl lg:text-5xl font-heading text-gray-900 mb-2">Secure Checkout</h1>
                <p className="text-sm font-body text-gray-500">Order ID: #{order.id.slice(-8).toUpperCase()}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                {/* Left Side - Payment Form */}
                <div className="space-y-8">
                    <div className="bg-white border border-[#E5E5E5] p-8 lg:p-10 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <CreditCard className="w-32 h-32" />
                        </div>

                        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
                            <img src="https://www.modempay.com/favicon.ico" alt="Modem Pay" className="w-6 h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                            <h2 className="text-sm font-body uppercase tracking-[0.2em] font-medium text-[#003D4D]">Modem Pay Gateway</h2>
                        </div>

                        {isInitializing ? (
                            <div className="py-20 text-center flex flex-col items-center">
                                <Loader2 className="w-8 h-8 animate-spin text-[#C5A572] mb-6" />
                                <p className="font-body text-xs tracking-[0.3em] uppercase text-gray-400">Preparing Secure Gateway...</p>
                            </div>
                        ) : initError ? (
                            <div className="py-12 bg-red-50 border border-red-100 p-6 text-center">
                                <p className="text-red-500 font-body text-sm mb-4">{initError}</p>
                                <button onClick={() => window.location.reload()} className="text-xs tracking-wider uppercase font-body text-red-600 hover:text-red-800 underline">Retry</button>
                            </div>
                        ) : (
                            <div className="space-y-6 relative z-10">
                                <div className="p-6 border border-[#E5E5E5] bg-gray-50/50 space-y-4">
                                    <div className="flex justify-between items-center text-sm font-body">
                                        <span className="text-gray-500">Amount Due</span>
                                        <span className="font-semibold text-gray-900">D {order.total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-body">
                                        <span className="text-gray-400">Intent ID</span>
                                        <span className="text-gray-400 font-mono bg-white px-2 py-1 border border-gray-200">{paymentIntentId?.slice(0, 12)}...</span>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <div className="flex items-start gap-4 mb-8 bg-gray-50 p-4 border border-gray-100">
                                        <div className="relative flex items-center justify-center mt-1">
                                            <input
                                                type="checkbox"
                                                id="policies-accept"
                                                className="sr-only"
                                                checked={policiesAccepted}
                                                onChange={(e) => setPoliciesAccepted(e.target.checked)}
                                            />
                                            <div
                                                onClick={() => setPoliciesAccepted(!policiesAccepted)}
                                                className={`w-5 h-5 border cursor-pointer transition-colors flex items-center justify-center ${policiesAccepted ? 'bg-[#003D4D] border-[#003D4D]' : 'border-gray-200 bg-white'}`}
                                            >
                                                {policiesAccepted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                            </div>
                                        </div>
                                        <label htmlFor="policies-accept" className="font-body text-[10px] text-gray-500 leading-relaxed cursor-pointer select-none">
                                            I have read and accept the <Link href="/policies" className="text-gray-900 font-bold hover:text-[#003D4D] underline">Terms of Service</Link> and <Link href="/policies" className="text-gray-900 font-bold hover:text-[#003D4D] underline">Refund Policies</Link> of Balaji Enterprise Digital Atelier.
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-5 gap-3">
                                        <button
                                            onClick={handleMakePayment}
                                            disabled={isProcessing || !policiesAccepted}
                                            className="col-span-3 py-5 bg-[#111] hover:bg-[#003D4D] transition-colors text-white font-body text-[10px] tracking-[0.2em] uppercase shadow-lg disabled:opacity-30 flex justify-center items-center gap-2"
                                        >
                                            {isProcessing ? (
                                                <><Loader2 className="w-3 h-3 animate-spin" /> Launching</>
                                            ) : (
                                                `Pay Now`
                                            )}
                                        </button>

                                        {!isProcessing && (
                                            <button
                                                onClick={() => setShowCancelModal(true)}
                                                className="col-span-2 py-5 border border-gray-200 text-gray-400 font-body text-[10px] tracking-widest uppercase hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center"
                                            >
                                                Abort
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-[9px] text-center text-gray-400 font-body uppercase tracking-wider mt-4 opacity-70">
                                        Powered by Modem Pay Gateway
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side - Request Summary */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.2em] font-body text-gray-400 mb-6">Acquisition Details</h3>
                        <div className="space-y-4">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex gap-4 items-center bg-white p-4 border border-[#E5E5E5]">
                                    <div className="w-16 h-16 bg-gray-50 border border-gray-100 shrink-0">
                                        <img src={item.product?.images?.[0] || '/placeholder.png'} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-heading">{item.product?.name}</p>
                                        <div className="flex gap-3 text-[10px] font-body tracking-widest uppercase text-gray-400 mt-1">
                                            <span>{item.dimension}</span>
                                            <span>•</span>
                                            <span className="text-[#C5A572]">{item.texture}</span>
                                        </div>
                                        <p className="text-xs font-body text-gray-500 mt-2">{item.quantity} × D{item.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-heading">D{(item.quantity * item.price).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 border border-[#E5E5E5]">
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-xs font-body text-gray-500">
                                <span>Sub-total Valuation</span>
                                <span>D{order.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs font-body text-gray-500">
                                <span>Logistics & Handling</span>
                                <span>Concluded separately</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-end pt-6 border-t border-gray-200">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-body text-gray-400">Total Settlement</span>
                            <span className="text-2xl font-heading text-[#C5A572]">D{order.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <CancellationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleForceCancel}
                title="Abort Acquisition"
                description="Please provide a reason for aborting this procurement. This will be shared with the Atelier management."
                confirmText="Abort Now"
                isProcessing={isProcessing}
            />
        </div>
    );
}
