import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCartItems, getCartSummary } from '@/lib/supabase/queries/cart';
import { OrderForm } from '@/components/order-form';
import { OrderSummary } from '@/components/order-summary';

/**
 * @file app/order/page.tsx
 * @description 주문 페이지
 *
 * 이 페이지는 사용자가 주문 정보를 입력하고 확인하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 로그인 상태 확인 및 비로그인 사용자 리다이렉트
 * 2. 장바구니 아이템 조회
 * 3. 장바구니 요약 정보 조회
 * 4. 빈 장바구니 처리 (리다이렉트)
 * 5. 주문 폼 및 주문 요약 표시
 *
 * 핵심 구현 로직:
 * - Server Component로 구현하여 서버 사이드 데이터 페칭
 * - Clerk 인증 확인 (auth())
 * - getCartItems, getCartSummary로 데이터 조회
 * - 빈 장바구니일 때 /cart로 리다이렉트
 *
 * @dependencies
 * - @clerk/nextjs/server: 인증 확인 (auth)
 * - next/navigation: 리다이렉트 (redirect)
 * - @/lib/supabase/queries/cart: 장바구니 조회 함수
 * - @/components/order-form: 주문 폼 컴포넌트
 * - @/components/order-summary: 주문 요약 컴포넌트
 */

export default async function OrderPage() {
  // 1. Clerk 인증 확인
  const { userId } = await auth();

  // 2. 비로그인 사용자 리다이렉트
  if (!userId) {
    redirect('/sign-in');
  }

  // 3. 장바구니 아이템 및 요약 정보 조회
  let cartItems;
  let cartSummary;
  try {
    [cartItems, cartSummary] = await Promise.all([
      getCartItems(userId),
      getCartSummary(userId),
    ]);
  } catch (error) {
    console.error('장바구니 조회 오류:', error);
    redirect('/cart');
  }

  // 4. 빈 장바구니 처리
  if (cartItems.length === 0) {
    redirect('/cart');
  }

  // 5. 주문 페이지 렌더링
  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">주문하기</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 왼쪽 영역: 주문 폼 */}
        <div>
          <OrderForm expectedTotalAmount={cartSummary.grandTotal} cartItems={cartItems} />
        </div>

        {/* 오른쪽 영역: 주문 요약 */}
        <div className="lg:sticky lg:top-24 h-fit">
          <OrderSummary cartItems={cartItems} summary={cartSummary} />
        </div>
      </div>
    </main>
  );
}
