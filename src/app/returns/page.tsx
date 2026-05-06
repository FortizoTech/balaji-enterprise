import React from 'react';

export default function RefundPolicyPage() {
    return (
        <div className="bg-[#FAFAFA] min-h-screen py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <header className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-heading text-[#111] mb-4 tracking-tight">Returns & Refunds</h1>
                    <p className="text-[11px] font-body tracking-[0.2em] uppercase text-gray-400">Last Updated: April 15, 2026</p>
                </header>

                <div className="bg-white border border-[#E5E5E5] rounded-lg p-8 md:p-12 space-y-12 shadow-sm">
                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">1. Returns Policy</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            We want you to be completely satisfied with your purchase. Our policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately we can’t offer you a refund or exchange.
                        </p>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging. As tiles are heavy and fragile, special care must be taken in returning them.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">2. Refunds</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
                        </p>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            If approved, your refund will be processed and a credit will automatically be applied to your original method of payment within 7–10 business days.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">3. Exchanges</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            We only replace items if they are defective or damaged during transit. If you need to exchange it for the same item, send us an email at <span className="text-[#C5A572] font-medium">support@balaji-enterprise.com</span>.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">4. Damaged Items</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            Tiles are fragile. If your order arrives damaged, please take photographs clearly showing the damage and contact us within **48 hours** of delivery. We will arrange for replacements or a partial refund as appropriate.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">5. Return Shipping</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            You will be responsible for paying for your own shipping costs for returning your item unless the item is defective. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.
                        </p>
                    </section>

                    <section className="space-y-4 border-t border-gray-100 pt-8 mt-12">
                        <h2 className="text-lg font-heading text-[#111]">Questions?</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            Our support team is here to help you with the returns process.
                            <br />
                            <span className="text-[#C5A572] font-medium mt-2 block">returns@balaji-enterprise.com</span>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
