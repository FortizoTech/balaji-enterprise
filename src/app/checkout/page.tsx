'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import Script from 'next/script';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import { createOrder, getLatestOrderDetails } from '@/app/actions/orders';
import { Loader2, CheckCircle2, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Declare ModemPayCheckout for TypeScript
declare global {
  interface Window {
    ModemPayCheckout: any;
  }
}

type Step = 'details' | 'shipping' | 'confirm';

export default function Checkout() {
  const { data: session, status } = useSession();
  const [step, setStep] = useState<Step>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const { items, total, clearCart } = useCartStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  // Pre-fill user data and Smart Skip
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user) return;

      setIsFetchingData(true);
      try {
        const lastOrder = await getLatestOrderDetails((session.user as any).id);

        if (lastOrder) {
          const names = lastOrder.customerName?.split(' ') || [];
          const newData = {
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            email: lastOrder.customerEmail || session.user?.email || '',
            phone: lastOrder.customerPhone || '',
            address: lastOrder.customerAddress || '',
            city: lastOrder.customerCity || '',
            region: lastOrder.customerRegion || '',
          };

          setFormData(newData);

          // Smart Skip: If all details are present, skip to confirm
          if (newData.firstName && newData.lastName && newData.email && newData.phone && newData.address && newData.city && newData.region) {
            setStep('confirm');
            toast.info("Welcome back! Your atelier details have been securely restored.", {
              description: "Review your selection and submit to proceed.",
              duration: 5000,
            });
          }
        } else {
          // Basic pre-fill from session
          setFormData(prev => ({
            ...prev,
            firstName: session.user?.name?.split(' ')[0] || '',
            lastName: session.user?.name?.split(' ').slice(1).join(' ') || '',
            email: session.user?.email || '',
          }));
        }
      } finally {
        setIsFetchingData(false);
      }
    };

    if (session?.user && mounted) {
      fetchUserData();
    }
  }, [session, mounted]);

  if (!mounted) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (status === "loading" || (isFetchingData && mounted)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gold animate-spin mx-auto mb-6" />
          <p className="font-body text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
            {isFetchingData ? 'Restoring Your Atelier Details...' : 'Verifying Session...'}
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="pt-32 content-padding text-center section-padding">
        <h1 className="font-heading text-headline text-foreground mb-8">Your cart is empty</h1>
        <Link href="/collections" className="font-body text-sm tracking-widest uppercase text-gold">Browse Collections</Link>
      </div>
    );
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'details', label: '01 Details' },
    { key: 'shipping', label: '02 Address' },
    { key: 'confirm', label: '03 Review' },
  ];

  const handleFinalizeOrder = async () => {
    if (!acceptedPolicies) {
      alert("Please accept the terms and conditions.");
      return;
    }

    setIsProcessing(true);

    const result = await createOrder({
      userId: (session?.user as any)?.id,
      customerEmail: formData.email,
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      customerCity: formData.city,
      customerRegion: formData.region,
      total: total(),
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: (item.variant ? item.variant.price : item.product.price),
        dimension: item.variant?.options?.Dimension || (item.product as any).dimensions,
        texture: item.variant?.options?.Texture || 'Standard',
      })),
    });

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        clearCart();
        router.push(`/dashboard?newOrder=${result.orderId}`);
      }, 1500);
    } else {
      setIsProcessing(false);
      alert(`Submission failed: ${(result as any).error || 'Please contact support.'}`);

    }
  };

  return (
    <div className="pt-24 md:pt-32 min-h-screen relative">
      {/* Redundant script removed to prevent UI leaks on other pages */}

      {/* PROCESSING OVERLAY */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-md w-full"
            >
              {!isSuccess ? (
                <>
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 border-2 border-gold/10 border-t-gold rounded-full"
                    />
                    <Loader2 className="w-8 h-8 text-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <h2 className="font-heading text-2xl text-foreground mb-4">Finalizing Your Atelier Request</h2>
                  <p className="font-body text-sm text-muted-foreground tracking-widest uppercase">Submitting to Gallery Admins...</p>
                </>
              ) : (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(197,165,114,0.3)]">
                    <CheckCircle2 className="w-10 h-10 text-secondary-foreground" />
                  </div>
                  <h2 className="font-heading text-2xl text-foreground mb-4">Request Submitted</h2>
                  <p className="font-body text-sm text-muted-foreground tracking-widest uppercase">Preparing Your Confirmation</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="content-padding section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 flex justify-between items-end">
            <div>
              <Link href="/cart" className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-gold transition-colors">
                ← Back to cart
              </Link>
              <h1 className="font-heading text-headline text-foreground mt-4 mb-2">Checkout</h1>
              <p className="font-body text-xs text-muted-foreground tracking-widest uppercase">Logged in as {session?.user?.email}</p>
            </div>
            <div className="flex items-center gap-4 text-gold border border-gold/20 bg-gold/5 px-4 py-2">
              <Lock className="w-3 h-3" />
              <span className="font-body text-[9px] tracking-widest uppercase">Authenticated Session</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7">
              {/* Steps */}
              <div className="flex gap-4 md:gap-8 mb-8 md:mb-16 border-b border-border pb-6 overflow-x-auto no-scrollbar">
                {steps.map((s, idx) => (
                  <button
                    key={s.key}
                    disabled={isProcessing}
                    onClick={() => {
                      // Basic progression logic
                      if (step === 'details' && s.key !== 'details' && !(formData.firstName && formData.lastName && formData.email && formData.phone)) return;
                      setStep(s.key);
                    }}
                    className={`flex-shrink-0 font-body text-[10px] tracking-widest uppercase transition-all duration-500 pb-6 -mb-6 border-b border-transparent flex items-center gap-2 ${step === s.key ? 'text-foreground border-gold opacity-100' : 'text-muted-foreground hover:text-foreground opacity-30'
                      }`}
                  >
                    <span className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center text-[8px] transition-colors",
                      step === s.key ? "bg-gold border-gold text-secondary-foreground" : "border-muted-foreground"
                    )}>{idx + 1}</span>
                    <span className="hidden sm:inline">{s.label.split(' ')[1]}</span>
                    <span className="sm:hidden">{s.key}</span>
                  </button>
                ))}
              </div>

              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {step === 'details' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground block mb-3">First Name *</label>
                        <input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Milton"
                          className="w-full h-14 border border-border bg-transparent px-4 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/30"
                        />
                      </div>
                      <div>
                        <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground block mb-3">Last Name *</label>
                        <input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Kamanda"
                          className="w-full h-14 border border-border bg-transparent px-4 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/30"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground block mb-3">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={!!session?.user?.email}
                        placeholder="name@email.com"
                        className="w-full h-14 border border-border bg-transparent px-4 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/30 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground block mb-3">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+220 --- ----"
                        className="w-full h-14 border border-border bg-transparent px-4 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/30"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (formData.firstName && formData.lastName && formData.email && formData.phone) {
                          setStep('shipping');
                        } else {
                          alert("Please fill in all required fields.");
                        }
                      }}
                      className="w-full bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase py-6 mt-8 hover:bg-gold hover:text-secondary-foreground transition-all duration-500 shadow-xl shadow-gold/5"
                    >
                      Confirm Details & Shipping
                    </button>
                  </div>
                )}

                {step === 'shipping' && (
                  <div className="space-y-6">
                    <div>
                      <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground block mb-3">Delivery Address *</label>
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="House No, Street Name"
                        className="w-full h-14 border border-border bg-transparent px-4 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/30"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground block mb-3">City *</label>
                        <input
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Banjul"
                          className="w-full h-14 border border-border bg-transparent px-4 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/30"
                        />
                      </div>
                      <div>
                        <label className="font-body text-[10px] tracking-widest uppercase text-muted-foreground block mb-3">Region / Estate *</label>
                        <input
                          name="region"
                          value={formData.region}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g. Atlantic Coast"
                          className="w-full h-14 border border-border bg-transparent px-4 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors placeholder:text-muted-foreground/30"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                      <button
                        onClick={() => setStep('details')}
                        className="w-1/3 border border-border font-body text-[10px] tracking-[0.2em] uppercase py-6 hover:bg-muted transition-colors opacity-50 hover:opacity-100"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => {
                          if (formData.address && formData.city && formData.region) {
                            setStep('confirm');
                          } else {
                            alert("Please fill in all required shipping fields.");
                          }
                        }}
                        className="flex-1 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase py-6 hover:bg-gold hover:text-secondary-foreground transition-all duration-500 shadow-xl shadow-gold/5"
                      >
                        Review Order
                      </button>
                    </div>
                  </div>
                )}

                {step === 'confirm' && (
                  <div className="space-y-12">
                    <div className="bg-gold/5 border border-gold/10 p-8 flex items-start gap-6">
                      <div className="bg-gold/20 p-4 rounded-full">
                        <Clock className="w-8 h-8 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-heading text-xl text-foreground mb-2">Order Validation Process</h3>
                        <p className="font-body text-xs text-muted-foreground leading-relaxed italic">
                          "Our team will review your selection and logistics requirements before issuing a final payment link."
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-1">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={acceptedPolicies}
                            onChange={(e) => setAcceptedPolicies(e.target.checked)}
                          />
                          <div className={`w-5 h-5 border transition-colors ${acceptedPolicies ? 'bg-gold border-gold' : 'border-border group-hover:border-gold/50'}`}>
                            {acceptedPolicies && <CheckCircle2 className="w-4 h-4 text-secondary-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                          </div>
                        </div>
                        <span className="font-body text-xs text-muted-foreground leading-relaxed">
                          By proceeding with this request, you acknowledge that this is a quote validation and you accept our <Link href="/policies" className="text-foreground hover:text-gold underline underline-offset-4 transition-colors" target="_blank">Terms of Service and Privacy Agreements.</Link>
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-4">
                      <button
                        disabled={isProcessing}
                        onClick={() => setStep('shipping')}
                        className="w-1/3 border border-border font-body text-[10px] tracking-[0.2em] uppercase py-6 hover:bg-muted transition-colors opacity-50 hover:opacity-100"
                      >
                        Back
                      </button>
                      <button
                        disabled={isProcessing || !acceptedPolicies}
                        onClick={handleFinalizeOrder}
                        className={`flex-1 font-body text-[10px] tracking-[0.2em] uppercase py-6 transition-all duration-500 flex items-center justify-center gap-3 ${acceptedPolicies ? 'bg-gold text-secondary-foreground hover:bg-primary hover:text-primary-foreground shadow-xl shadow-gold/20' : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'}`}
                      >
                        Submit Order Request
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            <div className="lg:col-span-5 order-first lg:order-last mb-8 lg:mb-0">
              <div className="lg:sticky lg:top-32">
                <div className="bg-muted/30 p-8 border border-border/50">
                  <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-8 border-b border-border/30 pb-4">Cinematic Order Summary</p>
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.cartItemId} className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <img src={item.product.images?.[0] || ''} alt="" className="w-12 h-12 object-cover" />
                          <div>
                            <p className="font-heading text-sm text-foreground">{item.product.name}</p>
                            {item.variant ? (
                              <p className="font-body text-[9px] text-muted-foreground tracking-widest uppercase mt-1">{item.variant.title} ({item.quantity} × {item.product.unit})</p>
                            ) : (
                              <p className="font-body text-[9px] text-muted-foreground tracking-widest uppercase mt-1">{item.quantity} × {item.product.unit}</p>
                            )}
                          </div>
                        </div>
                        <span className="font-body text-sm text-foreground">D{(item.variant ? item.variant.price : item.product.price) * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-8 mt-8 border-t border-border flex flex-col gap-4">
                    <div className="flex justify-between items-baseline">
                      <span className="font-body text-[10px] tracking-widest uppercase text-muted-foreground">Logistics Fee</span>
                      <span className="font-body text-sm text-foreground">Calculated later</span>
                    </div>
                    <div className="flex justify-between items-baseline pt-4">
                      <span className="font-heading text-lg tracking-widest uppercase text-foreground">Grand Total</span>
                      <span className="font-heading text-3xl text-gold">D{total()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <p className="font-body text-[9px] tracking-[0.2em] uppercase">Order Review Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
