export default function AdminLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Admin login page uses its own full-screen layout without sidebar/topbar
    return <>{children}</>;
}
