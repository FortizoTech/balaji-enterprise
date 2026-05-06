'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Search, PenTool, BookOpen, HardHat, PackageSearch, Headset, HelpCircle, Wrench, Phone, ArrowRight, ShoppingCart } from "lucide-react";

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const location = { pathname };
  const itemCount = useCartStore((s) => s.itemCount());
  const isHome = location.pathname === '/';
  const isLogin = location.pathname.startsWith('/auth');
  const isAdmin = location.pathname.startsWith('/admin');
  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLogin || isAdmin || isDashboard) return null;

  const isTransparent = isHome && !isScrolled;

  const navLinkClass = cn(
    "font-body text-sm tracking-widest uppercase transition-colors duration-300 bg-transparent py-2 px-4 rounded-md",
    isTransparent
      ? "text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
  );

  const navTriggerClass = cn(
    "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 font-body text-sm tracking-widest uppercase transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
    isTransparent
      ? "text-primary-foreground/90 hover:text-primary-foreground hover:bg-white/10 data-[state=open]:bg-white/10 data-[active]:bg-white/10 data-[state=open]:text-white"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 data-[state=open]:bg-muted/50 data-[state=open]:text-foreground data-[active]:bg-muted/50"
  );

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTransparent ? 'bg-transparent' : 'bg-background/95 backdrop-blur-sm border-b border-border shadow-sm'}`}>
        <div className="content-padding flex items-center justify-between h-20 md:h-24">
          <Link href="/" className="relative z-50 flex-shrink-0">
            <img src="/balaji-enterprise-logo.png" alt="Balaji Enterprise" className="h-10 md:h-12 w-auto" />
          </Link>

          <div className="hidden md:flex items-center justify-center flex-1">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/" className={navLinkClass}>
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/collections" className={navLinkClass}>
                      Collections
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className={navTriggerClass}>
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[100vw] bg-background border-b shadow-xl">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-12 md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto">
                        {/* PRODUCT DISCOVERY */}
                        <div className="flex flex-col gap-6">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Product Discovery</h4>
                          <div className="flex flex-col gap-4">
                            <NavigationMenuLink asChild>
                              <Link href="/collections" className="group flex flex-col gap-1.5 focus:outline-none">
                                <div className="flex items-center gap-2 font-medium text-foreground group-hover:text-gold transition-colors">
                                  <Search className="w-4 h-4 text-muted-foreground group-hover:text-gold" /> Browse collection
                                </div>
                                <p className="text-xs text-muted-foreground font-body leading-relaxed">Explore our curated tile selection.</p>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link href="/inspiration" className="group flex flex-col gap-1.5 focus:outline-none">
                                <div className="flex items-center gap-2 font-medium text-foreground group-hover:text-gold transition-colors">
                                  <PenTool className="w-4 h-4 text-muted-foreground group-hover:text-gold" /> Design inspiration
                                </div>
                                <p className="text-xs text-muted-foreground font-body leading-relaxed">See real projects and creative ideas.</p>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link href="/guide" className="group flex flex-col gap-1.5 focus:outline-none">
                                <div className="flex items-center gap-2 font-medium text-foreground group-hover:text-gold transition-colors">
                                  <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-gold" /> Material guide
                                </div>
                                <p className="text-xs text-muted-foreground font-body leading-relaxed">Learn about finishes and durability.</p>
                              </Link>
                            </NavigationMenuLink>
                          </div>
                        </div>

                        {/* FOR PROFESSIONALS */}
                        <div className="flex flex-col gap-6">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">For Professionals</h4>
                          <div className="flex flex-col gap-4">
                            <NavigationMenuLink asChild>
                              <Link href="/trade" className="group flex flex-col gap-1.5 focus:outline-none">
                                <div className="flex items-center gap-2 font-medium text-foreground group-hover:text-gold transition-colors">
                                  <HardHat className="w-4 h-4 text-muted-foreground group-hover:text-gold" /> Trade program
                                </div>
                                <p className="text-xs text-muted-foreground font-body leading-relaxed">Exclusive benefits for architects and designers.</p>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link href="/samples" className="group flex flex-col gap-1.5 focus:outline-none">
                                <div className="flex items-center gap-2 font-medium text-foreground group-hover:text-gold transition-colors">
                                  <PackageSearch className="w-4 h-4 text-muted-foreground group-hover:text-gold" /> Sample ordering
                                </div>
                                <p className="text-xs text-muted-foreground font-body leading-relaxed">Order samples for your next project.</p>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link href="/support" className="group flex flex-col gap-1.5 focus:outline-none">
                                <div className="flex items-center gap-2 font-medium text-foreground group-hover:text-gold transition-colors">
                                  <Headset className="w-4 h-4 text-muted-foreground group-hover:text-gold" /> Project support
                                </div>
                                <p className="text-xs text-muted-foreground font-body leading-relaxed">Get expert advice for your build.</p>
                              </Link>
                            </NavigationMenuLink>
                          </div>
                        </div>

                        {/* RESOURCES */}
                        <div className="flex flex-col gap-6">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Resources</h4>
                          <div className="flex flex-col gap-4">
                            <NavigationMenuLink asChild>
                              <Link href="/faq" className="group flex flex-col gap-1.5 focus:outline-none">
                                <div className="flex items-center gap-2 font-medium text-foreground group-hover:text-gold transition-colors">
                                  <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-gold" /> FAQs
                                </div>
                                <p className="text-xs text-muted-foreground font-body leading-relaxed">Find answers to common questions.</p>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link href="/care" className="group flex flex-col gap-1.5 focus:outline-none">
                                <div className="flex items-center gap-2 font-medium text-foreground group-hover:text-gold transition-colors">
                                  <Wrench className="w-4 h-4 text-muted-foreground group-hover:text-gold" /> Care & install
                                </div>
                                <p className="text-xs text-muted-foreground font-body leading-relaxed">Guides for maintenance and installation.</p>
                              </Link>
                            </NavigationMenuLink>
                            <NavigationMenuLink asChild>
                              <Link href="/contact" className="group flex flex-col gap-1.5 focus:outline-none">
                                <div className="flex items-center gap-2 font-medium text-foreground group-hover:text-gold transition-colors">
                                  <Phone className="w-4 h-4 text-muted-foreground group-hover:text-gold" /> Contact
                                </div>
                                <p className="text-xs text-muted-foreground font-body leading-relaxed">Reach our team for assistance.</p>
                              </Link>
                            </NavigationMenuLink>
                          </div>
                        </div>

                        {/* CALLOUT PANEL */}
                        <div
                          className="relative flex flex-col justify-end items-start p-8 shadow-2xl ml-4 w-full aspect-square bg-cover bg-center rounded-none"
                          style={{ backgroundImage: `url('/premium_tile_banner.png')` }}
                        >
                          <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
                          <div className="relative z-10 flex flex-col gap-3 w-full">
                            <h3 className="font-heading text-3xl font-semibold leading-tight text-white drop-shadow-md">Elevate every surface<br />with intention</h3>
                            <p className="text-xs text-white/90 leading-relaxed font-body drop-shadow-sm">Premium tiles for refined, architectural spaces. Discover the difference in detail and design.</p>
                            <NavigationMenuLink asChild>
                              <Link href="/collections" className="text-sm font-semibold flex items-center gap-2 group text-white hover:text-gold transition-colors mt-2">
                                View tiles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </NavigationMenuLink>
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/about" className={navLinkClass}>
                      About us
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-6 justify-end">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={cn(
                "relative transition-colors duration-300 hidden md:flex items-center",
                isTransparent ? 'text-primary-foreground/80 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/cart"
              className={cn(
                "relative transition-colors duration-300 hidden md:flex items-center group",
                isTransparent ? 'text-primary-foreground/80 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-gold text-secondary-foreground text-[9px] font-body font-bold flex items-center justify-center rounded-none shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {status === "authenticated" ? (
                <div className="relative group">
                  <button
                    className={cn(
                      "flex items-center gap-2 font-body text-sm tracking-widest uppercase transition-colors duration-300 py-2",
                      isTransparent ? 'text-primary-foreground/80 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-7 h-7 rounded-full border border-gold/20 object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center text-[10px] text-gold font-bold border border-gold/20">
                        {session?.user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </button>

                  {/* Premium Dropdown Menu */}
                  <div className="absolute right-0 top-full w-52 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-[100]">
                    <div className="bg-background border border-border shadow-2xl p-2">
                      <Link
                        href="/dashboard"
                        className="block w-full text-left px-4 py-3 font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                      >
                        Studio Dashboard
                      </Link>
                      <div className="h-[0.5px] bg-border/50 my-1 mx-2" />
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="block w-full text-left px-4 py-3 font-body text-[10px] tracking-[0.2em] uppercase text-red-500/70 hover:text-red-600 hover:bg-red-50/50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className={cn(
                    "font-body text-sm tracking-widest uppercase transition-colors duration-300",
                    isTransparent ? 'text-primary-foreground/80 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Sign In
                </Link>
              )}
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "p-2 transition-colors",
                  isTransparent && !mobileOpen ? 'text-primary-foreground' : 'text-foreground'
                )}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/cart"
                className={cn(
                  "p-2 transition-colors relative",
                  isTransparent && !mobileOpen ? 'text-primary-foreground' : 'text-foreground'
                )}
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {mounted && itemCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-gold text-secondary-foreground text-[8px] font-body font-bold flex items-center justify-center rounded-none">
                    {itemCount}
                  </span>
                )}
              </Link>

              {status === "authenticated" && (
                <Link
                  href="/dashboard"
                  className={cn(
                    "p-1.5 transition-colors",
                    isTransparent && !mobileOpen ? 'text-primary-foreground' : 'text-foreground'
                  )}
                  aria-label="Account"
                >
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-6 h-6 rounded-full border border-gold/20 object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gold/5 flex items-center justify-center text-[9px] text-gold font-bold border border-gold/20">
                      {session?.user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </Link>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden relative z-50 w-8 h-8 flex flex-col justify-center gap-1.5 ${isTransparent && !mobileOpen ? 'text-primary-foreground' : 'text-foreground'}`}
              aria-label="Menu"
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                className="block w-6 h-[1.5px] bg-current"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block w-6 h-[1.5px] bg-current"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                className="block w-6 h-[1.5px] bg-current"
              />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-8"
          >
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-10 right-10 text-muted-foreground hover:text-foreground p-2 transition-colors"
            >
              <ArrowRight className="w-8 h-8 rotate-45" /> {/* Close icon would be better but ArrowRight is already here */}
            </button>
            <div className="w-full max-w-4xl">
              <p className="font-body text-xs tracking-widest uppercase text-gold mb-8 text-center italic">What are you looking for?</p>
              <div className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="Type to search archive..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsSearchOpen(false);
                      window.location.href = `/collections?q=${encodeURIComponent(localSearch)}`;
                    }
                    if (e.key === 'Escape') setIsSearchOpen(false);
                  }}
                  className="w-full bg-transparent border-b-2 border-foreground/10 focus:border-gold py-8 font-heading text-4xl md:text-6xl text-foreground text-center focus:outline-none transition-all placeholder:text-muted-foreground/20"
                />
                <div className="flex justify-center mt-12 gap-8 overflow-x-auto pb-4 no-scrollbar">
                  {['Spanish', 'Floor', 'Wall', 'Bathroom', '60x60'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setLocalSearch(tag);
                        setIsSearchOpen(false);
                        window.location.href = `/collections?q=${encodeURIComponent(tag)}`;
                      }}
                      className="font-body text-[10px] tracking-widest uppercase text-muted-foreground hover:text-gold border border-border px-4 py-2 hover:border-gold transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-background flex flex-col justify-center content-padding pt-24 overflow-y-auto"
          >
            <div className="space-y-8 pb-24">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                {/* Removed redundant Search link as it is now in TopBar */}
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="font-heading text-4xl text-foreground hover:text-gold transition-colors block mb-8"
                >
                  Home
                </Link>
                <Link
                  href="/collections"
                  onClick={() => setMobileOpen(false)}
                  className="font-heading text-4xl text-foreground hover:text-gold transition-colors block mb-8"
                >
                  Collections
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col gap-4"
              >
                <button
                  onClick={() => setMobileSolutionsOpen(!mobileSolutionsOpen)}
                  className="font-heading text-4xl text-foreground hover:text-gold transition-colors text-left flex justify-between items-center mb-4"
                >
                  Solutions
                </button>
                <AnimatePresence>
                  {mobileSolutionsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-col gap-4 pl-4 overflow-hidden border-l-2 border-border ml-2"
                    >
                      <Link href="/collections" onClick={() => setMobileOpen(false)} className="text-xl font-heading text-muted-foreground hover:text-foreground pt-2">Product Discovery</Link>
                      <Link href="/trade" onClick={() => setMobileOpen(false)} className="text-xl font-heading text-muted-foreground hover:text-foreground">For Professionals</Link>
                      <Link href="/faq" onClick={() => setMobileOpen(false)} className="text-xl font-heading text-muted-foreground hover:text-foreground pb-2">Resources</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Link
                  href="/about"
                  onClick={() => setMobileOpen(false)}
                  className="font-heading text-4xl text-foreground hover:text-gold transition-colors"
                >
                  About Us
                </Link>
              </motion.div>

              {/* Removed redundant Cart link as it is now in TopBar */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
