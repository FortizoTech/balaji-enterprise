import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
    try {
        const user = await prisma.user.findFirst({
            select: {
                id: true,
                email: true,
                role: true,
                password: true,
            }
        });
        console.log('User found:', user ? 'Yes' : 'No');
    } catch (err) {
        console.error('Prisma Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
