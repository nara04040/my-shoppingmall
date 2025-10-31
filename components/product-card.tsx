import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/types/product';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="group cursor-pointer">
        {/* 이미지 영역 */}
        <div className="relative aspect-4/3 overflow-hidden rounded-lg">
          <Image
            src={`https://placehold.co/400x300?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        {/* 정보 영역 */}
        <div className="mt-4 space-y-2">
          <h3 className="font-medium truncate">{product.name}</h3>
          <p className="text-lg font-bold">{product.price}</p>
        </div>
      </div>
    </Link>
  );
}

