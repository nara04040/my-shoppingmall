/**
 * @file app/products/loading.tsx
 * @description 상품 목록 페이지 로딩 스켈레톤 UI
 *
 * Next.js App Router의 Suspense 경계로 인해 자동으로 표시되는 로딩 상태입니다.
 * 실제 페이지 구조와 동일한 레이아웃을 유지하여 자연스러운 로딩 경험을 제공합니다.
 *
 * 주요 구성:
 * 1. 헤더 영역 스켈레톤 (제목, 설명)
 * 2. 정렬 버튼 그룹 스켈레톤
 * 3. 카테고리 필터 스켈레톤
 * 4. 상품 카드 그리드 스켈레톤
 */

export default function ProductsLoading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      {/* 헤더 영역 스켈레톤 */}
      <div className="mb-8">
        <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
        <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* 정렬 버튼 그룹 스켈레톤 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
          />
        ))}
      </div>

      {/* 카테고리 필터 스켈레톤 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
          />
        ))}
      </div>

      {/* 상품 카드 그리드 스켈레톤 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-4">
            {/* 이미지 영역 */}
            <div className="aspect-4/3 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            {/* 정보 영역 */}
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

