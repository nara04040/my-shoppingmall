import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package, Home } from 'lucide-react';

/**
 * @file app/products/[id]/not-found.tsx
 * @description 상품 상세 페이지 404 처리
 *
 * Next.js App Router의 not-found.tsx를 활용하여 상품이 없거나 비활성화된 경우를 처리합니다.
 *
 * 주요 기능:
 * 1. 사용자 친화적인 404 메시지 표시
 * 2. "상품 목록으로" 버튼 제공
 * 3. "홈으로 돌아가기" 버튼 제공
 *
 * @dependencies
 * - @/components/ui/button: Button 컴포넌트
 * - lucide-react: 아이콘
 */

export default function ProductNotFound() {
  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* 아이콘 */}
        <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />

        {/* 404 제목 */}
        <h2 className="text-2xl font-bold mb-2">상품을 찾을 수 없습니다</h2>

        {/* 사용자 친화적 메시지 */}
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          요청하신 상품이 존재하지 않거나 현재 판매되지 않는 상품입니다.
          <br />
          다른 상품을 확인해보세요.
        </p>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="default">
            <Link href="/products">
              <Package className="size-4 mr-2" />
              상품 목록으로
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="size-4 mr-2" />
              홈으로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

