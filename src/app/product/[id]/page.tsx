import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import ProductDetailClient from '@/components/ProductDetailClient';

interface Props {
  params: { id: string };
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: {
        orderBy: { price: 'asc' }
      },
      productImages: {
        orderBy: { position: 'asc' }
      }
    }
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      status: 'ACTIVE',
      NOT: { id: product.id },
    },
    include: {
      productImages: {
        orderBy: { position: 'asc' }
      }
    },
    take: 3,
  });

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
