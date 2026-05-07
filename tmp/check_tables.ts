import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('Tables in database:', tables);
    } catch (e) {
        console.error('Error checking tables:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
