import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCartItems, getCartSummary } from '@/lib/supabase/queries/cart';
import { EmptyState } from '@/components/empty-state';
import { ShoppingCart } from 'lucide-react';
import { CartSummary } from '@/components/cart-summary';
import { CartItem } from '@/components/cart-item';

/**
 * @file app/cart/page.tsx
 * @description 장바구니 페이지
 *
 * 이 페이지는 현재 사용자의 장바구니에 담긴 상품들을 표시합니다.
 *
 * 주요 기능:
 * 1. 로그인 상태 확인 및 비로그인 사용자 리다이렉트
 * 2. 장바구니 아이템 조회 (서버 사이드)
 * 3. 장바구니 요약 정보 조회 (총액 계산)
 * 4. 빈 상태 처리 (장바구니가 비어있을 때)
 * 5. 장바구니 아이템 목록 표시 (CartItem 컴포넌트 사용)
 * 6. 주문 요약 및 주문하기 버튼 표시 (CartSummary 컴포넌트 사용)
 *
 * 핵심 구현 로직:
 * - Server Component로 구현하여 서버 사이드 데이터 페칭
 * - Clerk 인증 확인 (auth())
 * - getCartItems로 장바구니 아이템 조회
 * - getCartSummary로 장바구니 요약 정보 조회
 * - 빈 상태일 때 EmptyState 컴포넌트 표시
 * - 그리드 레이아웃 (아이템 목록 왼쪽, 요약 오른쪽)
 *
 * @dependencies
 * - @clerk/nextjs/server: 인증 확인 (auth)
 * - next/navigation: 리다이렉트 (redirect)
 * - @/lib/supabase/queries/cart: 장바구니 조회 함수
 * - @/components/empty-state: 빈 상태 컴포넌트
 * - @/components/cart-item: 장바구니 아이템 컴포넌트
 * - @/components/cart-summary: 장바구니 요약 컴포넌트
 * - lucide-react: 아이콘
 */

export default async function CartPage() {
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
    cartItems = [];
    cartSummary = {
      totalItems: 0,
      totalAmount: 0,
      shippingFee: 0,
      grandTotal: 0,
    };
  }

  // 4. 빈 상태 처리
  if (cartItems.length === 0) {
    return (
      <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">장바구니</h1>
        <EmptyState
          icon={<ShoppingCart className="w-16 h-16" />}
          title="장바구니가 비어있습니다"
          description="원하는 상품을 장바구니에 담아보세요."
          action={{
            label: '쇼핑 계속하기',
            href: '/products',
          }}
        />
      </main>
    );
  }

  // 5. 장바구니 아이템 목록 및 요약 표시
  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">장바구니</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽 영역: 장바구니 아이템 목록 */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* 오른쪽 영역: 주문 요약 및 주문하기 버튼 */}
        <div className="lg:sticky lg:top-24 h-fit">
          <CartSummary summary={cartSummary} />
        </div>
      </div>
    </main>
  );
}
