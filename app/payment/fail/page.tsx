import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

/**
 * @file app/payment/fail/page.tsx
 * @description 결제 실패 페이지
 *
 * 이 페이지는 토스페이먼츠 결제 실패 후 리다이렉트되는 페이지입니다.
 *
 * 주요 기능:
 * 1. 결제 실패 메시지 표시
 * 2. 쿼리 파라미터로 전달된 에러 정보 확인
 * 3. 재시도 버튼 제공
 *
 * @dependencies
 * - next/link: Link 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - lucide-react: XCircle 아이콘
 */

interface PaymentFailProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  }>;
}

function PaymentFailContent({ searchParams }: PaymentFailProps) {
  // TODO: 에러 정보를 표시하거나 로깅할 수 있음

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <XCircle className="w-24 h-24 mx-auto text-red-500" />
        </div>

        <h1 className="text-3xl font-bold mb-4">결제에 실패했습니다</h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          결제 처리 중 문제가 발생했습니다.
          <br />
          다시 시도해주세요.
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/cart">다시 시도</Link>
          </Button>

          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/">홈으로 가기</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default async function PaymentFailPage(props: PaymentFailProps) {
  return (
    <Suspense fallback={
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">결제 확인 중...</p>
        </div>
      </main>
    }>
      <PaymentFailContent {...props} />
    </Suspense>
  );
}

