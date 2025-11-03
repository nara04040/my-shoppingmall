import { getProductsWithPagination } from '@/lib/supabase/queries/products';
import { ProductGrid } from '@/components/product-grid';
import { ProductSort } from '@/components/product-sort';
import { ProductPagination } from '@/components/product-pagination';
import type { Category } from '@/components/category-filter';
import type { SortOption } from '@/lib/supabase/queries/products';

/**
 * @file app/products/page.tsx
 * @description 상품 목록 페이지
 *
 * 이 페이지는 모든 상품을 목록 형태로 표시하며, 카테고리 필터링, 정렬, 페이지네이션 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. URL 쿼리 파라미터로 필터링/정렬/페이지네이션 상태 관리
 * 2. 서버 사이드에서 상품 데이터 페칭 (getProductsWithPagination 사용)
 * 3. 카테고리 필터링 (서버 사이드)
 * 4. 정렬 기능 (서버 사이드)
 * 5. 페이지네이션 (서버 사이드)
 *
 * 핵심 구현 로직:
 * - Next.js 15의 searchParams를 await하여 쿼리 파라미터 읽기
 * - Server Component로 구현하여 서버 사이드 데이터 페칭
 * - 쿼리 파라미터: category, page, sort, limit
 * - getProductsWithPagination으로 페이지네이션/정렬/필터링 처리
 *
 * @dependencies
 * - @/lib/supabase/queries/products: 상품 조회 함수
 * - @/components/product-grid: 상품 그리드 컴포넌트
 * - @/components/product-sort: 정렬 UI 컴포넌트
 * - @/components/product-pagination: 페이지네이션 컴포넌트
 * - @/components/category-filter: 카테고리 필터 타입
 */

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
    sort?: string;
    limit?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Next.js 15에서는 searchParams를 await 해야 함
  const params = await searchParams;
  
  // URL 쿼리 파라미터 파싱
  const category = (params.category as Category) || null;
  const page = parseInt(params.page || '1', 10);
  const sort = (params.sort as SortOption) || 'latest';
  const limit = parseInt(params.limit || '12', 10);

  // 서버 사이드에서 페이지네이션된 상품 데이터 페칭
  const { products, totalCount, currentPage, totalPages } = await getProductsWithPagination({
    category: category === 'all' ? null : category,
    page,
    limit,
    sortBy: sort,
  });

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">상품 목록</h1>
        <p className="text-gray-600">
          총 {totalCount}개의 상품이 있습니다.
        </p>
      </div>

      {/* 정렬 컴포넌트 */}
      <ProductSort initialSort={sort} />

      {/* 상품 그리드 */}
      <ProductGrid 
        products={products}
        initialCategory={category || 'all'}
      />

      {/* 페이지네이션 */}
      <ProductPagination 
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </main>
  );
}

