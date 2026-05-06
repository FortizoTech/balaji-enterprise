import type { Metadata } from "next";
import "@/index.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "Balaji Enterprise Digital Atelier",
    description: "Premium products and enterprise solutions by Balaji Enterprise.",
    icons: {
        icon: "/favicon.png",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased">
                <Providers>
                    <Navigation />
                    <main>{children}</main>
                    <Footer />
                    <FloatingWidgets />
                </Providers>
            </body>
        </html>
    );
}
