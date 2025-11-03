import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

/**
 * @file app/payment/success/page.tsx
 * @description 결제 성공 페이지
 *
 * 이 페이지는 토스페이먼츠 결제 성공 후 리다이렉트되는 페이지입니다.
 *
 * 주요 기능:
 * 1. 결제 성공 메시지 표시
 * 2. 쿼리 파라미터로 전달된 결제 정보 확인
 * 3. 주문 상태 업데이트 (추후 구현)
 * 4. 주문 내역 확인 버튼
 *
 * @dependencies
 * - next/link: Link 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - lucide-react: CheckCircle2 아이콘
 */

interface PaymentSuccessProps {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function PaymentSuccessContent({ searchParams: _searchParams }: PaymentSuccessProps) {
  // TODO: 여기에 결제 승인 및 주문 상태 업데이트 로직 구현
  // 1. paymentKey, orderId, amount 추출
  // 2. 서버에서 결제 승인 API 호출
  // 3. 주문 상태를 'confirmed'로 업데이트
  // 4. 성공/실패 메시지 표시

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <CheckCircle2 className="w-24 h-24 mx-auto text-green-500" />
        </div>

        <h1 className="text-3xl font-bold mb-4">결제가 완료되었습니다</h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          주문이 성공적으로 완료되었습니다.
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/orders">주문 내역 보기</Link>
          </Button>

          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/">홈으로 가기</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default async function PaymentSuccessPage(props: PaymentSuccessProps) {
  return (
    <Suspense fallback={
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">결제 확인 중...</p>
        </div>
      </main>
    }>
      <PaymentSuccessContent {...props} />
    </Suspense>
  );
}

