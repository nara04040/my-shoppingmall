import { getActiveProductsServer } from '@/lib/supabase/queries/products';
import { ProductGrid } from '@/components/product-grid';
import type { Category } from '@/components/category-filter';

/**
 * @file app/products/page.tsx
 * @description 상품 목록 페이지
 *
 * 이 페이지는 모든 상품을 목록 형태로 표시하며, 카테고리 필터링, 정렬, 페이지네이션 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. URL 쿼리 파라미터로 필터링/정렬/페이지네이션 상태 관리
 * 2. 서버 사이드에서 상품 데이터 페칭
 * 3. 카테고리 필터링
 * 4. 정렬 기능 (추후 구현)
 * 5. 페이지네이션 (추후 구현)
 *
 * 핵심 구현 로직:
 * - Next.js 15의 searchParams를 await하여 쿼리 파라미터 읽기
 * - Server Component로 구현하여 서버 사이드 데이터 페칭
 * - 쿼리 파라미터: category, page, sort, limit
 *
 * @dependencies
 * - @/lib/supabase/queries/products: 상품 조회 함수
 * - @/components/product-grid: 상품 그리드 컴포넌트
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
  const category = (params.category as Category) || 'all';
  const page = parseInt(params.page || '1', 10);
  const sort = params.sort || 'latest';
  const limit = parseInt(params.limit || '12', 10);

  // 서버 사이드에서 상품 데이터 페칭
  // TODO: 페이지네이션/정렬/카테고리 필터 기능이 추가되면 getProductsWithPagination 사용
  const products = await getActiveProductsServer();

  // 카테고리 필터링 (클라이언트 사이드, 추후 서버 사이드로 이동 예정)
  const filteredProducts = category === 'all' || !category
    ? products
    : products.filter((product) => product.category === category);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">상품 목록</h1>
        <p className="text-gray-600">
          {filteredProducts.length}개의 상품이 있습니다.
        </p>
      </div>

      {/* TODO: 정렬 컴포넌트 추가 */}
      {/* <ProductSort currentSort={sort} /> */}

      <ProductGrid 
        products={filteredProducts}
        initialCategory={category}
      />
    </main>
  );
}

