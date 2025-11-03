'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, Package } from 'lucide-react';

/**
 * @file app/products/[id]/error.tsx
 * @description 상품 상세 페이지 에러 처리
 *
 * Next.js Error Boundary를 활용하여 상품 상세 조회 중 발생하는 에러를 처리합니다.
 *
 * 주요 기능:
 * 1. 사용자 친화적인 에러 메시지 표시
 * 2. 에러 상세 정보 표시 (개발 환경에서만)
 * 3. "다시 시도" 버튼 제공 (reset 함수 사용)
 * 4. "상품 목록으로" 버튼 제공
 * 5. "홈으로 돌아가기" 버튼 제공
 *
 * @dependencies
 * - @/components/ui/button: Button 컴포넌트
 * - lucide-react: 아이콘
 */

interface ProductDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductDetailError({ error, reset }: ProductDetailErrorProps) {
  const isDev = process.env.NODE_ENV === 'development';

  // 에러 타입별 사용자 친화적 메시지
  const getErrorMessage = () => {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return '네트워크 연결에 문제가 발생했습니다. 인터넷 연결을 확인해주세요.';
    }

    if (errorMessage.includes('database') || errorMessage.includes('supabase')) {
      return '데이터베이스 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }

    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      return '접근 권한이 없습니다. 로그인 후 다시 시도해주세요.';
    }

    return '상품 정보를 불러오는 중 문제가 발생했습니다.';
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {/* 아이콘 */}
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />

        {/* 에러 제목 */}
        <h2 className="text-2xl font-bold mb-2">문제가 발생했습니다</h2>

        {/* 사용자 친화적 에러 메시지 */}
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">{getErrorMessage()}</p>

        {/* 개발 환경에서만 상세 에러 정보 표시 */}
        {isDev && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left max-w-2xl w-full">
            <p className="text-sm font-mono text-red-800 dark:text-red-200 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={reset} variant="default">
            다시 시도
          </Button>
          <Button asChild variant="outline">
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

