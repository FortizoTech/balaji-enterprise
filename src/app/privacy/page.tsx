import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-[#FAFAFA] min-h-screen py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <header className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-heading text-[#111] mb-4 tracking-tight">Privacy Policy</h1>
                    <p className="text-[11px] font-body tracking-[0.2em] uppercase text-gray-400">Last Updated: April 15, 2026</p>
                </header>

                <div className="bg-white border border-[#E5E5E5] rounded-lg p-8 md:p-12 space-y-12 shadow-sm">
                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">1. Commitment to Privacy</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            At Balaji Enterprise Digital Atelier, we respect your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website or make a purchase.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">2. Data Collection</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc list-inside text-sm font-body text-gray-600 space-y-2 ml-4">
                            <li>Contact information (Name, email address, phone number)</li>
                            <li>Shipping and billing addresses</li>
                            <li>Payment information (Processed securely via our payment gateways)</li>
                            <li>Order history and preferences</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">3. Use of Information</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            Your data allows us to:
                        </p>
                        <ul className="list-disc list-inside text-sm font-body text-gray-600 space-y-2 ml-4">
                            <li>Process and fulfill your orders</li>
                            <li>Communicate with you regarding your account or purchases</li>
                            <li>Improve our products and customer experience</li>
                            <li>Screen for potential risk or fraud</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">4. Data Security</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            We implement industry-standard security measures to maintain the safety of your personal information. All sensitive credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our payment provider&apos;s database only to be accessible by those authorized with special access rights.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">5. Cookies</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            We use cookies to help us remember and process the items in your shopping cart, understand and save your preferences for future visits, and compile aggregate data about site traffic.
                        </p>
                    </section>

                    <section className="space-y-4 border-t border-gray-100 pt-8 mt-12">
                        <h2 className="text-lg font-heading text-[#111]">Contact Us</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            If you have questions regarding this privacy policy, you may contact our privacy team at:
                            <br />
                            <span className="text-[#C5A572] font-medium mt-2 block">privacy@balaji-enterprise.com</span>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
