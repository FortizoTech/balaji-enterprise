import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        // @ts-ignore
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { entity, ids, deleteAll } = await req.json();

        if (!entity) {
            return NextResponse.json({ error: 'Entity is required' }, { status: 400 });
        }

        let deletedCount = 0;

        const processDelete = async (model: any) => {
            if (deleteAll) {
                const res = await model.deleteMany({});
                return res.count;
            } else if (ids && ids.length > 0) {
                const res = await model.deleteMany({
                    where: { id: { in: ids } }
                });
                return res.count;
            }
            return 0;
        };

        switch (entity) {
            case 'products':
                deletedCount = await processDelete(prisma.product);
                break;
            case 'orders':
                deletedCount = await processDelete(prisma.order);
                break;
            case 'inquiries':
                deletedCount = await processDelete(prisma.inquiry);
                break;
            case 'customers':
                // Do not delete ADMIN users if deleteAll
                if (deleteAll) {
                    const res = await prisma.user.deleteMany({ where: { role: 'USER' } });
                    deletedCount = res.count;
                } else if (ids && ids.length > 0) {
                    const res = await prisma.user.deleteMany({ where: { id: { in: ids }, role: 'USER' } });
                    deletedCount = res.count;
                }
                break;
            case 'financials':
                if (deleteAll) {
                    const pRes = await prisma.payout.deleteMany({});
                    const tRes = await prisma.transaction.deleteMany({});
                    const wRes = await prisma.withdrawalRequest.deleteMany({});
                    deletedCount = pRes.count + tRes.count + wRes.count;
                } else if (ids && ids.length > 0) {
                    const pRes = await prisma.payout.deleteMany({ where: { id: { in: ids } } });
                    const tRes = await prisma.transaction.deleteMany({ where: { id: { in: ids } } });
                    const wRes = await prisma.withdrawalRequest.deleteMany({ where: { id: { in: ids } } });
                    deletedCount = pRes.count + tRes.count + wRes.count;
                }
                break;
            default:
                return NextResponse.json({ error: 'Invalid entity' }, { status: 400 });
        }

        return NextResponse.json({ success: true, deletedCount });
    } catch (error) {
        console.error('[BULK_DELETE_ERROR]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
