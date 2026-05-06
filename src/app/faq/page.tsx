'use client';
import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqCategories = [
    {
        category: 'Ordering & Delivery',
        questions: [
            { q: 'What is the minimum order quantity?', a: 'For standard collections, our minimum order is 5 square metres. For custom orders and bespoke finishes, please contact our trade team for specific requirements.' },
            { q: 'How long does delivery take?', a: 'Standard delivery within the UK takes 5–7 business days. International orders typically arrive within 10–15 business days. Express options are available for urgent projects.' },
            { q: 'Do you ship internationally?', a: 'Yes, we deliver worldwide. Shipping costs and timelines vary by destination. Contact us for a detailed quote for your location.' },
            { q: 'Can I track my order?', a: 'Absolutely. Once shipped, you will receive a tracking number via email so you can monitor your delivery in real time.' },
        ],
    },
    {
        category: 'Products & Materials',
        questions: [
            { q: 'Are your tiles suitable for outdoor use?', a: 'Select collections are rated for exterior applications. Look for our "Outdoor Rated" badge, or contact us for recommendations based on your climate.' },
            { q: 'Do you offer custom sizes or finishes?', a: 'Yes. Through our Trade Program, we can source bespoke sizes, thicknesses, and finishes. Lead times for custom orders typically range from 6–10 weeks.' },
            { q: 'What is the difference between porcelain and ceramic tiles?', a: 'Porcelain is fired at higher temperatures, making it denser, more durable, and less porous than ceramic. It is ideal for high-traffic and wet areas.' },
            { q: 'How do I calculate how many tiles I need?', a: 'Measure the total area in square metres and add 10–15% for cuts and wastage. Our team can assist with precise calculations if needed.' },
        ],
    },
    {
        category: 'Returns & Warranty',
        questions: [
            { q: 'What is your return policy?', a: 'Unopened and undamaged tiles may be returned within 30 days of delivery for a full refund. Custom orders are non-refundable.' },
            { q: 'Do your tiles come with a warranty?', a: 'All Balaji Enterprise products carry a 10-year warranty against manufacturing defects when installed according to our guidelines.' },
            { q: 'What if my tiles arrive damaged?', a: 'Contact us within 48 hours of delivery with photos of the damage. We will arrange a free replacement shipment immediately.' },
        ],
    },
];

export default function FAQ() {
    return (
        <div className="pt-24 md:pt-32">
            <section className="content-padding section-padding">
                <div className="max-w-4xl mx-auto">
                    <ScrollReveal>
                        <p className="font-body text-xs tracking-widest uppercase text-gold mb-6">FAQs</p>
                        <h1 className="font-heading text-display text-foreground mb-6">Frequently Asked<br />Questions</h1>
                        <p className="font-body text-body-lg text-muted-foreground leading-relaxed max-w-2xl mb-16">
                            Find answers to common questions about our products, ordering process, and services.
                        </p>
                    </ScrollReveal>

                    <div className="space-y-16">
                        {faqCategories.map((category) => (
                            <ScrollReveal key={category.category}>
                                <h2 className="font-heading text-2xl text-foreground mb-8">{category.category}</h2>
                                <Accordion type="single" collapsible className="space-y-2">
                                    {category.questions.map((faq, i) => (
                                        <AccordionItem key={i} value={`${category.category}-${i}`} className="border border-border px-6">
                                            <AccordionTrigger className="font-body text-sm text-foreground hover:text-gold transition-colors py-5 hover:no-underline">
                                                {faq.q}
                                            </AccordionTrigger>
                                            <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed pb-5">
                                                {faq.a}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-primary section-padding content-padding">
                <ScrollReveal>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-heading text-headline text-primary-foreground mb-4">Still Have Questions?</h2>
                        <p className="font-body text-sm text-primary-foreground/70 mb-8">Our team is happy to help with any additional queries.</p>
                        <Link
                            href="/contact"
                            className="inline-block bg-gold text-secondary-foreground font-body text-sm tracking-widest uppercase px-12 py-5 hover:bg-gold/90 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </ScrollReveal>
            </section>
        </div>
    );
}
