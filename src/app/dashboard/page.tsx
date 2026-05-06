import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Calendar, Clock, ArrowRight, ExternalLink } from "lucide-react";

import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const orders = await prisma.order.findMany({
        where: {
            userId: (session.user as any).id,
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    }) as any[];

    return (
        <DashboardClient
            orders={orders}
            userName={session.user?.name || 'Valued Client'}
        />
    );
}
