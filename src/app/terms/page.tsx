import React from 'react';

export default function TermsOfServicePage() {
    return (
        <div className="bg-[#FAFAFA] min-h-screen py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <header className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-heading text-[#111] mb-4 tracking-tight">Terms of Service</h1>
                    <p className="text-[11px] font-body tracking-[0.2em] uppercase text-gray-400">Last Updated: April 15, 2026</p>
                </header>

                <div className="bg-white border border-[#E5E5E5] rounded-lg p-8 md:p-12 space-y-12 shadow-sm">
                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">1. Agreement to Terms</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            By accessing or using the Balaji Enterprise Digital Atelier website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">2. Use License</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            Permission is granted to temporarily download one copy of the materials (information or software) on Balaji Enterprise&apos; website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc list-inside text-sm font-body text-gray-600 space-y-2 ml-4">
                            <li>Modify or copy the materials;</li>
                            <li>Use the materials for any commercial purpose, or for any public display;</li>
                            <li>Attempt to decompile or reverse engineer any software contained on the website;</li>
                            <li>Remove any copyright or other proprietary notations from the materials.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">3. Disclaimer</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed italic">
                            The materials on Balaji Enterprise Digital Atelier&apos;s website are provided on an &apos;as is&apos; basis. Balaji Enterprise makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">4. Accuracy of Materials</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            The materials appearing on Balaji Enterprise website could include technical, typographical, or photographic errors. Balaji Enterprise does not warrant that any of the materials on its website are accurate, complete, or current. Balaji Enterprise may make changes to the materials contained on its website at any time without notice.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-heading text-[#111]">5. Governing Law</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            These terms and conditions are governed by and construed in accordance with the laws of The Gambia, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                        </p>
                    </section>

                    <section className="space-y-4 border-t border-gray-100 pt-8 mt-12">
                        <h2 className="text-lg font-heading text-[#111]">Need Assistance?</h2>
                        <p className="text-sm font-body text-gray-600 leading-relaxed">
                            If you have any questions about these Terms, please reach out to our legal department:
                            <br />
                            <span className="text-[#C5A572] font-medium mt-2 block">legal@balaji-enterprise.com</span>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
