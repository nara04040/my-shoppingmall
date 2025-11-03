import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/product';

/**
 * @file popular-products.tsx
 * @description 인기상품 섹션 컴포넌트
 *
 * 이 컴포넌트는 홈페이지에서 인기상품을 강조 표시하는 섹션을 제공합니다.
 *
 * 주요 기능:
 * 1. 인기상품 목록 그리드 레이아웃 표시
 * 2. "더보기" 버튼으로 전체 상품 목록 페이지로 이동
 * 3. 빈 상태 메시지 표시
 *
 * 핵심 구현 로직:
 * - Server Component로 구현 (서버에서 데이터 가져옴)
 * - ProductCard 컴포넌트 재사용
 * - 반응형 그리드 레이아웃 (모바일 2열, 태블릿 3열, 데스크톱 4열)
 *
 * @dependencies
 * - @/components/product-card: 상품 카드 컴포넌트
 * - @/components/ui/button: shadcn/ui Button 컴포넌트
 * - @/types/product: Product 타입
 */

interface PopularProductsProps {
  products: Product[];
}

export function PopularProducts({ products }: PopularProductsProps) {
  if (products.length === 0) {
    return null; // 상품이 없으면 섹션을 표시하지 않음
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">인기 상품</h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/products">더보기</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

