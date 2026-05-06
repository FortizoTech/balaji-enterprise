'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isAuth = pathname.startsWith('/auth');
  const isAdmin = pathname.startsWith('/admin');
  const isDashboard = pathname === '/dashboard';

  if (isAuth || isAdmin || isDashboard) return null;

  return (
    <footer className="bg-primary text-primary-foreground section-padding">
      <div className="content-padding">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div>
            <img src="/balaji-enterprise-logo.png" alt="Balaji Enterprise" className="h-12 w-auto mb-6 brightness-200" />
            <p className="font-body text-sm text-primary-foreground/60 leading-relaxed max-w-xs">
              Crafting exceptional surfaces for extraordinary spaces since 2010.
            </p>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase mb-6 text-primary-foreground/40">Navigate</h4>
            <div className="space-y-4">
              <Link href="/" className="block font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">Home</Link>
              <Link href="/collections" className="block font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">Collections</Link>
              <Link href="/about" className="block font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">About</Link>
            </div>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase mb-6 text-primary-foreground/40">Support</h4>
            <div className="space-y-4">
              <Link href="/terms" className="block font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="block font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">Privacy Policy</Link>
              <Link href="/returns" className="block font-body text-sm text-primary-foreground/60 hover:text-gold transition-colors">Refund Policy</Link>
            </div>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-widest uppercase mb-6 text-primary-foreground/40">Contact</h4>
            <div className="space-y-4 font-body text-sm text-primary-foreground/60">
              <p>sahoebrahema1@gmail.com</p>
              <p>+220 2793008</p>
              <p>Bijilo, The Gambia</p>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-primary-foreground/30">© 2026 Balaji Enterprise. All rights reserved.</p>
          <p className="font-body text-xs text-primary-foreground/30">Artisanal Surfaces & Digital Atelier.</p>
        </div>
      </div>
    </footer>
  );
}
