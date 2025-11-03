'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { CartSummary } from '@/types/cart';

/**
 * @file components/cart-summary.tsx
 * @description 장바구니 요약 컴포넌트
 *
 * 이 컴포넌트는 장바구니 페이지 하단에 표시되는 요약 정보를 제공합니다.
 *
 * 주요 기능:
 * 1. 총 상품 금액 표시
 * 2. 배송비 표시 (현재는 무료)
 * 3. 총 주문 금액 표시 (강조)
 * 4. 주문하기 버튼
 *
 * 핵심 구현 로직:
 * - Client Component로 구현 (주문하기 버튼 클릭 시 라우팅)
 * - CartSummary 타입을 props로 받아서 표시
 * - 주문하기 기능은 Phase 3.2에서 구현 예정 (현재는 placeholder)
 *
 * @dependencies
 * - @/components/ui/button: Button 컴포넌트
 * - @/types/cart: CartSummary 타입
 * - next/navigation: useRouter
 */

interface CartSummaryProps {
  /** 장바구니 요약 정보 */
  summary: CartSummary;
}

export function CartSummary({ summary }: CartSummaryProps) {
  const router = useRouter();

  const handleOrder = () => {
    // 주문 페이지로 이동
    router.push('/order');
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
      <h2 className="text-xl font-bold mb-6">주문 요약</h2>

      <div className="space-y-4">
        {/* 총 상품 금액 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">
            상품 금액
            {summary.totalItems > 0 && (
              <span className="text-sm ml-2 text-gray-500 dark:text-gray-500">
                ({summary.totalItems}개)
              </span>
            )}
          </span>
          <span className="font-medium">
            {summary.totalAmount.toLocaleString()}원
          </span>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* 배송비 */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">배송비</span>
          <span className="font-medium">
            {summary.shippingFee === 0 ? (
              <span className="text-green-600 dark:text-green-400">무료</span>
            ) : (
              `${summary.shippingFee.toLocaleString()}원`
            )}
          </span>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200 dark:border-gray-700" />

        {/* 총 주문 금액 */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-semibold">총 주문 금액</span>
          <span className="text-2xl font-bold text-primary">
            {summary.grandTotal.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 주문하기 버튼 */}
      <Button
        onClick={handleOrder}
        className="w-full mt-6 h-12 text-base font-medium"
        size="lg"
      >
        주문하기
      </Button>
    </div>
  );
}
