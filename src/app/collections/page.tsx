import { Suspense } from 'react';
import prisma from '@/lib/db';
import { categories } from '@/lib/products';
import CollectionsClient from '@/components/CollectionsClient';

async function GetProducts() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' }
  });
  return products;
}

export default async function Collections() {
  const products = await GetProducts();

  return (
    <Suspense fallback={
      <div className="pt-32 content-padding min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground font-body text-sm tracking-widest uppercase animate-pulse">
          Sourcing Surfaces...
        </div>
      </div>
    }>
      <CollectionsClient initialProducts={products as any} categories={categories} />
    </Suspense>
  );
}
