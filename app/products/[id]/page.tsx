import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProductById } from '@/lib/supabase/queries/products';
import { ProductDetailCart } from '@/components/product-detail-cart';

/**
 * @file app/products/[id]/page.tsx
 * @description 상품 상세 페이지
 *
 * 이 페이지는 특정 상품의 상세 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. URL 동적 파라미터에서 상품 ID 추출
 * 2. 서버 사이드에서 상품 데이터 페칭 (getProductById 사용)
 * 3. 상품이 없거나 비활성화된 경우 404 처리
 * 4. 상품 상세 정보 레이아웃 표시 (이미지, 이름, 가격, 재고, 설명, 카테고리, 날짜)
 * 5. 장바구니 UI (우측 고정)
 *
 * 핵심 구현 로직:
 * - Next.js 15의 params를 await하여 동적 파라미터 읽기
 * - Server Component로 구현하여 서버 사이드 데이터 페칭
 * - 상품이 null인 경우 notFound() 호출
 * - 반응형 레이아웃: 모바일(세로) / 데스크톱(가로, 우측 고정)
 *
 * @dependencies
 * - @/lib/supabase/queries/products: 상품 조회 함수
 * - @/components/product-detail-cart: 장바구니 UI 컴포넌트
 */

/**
 * 카테고리 코드를 한글 레이블로 변환
 */
function getCategoryLabel(category: string | null): string {
  const categoryMap: Record<string, string> = {
    electronics: '전자제품',
    clothing: '의류',
    books: '도서',
    food: '식품',
    sports: '스포츠',
    beauty: '뷰티',
    home: '생활/가정',
  };

  return category ? categoryMap[category] || category : '미분류';
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  // Next.js 15에서는 params를 await 해야 함
  const { id } = await params;

  // 서버 사이드에서 상품 데이터 페칭
  const product = await getProductById(id);

  // 상품이 없거나 비활성화된 경우 404 처리
  if (!product) {
    notFound();
  }

  const categoryLabel = getCategoryLabel(product.category);
  const formattedCreatedAt = formatDate(product.created_at);
  const formattedUpdatedAt = formatDate(product.updated_at);
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      {/* 레이아웃: 모바일(세로) / 데스크톱(가로) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* 왼쪽 영역: 상품 이미지만 */}
        <div>
          <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <Image
              src={`https://placehold.co/800x600?text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* 우측 고정 영역: 상품 정보 + 장바구니 UI */}
        <div className="lg:sticky lg:top-24 h-fit space-y-8">
          {/* 상품 정보 섹션 */}
          <div className="space-y-8">
            {/* 상단 섹션: 이름, 가격, 재고 */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl lg:text-4xl font-bold text-primary">
                    {product.price.toLocaleString()}원
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  재고: <strong className={isOutOfStock ? 'text-red-500' : 'text-gray-900 dark:text-gray-100'}>
                    {product.stock_quantity}개
                  </strong>
                </span>
                {isOutOfStock && (
                  <span className="px-3 py-1 text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                    품절
                  </span>
                )}
              </div>
            </div>

            {/* 중단 섹션: 설명, 카테고리 */}
            <div className="space-y-4">
              {product.description && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">상품 설명</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold mb-2">카테고리</h2>
                <span className="inline-block px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                  {categoryLabel}
                </span>
              </div>
            </div>

            {/* 하단 섹션: 등록일, 수정일 */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>등록일: {formattedCreatedAt}</span>
                <span className="hidden sm:inline">•</span>
                <span>수정일: {formattedUpdatedAt}</span>
              </div>
            </div>
          </div>

          {/* 장바구니 UI */}
          <ProductDetailCart product={product} />
        </div>
      </div>
    </main>
  );
}

