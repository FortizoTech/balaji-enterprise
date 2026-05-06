import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-heading text-gray-900 tracking-tight">Settings</h1>
                <p className="text-sm font-body text-gray-400 mt-1">Configure your Balaji Enterprise store</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Store Info */}
                <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                    <h3 className="text-sm font-body font-medium text-gray-700 mb-4">Store Information</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[11px] font-body tracking-wider uppercase text-gray-400 block mb-1.5">Store Name</label>
                            <input
                                defaultValue="Balaji Enterprise Digital Atelier"
                                className="w-full border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm font-body text-gray-700 focus:outline-none focus:border-[#C5A572]"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-body tracking-wider uppercase text-gray-400 block mb-1.5">Contact Email</label>
                            <input
                                defaultValue="info@balaji-enterprise.com"
                                className="w-full border border-[#E5E5E5] rounded-md px-3.5 py-2.5 text-sm font-body text-gray-700 focus:outline-none focus:border-[#C5A572]"
                            />
                        </div>
                    </div>
                </div>

                {/* Payment */}
                <div className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                    <h3 className="text-sm font-body font-medium text-gray-700 mb-4">Payment Settings</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-md">
                            <span className="text-[12px] font-body text-emerald-700">ModemPay</span>
                            <span className="text-[10px] font-body tracking-wider uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Connected</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-md">
                            <span className="text-[12px] font-body text-gray-500">Stripe</span>
                            <span className="text-[10px] font-body tracking-wider uppercase text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Not configured</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coming Soon */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-8 text-center">
                <SettingsIcon className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-body text-gray-400">Advanced settings coming in Phase 3</p>
            </div>
        </div>
    );
}
