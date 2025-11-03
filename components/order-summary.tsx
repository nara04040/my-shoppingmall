import Image from 'next/image';
import Link from 'next/link';
import type { CartItemWithProduct } from '@/types/cart';
import type { CartSummary } from '@/types/cart';

/**
 * @file components/order-summary.tsx
 * @description 주문 요약 컴포넌트
 *
 * 이 컴포넌트는 주문 페이지에서 장바구니 아이템 목록과 총 금액을 표시합니다.
 *
 * 주요 기능:
 * 1. 장바구니 아이템 목록 표시 (이미지, 이름, 수량, 가격)
 * 2. 총 상품 금액, 배송비, 총 주문 금액 표시
 * 3. 주문 요약 정보 카드 형태로 표시
 *
 * 핵심 구현 로직:
 * - Server Component 또는 Client Component로 구현 가능
 * - 장바구니 아이템과 요약 정보를 props로 받아서 표시
 * - 반응형 레이아웃 (카드 형태)
 *
 * @dependencies
 * - next/image: Image 컴포넌트
 * - next/link: Link 컴포넌트
 * - @/types/cart: CartItemWithProduct, CartSummary 타입
 */

interface OrderSummaryProps {
  /** 장바구니 아이템 목록 */
  cartItems: CartItemWithProduct[];
  /** 장바구니 요약 정보 */
  summary: CartSummary;
}

export function OrderSummary({ cartItems, summary }: OrderSummaryProps) {
  return (
    <div className="space-y-6">
      {/* 장바구니 아이템 목록 */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
        <h2 className="text-xl font-bold mb-6">주문 상품</h2>

        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4">
              {/* 상품 이미지 */}
              <Link
                href={`/products/${item.product.id}`}
                className="flex-shrink-0"
              >
                <div className="relative w-20 h-20 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={`https://placehold.co/400x300?text=${encodeURIComponent(item.product.name)}`}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>

              {/* 상품 정보 */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.id}`}
                  className="block hover:text-primary transition-colors"
                >
                  <h3 className="font-semibold text-base mb-1 truncate">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  수량: {item.quantity}개
                </p>
                <p className="text-sm font-medium text-primary mt-1">
                  {(item.product.price * item.quantity).toLocaleString()}원
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주문 요약 (총액) */}
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
      </div>
    </div>
  );
}
