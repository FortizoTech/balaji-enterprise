'use client';
import { useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const contactInfo = [
    { icon: MapPin, label: 'Visit Our Showroom', value: '42 Design Quarter, Victoria Island\nLagos, Nigeria' },
    { icon: Phone, label: 'Call Us', value: '+234 (0) 800 Balaji Enterprise' },
    { icon: Mail, label: 'Email Us', value: 'hello@balaji-enterprise.com' },
    { icon: Clock, label: 'Opening Hours', value: 'Mon – Fri: 9:00 AM – 6:00 PM\nSat: 10:00 AM – 4:00 PM' },
];

export default function Contact() {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Message Sent",
            description: "Thank you for reaching out. Our team will respond within 24 hours.",
        });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    };

    return (
        <div className="pt-24 md:pt-32">
            <section className="content-padding section-padding">
                <div className="max-w-6xl mx-auto">
                    <ScrollReveal>
                        <p className="font-body text-xs tracking-widest uppercase text-gold mb-6">Contact</p>
                        <h1 className="font-heading text-display text-foreground mb-6">Let's Build<br />Something Beautiful</h1>
                        <p className="font-body text-body-lg text-muted-foreground leading-relaxed max-w-2xl mb-16">
                            Whether you have a project inquiry, need samples, or simply want to learn more about
                            our collections — we'd love to hear from you.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
                        <ScrollReveal>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-transparent border-b border-border py-3 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-transparent border-b border-border py-3 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-transparent border-b border-border py-3 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                                            placeholder="+234..."
                                        />
                                    </div>
                                    <div>
                                        <label className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Subject</label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-transparent border-b border-border py-3 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="trade">Trade Program</option>
                                            <option value="samples">Sample Request</option>
                                            <option value="project">Project Support</option>
                                            <option value="order">Order Status</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="font-body text-xs tracking-widest uppercase text-muted-foreground mb-2 block">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-transparent border-b border-border py-3 font-body text-sm text-foreground focus:outline-none focus:border-gold transition-colors resize-none"
                                        placeholder="Tell us about your project or inquiry..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-gold text-secondary-foreground font-body text-sm tracking-widest uppercase px-12 py-5 hover:bg-gold/90 transition-colors"
                                >
                                    Send Message
                                </button>
                            </form>
                        </ScrollReveal>

                        <ScrollReveal delay={0.2}>
                            <div className="space-y-10">
                                {contactInfo.map((info) => (
                                    <div key={info.label} className="flex gap-5">
                                        <div className="w-12 h-12 flex items-center justify-center border border-gold/30 flex-shrink-0">
                                            <info.icon className="w-5 h-5 text-gold" />
                                        </div>
                                        <div>
                                            <p className="font-body text-xs tracking-widest uppercase text-gold mb-2">{info.label}</p>
                                            <p className="font-body text-sm text-foreground leading-relaxed whitespace-pre-line">{info.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>
        </div>
    );
}
