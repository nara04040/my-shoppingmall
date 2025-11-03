/**
 * @file app/products/[id]/loading.tsx
 * @description 상품 상세 페이지 로딩 스켈레톤 UI
 *
 * Next.js App Router의 Suspense 경계로 인해 자동으로 표시되는 로딩 상태입니다.
 * 실제 페이지 구조와 동일한 레이아웃을 유지하여 자연스러운 로딩 경험을 제공합니다.
 *
 * 주요 구성:
 * 1. 왼쪽 영역: 이미지, 이름/가격/재고, 설명/카테고리, 날짜 정보 스켈레톤
 * 2. 오른쪽 영역: 장바구니 UI 스켈레톤 (가격, 재고, 수량 선택, 버튼)
 */

export default function ProductDetailLoading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      {/* 레이아웃: 모바일(세로) / 데스크톱(가로) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* 왼쪽 영역: 이미지 + 정보 섹션 */}
        <div className="space-y-8">
          {/* 상품 이미지 스켈레톤 */}
          <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />

          {/* 상단 섹션: 이름, 가격, 재고 스켈레톤 */}
          <div className="space-y-4">
            <div className="space-y-3">
              {/* 이름 스켈레톤 */}
              <div className="h-10 lg:h-12 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              {/* 가격 스켈레톤 */}
              <div className="h-8 lg:h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            {/* 재고 스켈레톤 */}
            <div className="flex items-center gap-4">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
          </div>

          {/* 중단 섹션: 설명, 카테고리 스켈레톤 */}
          <div className="space-y-4">
            {/* 설명 섹션 스켈레톤 */}
            <div className="space-y-2">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
            {/* 카테고리 섹션 스켈레톤 */}
            <div className="space-y-2">
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            </div>
          </div>

          {/* 하단 섹션: 날짜 정보 스켈레톤 */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* 우측 고정 영역: 장바구니 UI 스켈레톤 */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900 shadow-sm">
            <div className="space-y-6">
              {/* 가격 정보 스켈레톤 */}
              <div className="space-y-2">
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>

              {/* 재고 정보 스켈레톤 */}
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>

              {/* 수량 선택 스켈레톤 */}
              <div className="space-y-2">
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>

              {/* 총 금액 스켈레톤 */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>

              {/* 장바구니 담기 버튼 스켈레톤 */}
              <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

