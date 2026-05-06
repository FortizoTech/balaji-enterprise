'use server';

import prisma from '@/lib/db';

export async function createPaymentIntent(amount: number, orderId: string, email: string, name: string, phone: string) {
    try {
        const modemPayMode = process.env.NEXT_PUBLIC_MODEM_PAY_MODE || 'test';
        const secretKey = modemPayMode === 'live'
            ? process.env.MODEM_PAY_LIVE_SECRET_KEY
            : process.env.MODEM_PAY_TEST_SECRET_KEY;

        const subAccount = process.env.NEXT_PUBLIC_MODEM_PAY_SUB_ACCOUNT;

        // Detect Base URL more robustly for Vercel and Production
        let baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        // Vercel specific detection
        if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
            baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
        } else if (process.env.VERCEL_URL && (!baseUrl || baseUrl.includes('localhost'))) {
            baseUrl = `https://${process.env.VERCEL_URL}`;
        }

        // Force HTTPS for live mode
        if (modemPayMode === 'live' && !baseUrl.startsWith('https://')) {
            baseUrl = baseUrl.replace('http://', 'https://');
            if (!baseUrl.startsWith('https://')) baseUrl = `https://${baseUrl.replace(/^\/+/, '')}`;
        }

        if (!secretKey) {
            console.warn("Modem Pay secret key missing. Failing payment intent.");
            return { success: false, error: "Payment Gateway Error: Missing configuration." };
        }

        const payload: any = {
            amount: Math.round(amount),
            currency: 'GMD',
            reference: orderId,
            metadata: { order_id: orderId },
            customer_email: email,
            customer_name: name,
            customer_phone: phone,
            callback_url: `${baseUrl}/api/webhooks/modempay`,
            return_url: `${baseUrl}/dashboard`,
            from_sdk: false // Required for server-side intent creation
        };

        if (subAccount && modemPayMode === 'live') {
            payload.sub_account = subAccount;
        }

        const response = await fetch('https://api.modempay.com/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secretKey}`
            },
            body: JSON.stringify({ data: payload })
        });

        const data = await response.json();

        if (!response.ok || data.status !== true) {
            console.error("Failed to create Modem Pay intent:", data);
            return {
                success: false,
                error: data.message || "Failed to initialize secure payment."
            };
        }

        return { success: true, intent: data.data };
    } catch (e) {
        console.error("Error creating payment intent:", e);
        return { success: false, error: "Network error occurred." };
    }
}
