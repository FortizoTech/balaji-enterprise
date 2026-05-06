'use server';

import prisma from '@/lib/db';
import { BALAJI_ENTERPRISE_KNOWLEDGE } from '@/lib/knowledge';

export async function sendChatRequest(message: string, userId: string = 'user_123') {
    const API_KEY = process.env.GEMINI_API_KEY || process.env.COZE_API_KEY;

    if (!API_KEY) {
        console.error('Gemini API Key missing');
        return { success: false, error: 'Chatbot configuration incomplete' };
    }

    try {
        // 1. Search for products if the query seems product-related
        const keywords = ['tile', 'marble', 'porcelain', 'stone', 'buy', 'price', 'collection', 'find', 'show', 'recommend', 'product'];
        const isProductQuery = keywords.some(k => message.toLowerCase().includes(k));

        let productContext = '';
        if (isProductQuery) {
            const products = await prisma.product.findMany({
                where: { status: 'ACTIVE' },
                take: 6,
                orderBy: { updatedAt: 'desc' },
                include: { productImages: { take: 1, orderBy: { position: 'asc' } } }
            });

            if (products.length > 0) {
                productContext = `HERE ARE SOME RELEVANT PRODUCTS CURRENTLY AT THE ATELIER:\n${products.map(p =>
                    `- ${p.name} (${p.category}): D${p.price.toLocaleString()} per sqm. Link: /collections/${p.slug}. Image: ${p.productImages[0]?.url || ''}`
                ).join('\n')}\n`;
            }
        }

        const systemPrompt = `You are the Balaji Enterprise Atelier Concierge, a premium AI design assistant.
COMPANY INFO: ${BALAJI_ENTERPRISE_KNOWLEDGE.company.legacy}
LOCATIONS: ${BALAJI_ENTERPRISE_KNOWLEDGE.company.locations[0].name} at ${BALAJI_ENTERPRISE_KNOWLEDGE.company.locations[0].address}.
POLICIES:
- Shipping: ${BALAJI_ENTERPRISE_KNOWLEDGE.policies.shipping.details}
- Returns: ${BALAJI_ENTERPRISE_KNOWLEDGE.policies.returns.details}
- Privacy: ${BALAJI_ENTERPRISE_KNOWLEDGE.policies.privacy.details}
ORDERING: ${BALAJI_ENTERPRISE_KNOWLEDGE.ordering.process.join(' ')}

${productContext}

INSTRUCTIONS:
1. Be sophisticated, professional, and helpful.
2. If you recommend specific products from the context, list them in your text but ALSO append a special block at the end like this:
[RECOMMENDATIONS: [{"name": "Product Name", "price": "D0", "image": "url", "url": "/collections/slug"}]]
3. Use GMD or D as the currency symbol.
4. If no products are relevant, don't include the block.
5. Focus on luxury craftsmanship and design excellence.
`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: `${systemPrompt}\n\nClient: ${message}` }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('Gemini API Error:', data.error.message);
            const errMsg = (data.error.message || '').toLowerCase();

            // Mask technical errors with premium brand-consistent language
            if (errMsg.includes('quota') || errMsg.includes('rate limit')) {
                return {
                    success: false,
                    error: "I apologize, but our high-performance design engine is currently experiencing exceptionally high traffic. Please allow me a brief moment to recalibrate, or feel free to contact our specialists directly for immediate assistance."
                };
            }

            return {
                success: false,
                error: "I am temporarily unable to process your request. Please try again shortly or explore our Collections while I restore connectivity."
            };
        }

        const botText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!botText) {
            return { success: false, error: 'Failed to generate response' };
        }

        return { success: true, text: botText };

    } catch (error) {
        console.error('Chatbot Action Error:', error);
        return { success: false, error: 'Internal server error' };
    }
}
