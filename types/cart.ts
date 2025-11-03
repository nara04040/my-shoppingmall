import type { Product } from './product';

/**
 * @file types/cart.ts
 * @description 장바구니 관련 타입 정의
 *
 * 이 파일은 장바구니 기능에서 사용되는 모든 타입을 정의합니다.
 *
 * 주요 타입:
 * - CartItem: 데이터베이스 cart_items 테이블의 기본 타입
 * - CartItemWithProduct: 상품 정보와 JOIN된 장바구니 아이템 타입
 * - CartSummary: 장바구니 요약 정보 타입
 */

/**
 * 장바구니 아이템 타입 (cart_items 테이블)
 */
export interface CartItem {
  id: string;
  clerk_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

/**
 * 상품 정보와 JOIN된 장바구니 아이템 타입
 *
 * cart_items와 products 테이블을 JOIN한 결과로 사용됩니다.
 * 상품의 현재 가격, 재고, 활성화 상태 등을 함께 조회할 때 사용합니다.
 */
export interface CartItemWithProduct extends CartItem {
  product: Product;
}

/**
 * 장바구니 요약 정보 타입
 *
 * 장바구니의 총 아이템 수, 총 금액 등을 계산한 요약 정보입니다.
 * 장바구니 페이지의 하단 요약 컴포넌트에서 사용됩니다.
 */
export interface CartSummary {
  /** 총 아이템 개수 (장바구니에 담긴 상품의 총 수량) */
  totalItems: number;
  /** 총 상품 금액 (상품 가격 × 수량의 합계, 배송비 제외) */
  totalAmount: number;
  /** 배송비 (현재는 0원, 추후 확장 가능) */
  shippingFee: number;
  /** 총 주문 금액 (총 상품 금액 + 배송비) */
  grandTotal: number;
}
