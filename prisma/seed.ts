import { PrismaClient } from '@prisma/client';
// import { products } from '../src/lib/products';

const prisma = new PrismaClient();
const products: any[] = []; // Currently empty as we've moved to live database management

async function main() {
    console.log('--- Starting Seeding Process ---');

    for (const product of products) {
        console.log(`Upserting product: ${product.name} (${product.id})`);

        await prisma.product.upsert({
            where: { id: product.id },
            update: {
                name: product.name,
                collection: product.collection,
                category: product.category,
                price: product.price,
                unit: product.unit,
                description: product.description,
                details: product.details,
                dimensions: product.dimensions,
                material: product.material,
                finish: product.finish,
                images: product.images,
                techSpecs: product.techSpecs,
                installation: product.installation,
            },
            create: {
                id: product.id,
                name: product.name,
                collection: product.collection,
                category: product.category,
                price: product.price,
                unit: product.unit,
                description: product.description,
                details: product.details,
                dimensions: product.dimensions,
                material: product.material,
                finish: product.finish,
                images: product.images,
                techSpecs: product.techSpecs,
                installation: product.installation,
            },
        });
    }

    console.log('--- Seeding Completed Successfully ---');
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
