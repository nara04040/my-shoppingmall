'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { CategoryFilter, type Category } from '@/components/category-filter';
import { EmptyState } from '@/components/empty-state';
import { Package, Inbox } from 'lucide-react';
import type { Product } from '@/types/product';

/**
 * @file product-grid.tsx
 * @description 상품 그리드 및 카테고리 필터링 컴포넌트 (URL 파라미터 연동)
 *
 * 이 컴포넌트는 서버 사이드에서 필터링된 상품 목록을 그리드 형태로 표시하고,
 * URL 쿼리 파라미터를 통해 카테고리 필터링 상태를 관리합니다.
 *
 * 주요 기능:
 * 1. 서버 사이드에서 필터링된 상품 목록 표시
 * 2. URL 쿼리 파라미터로 카테고리 필터 상태 관리
 * 3. 카테고리 변경 시 URL 업데이트하여 서버 사이드 필터링 트리거
 * 4. 상품 목록 그리드 레이아웃 표시
 * 5. 빈 상태 메시지 표시
 *
 * 핵심 구현 로직:
 * - 서버 사이드에서 이미 필터링된 products prop을 받아서 표시만 함
 * - useSearchParams로 현재 URL 파라미터 읽기
 * - useRouter로 URL 파라미터 업데이트 (서버 사이드 필터링 트리거)
 * - CategoryFilter와 연동하여 카테고리 변경 시 URL 업데이트
 *
 * @note
 * - 실제 필터링은 서버 사이드에서 getProductsWithPagination에서 처리됨
 * - 클라이언트 사이드에서는 URL 파라미터만 관리하고 표시만 담당
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/components/product-card: 상품 카드 컴포넌트
 * - @/components/category-filter: 카테고리 필터 컴포넌트
 * - @/types/product: Product 타입
 */

interface ProductGridProps {
  products: Product[];
  initialCategory?: Category;
}

export function ProductGrid({ products, initialCategory }: ProductGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 현재 카테고리 읽기
  const currentCategory = (searchParams.get('category') as Category) || initialCategory || 'all';

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category: Category) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category === 'all' || category === null) {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    // 페이지는 항상 1로 리셋
    params.delete('page');
    
    // URL 업데이트 (페이지 리로드 없이)
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <CategoryFilter 
        onCategoryChange={handleCategoryChange}
        initialCategory={currentCategory}
      />

      {products.length === 0 ? (
        <EmptyState
          icon={
            currentCategory === 'all' || currentCategory === null ? (
              <Package className="size-16" />
            ) : (
              <Inbox className="size-16" />
            )
          }
          title={
            currentCategory === 'all' || currentCategory === null
              ? '등록된 상품이 없습니다'
              : '해당 카테고리의 상품이 없습니다'
          }
          description={
            currentCategory === 'all' || currentCategory === null
              ? '새로운 상품이 곧 등록될 예정입니다.'
              : '다른 카테고리의 상품을 확인해보세요.'
          }
          action={
            currentCategory === 'all' || currentCategory === null
              ? undefined
              : {
                  label: '전체 상품 보기',
                  href: '/products',
                }
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

