'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    User,
    Mail,
    Phone,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { updateInquiryStatus, respondToInquiry } from '@/app/actions/admin';
import { toast } from 'sonner';
import SuccessModal from '@/components/admin/SuccessModal';

export default function InquiryDetailsClient({ inquiry }: { inquiry: any }) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(inquiry.status);
    const [responseText, setResponseText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [successConfig, setSuccessConfig] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
    }>({
        isOpen: false,
        title: '',
        description: '',
    });

    const handleStatusUpdate = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const res = await updateInquiryStatus(inquiry.id, newStatus);
            if (res.success) {
                setCurrentStatus(newStatus);
                setSuccessConfig({
                    isOpen: true,
                    title: "Status Updated",
                    description: `The inquiry has been successfully transitioned to ${newStatus.toLowerCase()} status.`
                });
            }
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSendResponse = async () => {
        if (!responseText.trim()) return;
        setIsSending(true);
        try {
            const res = await respondToInquiry(inquiry.id, responseText);
            if (res.success) {
                setCurrentStatus('RESPONDED');
                setResponseText('');
                setSuccessConfig({
                    isOpen: true,
                    title: "Response Transmitted",
                    description: "Your official response has been successfully dispatched to the customer's email address."
                });
            } else {
                toast.error(res.error || 'Failed to send response');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSending(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'RESPONDED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'CLOSED': return 'bg-gray-100 text-gray-400 border-gray-200';
            default: return 'bg-gray-100 text-gray-400 border-gray-100';
        }
    };

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Link href="/admin/inquiries" className="flex items-center gap-2 text-xs font-body text-gray-400 hover:text-gray-900 transition-colors group mb-4">
                        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Inquiries
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-heading text-gray-900 tracking-tight uppercase">Inquiry #{inquiry.id.slice(-6)}</h1>
                        <span className={cn(
                            "text-[9px] font-body tracking-widest uppercase px-2.5 py-1 rounded-full border",
                            getStatusColor(currentStatus)
                        )}>
                            {currentStatus}
                        </span>
                    </div>
                    <p className="text-sm font-body text-gray-500">Received on {format(new Date(inquiry.createdAt), 'MMMM dd, yyyy at HH:mm')}</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleStatusUpdate('RESPONDED')}
                        disabled={isUpdating || currentStatus === 'RESPONDED'}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-xs font-body tracking-wider hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                        Mark as Responded
                    </button>
                    <button
                        onClick={() => handleStatusUpdate('CLOSED')}
                        disabled={isUpdating || currentStatus === 'CLOSED'}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-md text-xs font-body tracking-wider transition-colors disabled:opacity-50"
                    >
                        Close
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inquiry Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm overflow-hidden p-8">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-gray-50 rounded-full">
                                <MessageSquare className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xs font-body tracking-widest uppercase font-semibold text-gray-400 mb-2">Message</h3>
                                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                                    <p className="text-sm font-body text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {inquiry.message || "No message provided."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-100">
                            <h3 className="text-xs font-body tracking-widest uppercase font-semibold text-gray-400 mb-6">Requested Product</h3>
                            <div className="flex items-center gap-6 group">
                                <div className="w-24 h-24 rounded bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 relative">
                                    <img
                                        src={inquiry.product?.images?.[0] || '/placeholder.png'}
                                        alt=""
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-heading font-medium text-gray-900 mb-1">{inquiry.product?.name}</h4>
                                    <p className="text-xs font-body text-gray-400">{inquiry.product?.collection}</p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-body text-gray-500 uppercase tracking-wider">{inquiry.dimension}</span>
                                        <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[9px] font-body text-gray-500 uppercase tracking-wider">{inquiry.texture}</span>
                                    </div>
                                </div>
                                <Link
                                    href={`/admin/products/${inquiry.productId}`}
                                    className="p-2 text-gray-300 hover:text-gray-900 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-8">
                    <div className="bg-white border border-[#E5E5E5] rounded-lg shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#F0F0F0] bg-gray-50/50">
                            <h3 className="text-xs font-body tracking-widest uppercase font-semibold text-gray-900">Customer Details</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 border border-gray-100">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-body font-medium text-gray-900">{inquiry.customerName}</p>
                                    <p className="text-[10px] font-body text-gray-400 uppercase tracking-wider">Inquirer</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[#F5F5F5]">
                                <div className="flex items-start gap-3">
                                    <Mail className="w-4 h-4 text-gray-300 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-body tracking-wider uppercase text-gray-400">Email Address</p>
                                        <p className="text-xs font-body text-gray-700 mt-1 truncate max-w-[180px]">{inquiry.customerEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="w-4 h-4 text-gray-300 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-body tracking-wider uppercase text-gray-400">Phone Number</p>
                                        <p className="text-xs font-body text-gray-700 mt-1">{inquiry.customerPhone || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111] border border-[#222] rounded-lg p-6 shadow-xl text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare className="w-5 h-5 text-[#C5A572]" />
                            <h3 className="text-xs font-body tracking-widest uppercase font-semibold">Direct Response</h3>
                        </div>
                        <div className="space-y-4">
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Type your response to the customer..."
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-md p-3 text-xs font-body text-white placeholder:text-white/20 focus:outline-none focus:border-[#C5A572] transition-colors resize-none"
                            />
                            <button
                                onClick={handleSendResponse}
                                disabled={isSending || !responseText.trim()}
                                className="w-full py-3 bg-[#C5A572] text-white rounded-md text-[10px] font-body uppercase tracking-[0.2em] font-bold hover:bg-[#B6945F] transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-[#C5A572]/20"
                            >
                                {isSending ? 'Sending...' : 'Send Message & Mark Responded'}
                            </button>
                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-between items-center text-[10px] uppercase tracking-wider">
                                    <span className="text-white/40">Status</span>
                                    <span className={cn(
                                        "font-bold",
                                        currentStatus === 'PENDING' ? "text-amber-400" : "text-blue-400"
                                    )}>{currentStatus}</span>
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
