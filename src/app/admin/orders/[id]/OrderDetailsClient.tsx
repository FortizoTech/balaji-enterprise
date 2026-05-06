'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    Printer,
    Truck,
    Package,
    CheckCircle,
    Clock,
    Banknote,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
    Search,
    X,
    Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { updateOrderStatus, updateOrderTotal, processOrderRefund } from '@/app/actions/admin';
import { toast } from 'sonner';
import SuccessModal from '@/components/admin/SuccessModal';

export default function OrderDetailsClient({ order }: { order: any }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRefunding, setIsRefunding] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [successConfig, setSuccessConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
    }>({
        isOpen: false,
        title: '',
        description: '',
    });

    const handleRefund = async () => {
        if (!confirm('Are you sure you want to process a refund for this order?')) return;
        setIsRefunding(true);
        try {
            const res = await processOrderRefund(order.id);
            if (res.success) {
                setCurrentStatus('REFUNDED');
                setSuccessConfig({
                    isOpen: true,
                    title: "Refund Processed",
                    description: "The financial settlement has been reversed and the refund has been successfully dispatched."
                });
            } else {
                toast.error(res.error || 'Failed to process refund');
            }
        } catch (error) {
            toast.error('An error occurred during refund processing');
        } finally {
            setIsRefunding(false);
        }
    };

    const daysSince = (new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 3600 * 24);
    const canRefund = daysSince <= 7 && currentStatus !== 'REFUNDED';

    const handleStatusUpdate = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const res = await updateOrderStatus(order.id, newStatus);
            if (res.success) {
                setCurrentStatus(newStatus);
                setSuccessConfig({
                    isOpen: true,
                    title: "Status Updated",
                    description: `The order lifecycle has been successfully transitioned to ${newStatus.toLowerCase()} status.`
                });
            }
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const steps = [
        { id: 'PENDING', label: 'Requested', icon: Clock },
        { id: 'IN_REVIEW', label: 'In Review', icon: Search },
        { id: 'APPROVED', label: 'Approved', icon: CheckCircle },
        { id: 'PAYMENT_PENDING', label: 'Payment Pending', icon: Banknote },
        { id: 'PAID', label: 'Paid', icon: Banknote },
        { id: 'SHIPPED', label: 'Shipped', icon: Truck },
        { id: 'DELIVERED', label: 'Delivered', icon: Package },
    ];

    const [isEditingTotal, setIsEditingTotal] = useState(false);
    const [newTotal, setNewTotal] = useState(order.total);

    const handleTotalUpdate = async () => {
        setIsUpdating(true);
        try {
            const res = await updateOrderTotal(order.id, newTotal);
            if (res.success) {
                setIsEditingTotal(false);
                setSuccessConfig({
                    isOpen: true,
                    title: "Valuation Adjusted",
                    description: "The total order valuation has been successfully updated and synchronized."
                });
            }
        } catch (error) {
            toast.error('Failed to update total');
        } finally {
            setIsUpdating(false);
        }
    };

    const currentStepIndex = steps.findIndex(s => s.id === currentStatus);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Global Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 20mm; }
                    body * { visibility: hidden; }
                    #printable-invoice, #printable-invoice * { visibility: visible; }
                    #printable-invoice {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white;
                        color: black;
                        padding: 0;
                        margin: 0;
                    }
                    /* Professional Invoice Adjustments */
                    .no-print { display: none !important; }
                    #printable-invoice { font-family: 'Inter', sans-serif; }
                    #printable-invoice h1 { font-size: 24pt; margin-bottom: 20pt; }
                    #printable-invoice .bg-gray-50\/50 { background: #F9FAFB !important; -webkit-print-color-adjust: exact; }
                }
            `}</style>

            <div id="printable-invoice" className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link href="/admin/orders" className="no-print flex items-center gap-2 text-xs font-body text-gray-400 hover:text-gray-900 transition-colors group mb-4">
                            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                            Back to Orders
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-heading text-gray-900 tracking-tight uppercase">Order #{order.id.slice(-8)}</h1>
                            <span className={cn(
                                "text-[9px] font-body tracking-widest uppercase px-2.5 py-1 rounded-full border",
                                currentStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    currentStatus === 'IN_REVIEW' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        currentStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            currentStatus === 'PAYMENT_PENDING' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                currentStatus === 'PAID' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    currentStatus === 'SHIPPED' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        currentStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            currentStatus === 'REFUNDED' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                'bg-gray-50 text-gray-400 border-gray-100'
                            )}>
                                {currentStatus}
                            </span>
                        </div>
                        <p className="text-sm font-body text-gray-500">Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy at HH:mm')}</p>
                    </div>

                    <div className="no-print flex items-center gap-3">
                        {canRefund && (
                            <button
                                disabled={isRefunding}
                                onClick={handleRefund}
                                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-md text-xs font-body tracking-wider transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isRefunding ? 'Refunding...' : 'Process Refund'}
                            </button>
                        )}
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 border border-[#E5E5E5] rounded-md text-xs font-body text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print Invoice
                        </button>
                        <div className="relative group">
                            <button
                                disabled={isUpdating}
                                className="flex items-center gap-2 px-6 py-2 bg-[#111] text-white rounded-md text-xs font-body tracking-widest uppercase hover:bg-[#C5A572] transition-all shadow-md disabled:opacity-50"
                            >
                                Update Status
                                <ChevronLeft className="w-3.5 h-3.5 rotate-[-90deg]" />
                            </button>
                            <div className="absolute right-0 top-full pt-2 w-48 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
                                <div className="bg-white border border-[#E5E5E5] rounded-lg shadow-xl py-2">
                                    {steps.map((step) => (
                                        <button
                                            key={step.id}
                                            onClick={() => handleStatusUpdate(step.id)}
                                            className={cn(
                                                "w-full text-left px-4 py-2 text-xs font-body hover:bg-gray-50 transition-colors flex items-center justify-between",
                                                currentStatus === step.id ? 'text-[#C5A572] font-semibold' : 'text-gray-600'
                                            )}
                                        >
                                            {step.label}
                                            {currentStatus === step.id && <CheckCircle className="w-3 h-3" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stepper */}
                <div className="no-print bg-white border border-[#E5E5E5] rounded-lg p-8 shadow-sm">
                    <div className="flex items-center justify-between max-w-3xl mx-auto relative">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-[#C5A572] -translate-y-1/2 z-0 transition-all duration-700 ease-out"
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        />

                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isCompleted = idx <= currentStepIndex;
                            const isActive = idx === currentStepIndex;

                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                        isCompleted
                                            ? "bg-[#C5A572] border-[#C5A572] text-white shadow-lg shadow-[#C5A572]/20"
                                            : "bg-white border-gray-100 text-gray-300"
                                    )}>
                                        <Icon className={cn("w-4 h-4", isActive && "animate-pulse")} />
                                    </div>
                                    <p className={cn(
                                        "text-[10px] font-body tracking-wider uppercase font-medium",
                                        isCompleted ? "text-gray-900" : "text-gray-300"
                                    )}>
                                        {step.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#F0F0F0] bg-gray-50/50 flex items-center justify-between">
                                <h3 className="text-xs font-body tracking-widest uppercase font-semibold text-gray-900">Order Items</h3>
                                <span className="text-[10px] font-body text-gray-400">{order.items.length} items</span>
                            </div>
                            <div className="divide-y divide-[#F5F5F5]">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="p-6 flex items-center gap-6 group hover:bg-gray-50/30 transition-colors">
                                        <div className="w-20 h-20 rounded bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                                            <img
                                                src={item.product?.productImages?.[0]?.url || item.product?.images?.[0]}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-body font-medium text-gray-900">{item.product.name}</h4>
                                            <p className="text-xs font-body text-gray-400 mt-1">{item.product.collection}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-body text-gray-400">{item.quantity} × D{item.price.toLocaleString()}</p>
                                            <p className="text-sm font-body font-semibold text-gray-900 mt-1">D{(item.quantity * item.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-gray-50/50 border-t border-[#F0F0F0]">
                                <div className="space-y-2 max-w-[200px] ml-auto">
                                    <div className="flex justify-between text-[11px] font-body text-gray-400">
                                        <span>Subtotal</span>
                                        <span>D{order.total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-body text-gray-400">
                                        <span>Shipping</span>
                                        <span>D0</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-body font-bold text-gray-900 pt-2 border-t border-gray-200">
                                        <span>Total</span>
                                        {isEditingTotal ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={newTotal}
                                                    onChange={(e) => setNewTotal(parseFloat(e.target.value))}
                                                    className="w-24 px-2 py-1 border border-[#E5E5E5] rounded text-right"
                                                />
                                                <button onClick={handleTotalUpdate} className="text-[#C5A572]"><CheckCircle className="w-4 h-4" /></button>
                                                <button onClick={() => setIsEditingTotal(false)} className="text-gray-400"><X className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span>D{order.total.toLocaleString()}</span>
                                                {currentStatus === 'PENDING' || currentStatus === 'IN_REVIEW' ? (
                                                    <button onClick={() => setIsEditingTotal(true)} className="no-print text-gray-300 hover:text-gray-600"><Edit className="w-3.5 h-3.5" /></button>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-8">
                        <div className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#F0F0F0] bg-gray-50/50">
                                <h3 className="text-xs font-body tracking-widest uppercase font-semibold text-gray-900">Customer</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                        {order.user?.image ? (
                                            <img src={order.user.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-400 font-body uppercase bg-gray-100">
                                                {(order.customerName || 'C').charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-body font-medium text-gray-900">{order.customerName}</p>
                                        <p className="text-xs font-body text-gray-400">Customer ID: {order.user?.id || 'GUEST'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-[#F5F5F5]">
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-4 h-4 text-gray-300 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-body tracking-wider uppercase text-gray-400">Email Address</p>
                                            <p className="text-xs font-body text-gray-700 mt-1">{order.customerEmail}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-4 h-4 text-gray-300 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-body tracking-wider uppercase text-gray-400">Phone Number</p>
                                            <p className="text-xs font-body text-gray-700 mt-1">{order.customerPhone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-4 h-4 text-gray-300 mt-0.5" />
                                        <div>
                                            <p className="text-[10px] font-body tracking-wider uppercase text-gray-400">Shipping Address</p>
                                            <p className="text-xs font-body text-gray-700 mt-1 leading-relaxed">
                                                {order.customerAddress}<br />
                                                {order.customerCity}, {order.customerRegion}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#111] border border-[#222] rounded-lg p-6 shadow-xl text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <Banknote className="w-5 h-5 text-[#C5A572]" />
                                <h3 className="text-xs font-body tracking-widest uppercase font-semibold">Payment Info</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[11px] font-body">
                                    <span className="text-gray-400">Payment Provider</span>
                                    <span className="text-white">Modem Pay</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-body">
                                    <span className="text-gray-400">Transaction ID</span>
                                    <span className="text-white truncate max-w-[100px]">{order.id}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-body pt-3 border-t border-white/10">
                                    <span className="text-[#C5A572]">Settlement Status</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter",
                                        currentStatus === 'SETTLED' ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"
                                    )}>
                                        {currentStatus === 'SETTLED' ? 'SETTLED' : 'PENDING'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SuccessModal
                isOpen={successConfig.isOpen}
                onClose={() => setSuccessConfig(prev => ({ ...prev, isOpen: false }))}
                title={successConfig.title}
                description={successConfig.description}
            />
        </div>
    );
}
