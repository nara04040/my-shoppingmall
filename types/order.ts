/**
 * @file types/order.ts
 * @description 주문 관련 타입 정의
 *
 * 이 파일은 주문 기능에서 사용되는 모든 타입을 정의합니다.
 *
 * 주요 타입:
 * - ShippingAddress: 배송지 정보 타입
 * - OrderFormData: 주문 폼 데이터 타입
 * - Order: 데이터베이스 orders 테이블의 기본 타입
 * - OrderItem: 데이터베이스 order_items 테이블의 기본 타입
 */

/**
 * 배송지 정보 타입
 *
 * orders 테이블의 shipping_address JSONB 필드에 저장됩니다.
 */
export interface ShippingAddress {
  /** 받는 사람 이름 */
  recipientName: string;
  /** 연락처 (전화번호) */
  phone: string;
  /** 배송지 주소 */
  address: string;
}

/**
 * 주문 폼 데이터 타입
 *
 * 주문 페이지에서 사용자로부터 입력받는 데이터입니다.
 */
export interface OrderFormData {
  /** 배송지 정보 (필수) */
  shippingAddress: ShippingAddress;
  /** 주문 메모 (선택사항) */
  orderNote?: string;
}

/**
 * 주문 타입 (orders 테이블)
 */
export interface Order {
  id: string;
  clerk_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: ShippingAddress | null;
  order_note: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 주문 아이템 타입 (order_items 테이블)
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

