/**
 * @file app/cart/loading.tsx
 * @description 장바구니 페이지 로딩 스켈레톤 UI
 *
 * Next.js App Router의 Suspense 경계로 인해 자동으로 표시되는 로딩 상태입니다.
 * 실제 페이지 구조와 동일한 레이아웃을 유지하여 자연스러운 로딩 경험을 제공합니다.
 *
 * 주요 구성:
 * 1. 제목 영역 스켈레톤
 * 2. 장바구니 아이템 카드 스켈레톤
 */

export default function CartLoading() {
  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      {/* 제목 영역 스켈레톤 */}
      <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse" />

      {/* 장바구니 아이템 카드 스켈레톤 */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
