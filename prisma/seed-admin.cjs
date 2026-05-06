const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'fortizoexpert@gmail.com';
    const plainPassword = 'Balaji Enterpriseadmin';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
        },
        create: {
            email,
            name: 'Fortizo Technologies',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log(`✓ Admin account configured: ${user.email} (role: ${user.role})`);
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
