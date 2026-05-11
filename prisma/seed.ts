import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const products = [
    // --- STRUCTURAL ---
    {
        id: 'structural-steel-rod',
        name: 'Concrete Reinforcement Steel Rod (Rebar)',
        collection: 'Structural',
        category: 'structural',
        status: 'ACTIVE',
        price: 450,
        unit: 'Ton',
        description: 'High-tensile steel rods for concrete reinforcement, essential for structural integrity in any construction project.',
        details: ['Available in various diameters', 'Oxidation resistant coating', 'Meets international structural standards'],
        dimensions: '12mm - 32mm diameters',
        material: 'High-Tensile Steel',
        finish: 'Ribbed',
        images: ['/assets/gallery/gallery-16.png'],
        techSpecs: { tensileStrength: '500 MPa', standard: 'BS 4449' },
        installation: ['Cutting and bending as per structural drawing', 'Fixing with binding wire']
    },
    {
        id: 'cement-white-premium',
        name: 'Premium White Cement',
        collection: 'Structural',
        category: 'structural',
        status: 'ACTIVE',
        price: 85,
        unit: '50kg Bag',
        description: 'High-grade white cement for architectural concrete and decorative finishes.',
        details: ['Extreme whiteness', 'Fast setting', 'High compressive strength'],
        dimensions: '50kg Bag',
        material: 'Portland Cement',
        finish: 'Smooth White',
        images: ['/assets/gallery/gallery-05.png', '/assets/gallery/gallery-17.png'],
        techSpecs: { whitenessValue: '90%', settingTime: '45 mins' },
        installation: ['Mix with water and fine aggregates', 'Apply as per surface requirement']
    },
    {
        id: 'roofing-tiles-stone-coated',
        name: 'Stone Coated Decra Roof Tiles',
        collection: 'Structural',
        category: 'structural',
        status: 'ACTIVE',
        price: 120,
        unit: 'Sheet',
        description: 'Premium stone-coated metal roof tiles, combining the beauty of traditional tiles with the durability of steel.',
        details: ['Lightweight but strong', 'Weather resistant', 'Available in terracotta and charcoal'],
        dimensions: '1335mm x 410mm',
        material: 'Alu-Zinc Steel with Stone Coating',
        finish: 'Stone Textured',
        images: ['/assets/gallery/gallery-08.png', '/assets/gallery/gallery-09.png'],
        techSpecs: { weight: '6.4kg/sqm', durability: '50+ years' },
        installation: ['Interlocking installation', 'Fixed with specialized roofing screws']
    },
    {
        id: 'structural-nails-pack',
        name: 'Heavy Duty Carpentry Nails',
        collection: 'Structural',
        category: 'structural',
        status: 'ACTIVE',
        price: 15,
        unit: 'Box',
        description: 'Galvanized iron nails for structural carpentry and general construction.',
        details: ['Corrosion resistant', 'Sharp point for easy penetration', 'Strong head for high driving force'],
        dimensions: '2" - 6" variants',
        material: 'Galvanized Iron',
        finish: 'Metallic',
        images: ['/assets/gallery/gallery-14.png'],
        techSpecs: { coating: 'Zinc Galvanized' },
        installation: ['Manual hammering', 'Pneumatic nailer compatible']
    },
    {
        id: 'wheelbarrow-heavy-duty',
        name: 'Tubeless Tire Wheelbarrow',
        collection: 'Structural',
        category: 'structural',
        status: 'ACTIVE',
        price: 1250,
        unit: 'Unit',
        description: 'Heavy-duty wheelbarrow with inflatable tubeless tires and a reinforced steel tray, perfect for construction sites.',
        details: ['120L capacity', 'Tubeless puncture-proof tires', 'Ergonomic handles'],
        dimensions: '1450 x 600 x 700 mm',
        material: 'Reinforced Steel',
        finish: 'Powder Coated Orange',
        images: ['/assets/scraped/Tubeless-Wheel-Barrows-Gardening-Tools-1-300x214.png'],
        techSpecs: { loadCapacity: '200 kg' },
        installation: ['Minimal assembly required']
    },

    // --- INTERIORS ---
    {
        id: 'interiors-tile-floor-30x30',
        name: 'Classic 30x30 Floor Tiles',
        collection: 'Interiors',
        category: 'interiors',
        status: 'ACTIVE',
        price: 55,
        unit: 'Sqm',
        description: 'Durable and elegant 30x30 floor tiles, perfect for high-traffic residential and commercial areas.',
        details: ['Non-slip surface', 'Easy to clean', 'Scratch resistant'],
        dimensions: '300 x 300 mm',
        material: 'Ceramic',
        finish: 'Matte',
        images: ['/assets/gallery/gallery-02.png'],
        techSpecs: { waterAbsorption: '<0.5%' },
        installation: ['Standard tile adhesive', '2mm grout line recommended']
    },
    {
        id: 'interiors-bma-paint-premium',
        name: 'BMA Premium Exterior Paint',
        collection: 'Interiors',
        category: 'interiors',
        status: 'ACTIVE',
        price: 2400,
        unit: 'Bucket (18L)',
        description: 'Official BMA Paints exterior texture. Offers extreme weather protection and vibrant, long-lasting colors.',
        details: ['Waterproof', 'UV resistant', 'Anti-fungal formula'],
        dimensions: '18L Bucket',
        material: 'Acrylic Emulsion',
        finish: 'Satin',
        images: ['/assets/gallery/gallery-07.png'],
        techSpecs: { coverage: '10-12 sqm/L', dryingTime: '4 hours' },
        installation: ['Stir well', 'Apply two coats on primed surface']
    },
    {
        id: 'interiors-hardware-plumbing-set',
        name: 'Premium Kitchen & Bathroom Taps',
        collection: 'Interiors',
        category: 'interiors',
        status: 'ACTIVE',
        price: 350,
        unit: 'Set',
        description: 'High-quality chrome-finished taps for modern kitchens and bathrooms.',
        details: ['Solid brass construction', 'Chrome finish', 'Quarter-turn ceramic disc'],
        dimensions: 'Standard fit',
        material: 'Brass',
        finish: 'Chrome',
        images: ['/assets/gallery/gallery-10.png'],
        techSpecs: { flowRate: '15L/min' },
        installation: ['Standard 15mm connection']
    },

    // --- LIFESTYLE ---
    {
        id: 'lifestyle-bedroom-set-king',
        name: 'Luxurious Smart King Bedroom Set',
        collection: 'Lifestyle',
        category: 'lifestyle',
        status: 'ACTIVE',
        price: 85000,
        unit: 'Set',
        description: 'Complete bedroom solution including 5-door wardrobe, king-size bed, dresser with LED mirror, and smart sensor bedside lighting.',
        details: ['Anti-scratch surface', 'Soft-close drawers', 'Built-in LED lighting'],
        dimensions: 'Bed: 200x200cm, Wardrobe: 240x220cm',
        material: 'Engineered Wood / Velvet Fabric',
        finish: 'Polished Veneer',
        images: ['/assets/gallery/gallery-01.png'],
        techSpecs: { warranty: '5 years' },
        installation: ['Professional assembly included']
    },

    // --- SPECIALIZED ---
    {
        id: 'specialized-electric-scooter-e1',
        name: 'Balaji Eco-Go Electric Scooter',
        collection: 'Specialized',
        category: 'specialized',
        status: 'ACTIVE',
        price: 18500,
        unit: 'Unit',
        description: 'Sustainable urban transport with long battery life and robust build quality for Gambian roads.',
        details: ['45km range', 'Foldable design', 'Dual braking system'],
        dimensions: '1100 x 500 x 1150 mm',
        material: 'Aerospace Grade Aluminum',
        finish: 'Matte Grey',
        images: ['/assets/gallery/gallery-11.png'],
        techSpecs: { maxSpeed: '25 km/h', battery: '36V 10Ah' },
        installation: ['Ready to ride', 'Initial charge required']
    }
];

async function main() {
    console.log('--- Starting Seeding Process (Balaji Enterprise) ---');

    // Create Admin User
    const adminEmail = 'admin@jbalaji.com';
    const adminPassword = 'BalajiAdmin2024!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    console.log(`Upserting admin user: ${adminEmail}`);
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: 'ADMIN',
            password: hashedPassword,
        },
        create: {
            email: adminEmail,
            role: 'ADMIN',
            password: hashedPassword,
            name: 'Balaji Admin',
        },
    });

    for (const product of products) {
        console.log(`Upserting product: ${product.name} (${product.id})`);

        await prisma.product.upsert({
            where: { id: product.id },
            update: {
                name: product.name,
                status: product.status as any,
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
                status: product.status as any,
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
