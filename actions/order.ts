'use server';

import { auth } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase/server';
import { getCartItems, getCartSummary, clearCart } from '@/lib/supabase/queries/cart';
import type { OrderFormData } from '@/types/order';
import type { ShippingAddress } from '@/types/order';

/**
 * @file actions/order.ts
 * @description 주문 관련 Server Actions
 *
 * 이 파일은 클라이언트에서 호출할 수 있는 주문 관련 Server Actions를 제공합니다.
 *
 * 주요 기능:
 * 1. 주문 생성 (orders, order_items 테이블 저장)
 * 2. 총 주문 금액 계산 및 검증
 * 3. 주문 생성 후 장바구니 비우기
 * 4. 트랜잭션 처리 (순차 처리, 실패 시 에러 throw)
 *
 * 핵심 구현 로직:
 * - Server Actions로 구현 ('use server' 디렉티브 사용)
 * - Clerk 인증 확인 (auth()로 userId 추출)
 * - 장바구니 아이템 조회 및 합계 계산
 * - 합계 검증 (계산된 총액과 클라이언트에서 전달받은 총액 비교)
 * - orders 테이블에 주문 정보 저장
 * - order_items 테이블에 주문 아이템 저장 (여러 개)
 * - 장바구니 비우기
 * - 중간에 실패 시 에러 throw
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증 (auth)
 * - @/lib/supabase/server: 서버 사이드 Supabase 클라이언트
 * - @/lib/supabase/queries/cart: 장바구니 조회 함수들
 * - @/types/order: 주문 관련 타입
 */

/**
 * Server Action 응답 타입
 */
type ActionResult<T = void> = T extends void
  ? { success: true } | { success: false; error: string }
  : { success: true; data: T } | { success: false; error: string };

/**
 * 주문 생성 인터페이스
 *
 * OrderFormData를 확장하되, shippingAddress를 명확히 필수로 정의
 */
interface CreateOrderData {
  /** 배송지 정보 (필수) */
  shippingAddress: ShippingAddress;
  /** 주문 메모 (선택사항) */
  orderNote?: string;
  /** 클라이언트에서 계산한 총 주문 금액 (검증용) */
  expectedTotalAmount: number;
}

/**
 * 주문 생성
 *
 * 주문 생성 프로세스:
 * 1. Clerk 인증 확인
 * 2. 장바구니 아이템 조회
 * 3. 총 주문 금액 계산
 * 4. 합계 검증 (계산된 총액과 클라이언트 총액 비교)
 * 5. orders 테이블에 주문 정보 저장
 * 6. order_items 테이블에 주문 아이템 저장 (여러 개)
 * 7. 장바구니 비우기
 *
 * @param orderData - 주문 폼 데이터 및 예상 총액
 * @returns 성공 시 생성된 주문 ID, 실패 시 에러 메시지
 */
export async function createOrderAction(
  orderData: CreateOrderData
): Promise<ActionResult<{ orderId: string }>> {
  try {
    console.group('[createOrderAction] 주문 생성 시작');
    
    // 1. Clerk 인증 확인
    const { userId } = await auth();
    console.log('[createOrderAction] Clerk 인증 확인:', userId ? '성공' : '실패');

    if (!userId) {
      console.error('[createOrderAction] 로그인 필요');
      console.groupEnd();
      return {
        success: false,
        error: '로그인이 필요합니다.',
      };
    }

    // 2. 입력값 검증
    if (!orderData.shippingAddress) {
      console.error('[createOrderAction] 배송지 정보 누락');
      console.groupEnd();
      return {
        success: false,
        error: '배송지 정보를 입력해주세요.',
      };
    }

    if (
      typeof orderData.expectedTotalAmount !== 'number' ||
      orderData.expectedTotalAmount <= 0
    ) {
      console.error('[createOrderAction] 예상 총액이 유효하지 않음:', orderData.expectedTotalAmount);
      console.groupEnd();
      return {
        success: false,
        error: '주문 금액 정보가 유효하지 않습니다.',
      };
    }

    // 3. 장바구니 아이템 조회
    console.log('[createOrderAction] 장바구니 아이템 조회 중...');
    const cartItems = await getCartItems(userId);
    console.log('[createOrderAction] 장바구니 아이템 수:', cartItems.length);

    if (cartItems.length === 0) {
      console.error('[createOrderAction] 장바구니가 비어있음');
      console.groupEnd();
      return {
        success: false,
        error: '장바구니가 비어있습니다.',
      };
    }

    // 4. 장바구니 요약 정보 조회 (총액 계산)
    console.log('[createOrderAction] 장바구니 요약 정보 계산 중...');
    const cartSummary = await getCartSummary(userId);
    console.log('[createOrderAction] 계산된 총액:', cartSummary.grandTotal);
    console.log('[createOrderAction] 예상 총액:', orderData.expectedTotalAmount);

    // 5. 합계 검증 (계산된 총액과 클라이언트에서 전달받은 총액 비교)
    // 소수점 오차를 고려하여 0.01원 이내 차이는 허용
    const amountDifference = Math.abs(
      cartSummary.grandTotal - orderData.expectedTotalAmount
    );
    
    if (amountDifference > 0.01) {
      console.error(
        '[createOrderAction] 합계 불일치:',
        `계산된 총액(${cartSummary.grandTotal})과 예상 총액(${orderData.expectedTotalAmount})이 일치하지 않습니다.`
      );
      console.groupEnd();
      return {
        success: false,
        error: '주문 금액이 변경되었습니다. 페이지를 새로고침 후 다시 시도해주세요.',
      };
    }

    // 6. 주문 정보 준비
    const supabase = createClerkSupabaseClient();
    
    // 배송지 정보를 JSONB로 변환
    const shippingAddressJson: ShippingAddress = {
      recipientName: orderData.shippingAddress.recipientName,
      phone: orderData.shippingAddress.phone,
      address: orderData.shippingAddress.address,
    };

    console.log('[createOrderAction] 주문 정보 저장 중...');

    // 7. orders 테이블에 주문 정보 저장
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        clerk_id: userId,
        total_amount: cartSummary.grandTotal,
        status: 'pending',
        shipping_address: shippingAddressJson,
        order_note: orderData.orderNote || null,
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('[createOrderAction] 주문 저장 실패:', orderError);
      console.groupEnd();
      return {
        success: false,
        error: '주문 저장 중 오류가 발생했습니다.',
      };
    }

    if (!order) {
      console.error('[createOrderAction] 주문 데이터 없음');
      console.groupEnd();
      return {
        success: false,
        error: '주문 저장 중 오류가 발생했습니다.',
      };
    }

    const orderId = order.id;
    console.log('[createOrderAction] 주문 저장 완료, 주문 ID:', orderId);

    // 8. order_items 테이블에 주문 아이템 저장
    console.log('[createOrderAction] 주문 아이템 저장 중...');
    const orderItemsData = cartItems.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (orderItemsError) {
      console.error('[createOrderAction] 주문 아이템 저장 실패:', orderItemsError);
      // 주문 아이템 저장 실패 시, orders 테이블의 해당 주문은 삭제할 수 없지만
      // 최소한 에러를 throw하여 문제를 알림
      console.groupEnd();
      return {
        success: false,
        error: '주문 아이템 저장 중 오류가 발생했습니다.',
      };
    }

    console.log('[createOrderAction] 주문 아이템 저장 완료, 아이템 수:', orderItemsData.length);

    // 9. 장바구니 비우기
    console.log('[createOrderAction] 장바구니 비우기 중...');
    await clearCart(userId);
    console.log('[createOrderAction] 장바구니 비우기 완료');

    console.log('[createOrderAction] 주문 생성 완료!');
    console.groupEnd();

    return {
      success: true,
      data: { orderId },
    };
  } catch (error) {
    console.error('[createOrderAction] 예상치 못한 오류:', error);
    console.groupEnd();

    // 에러 메시지 추출
    const errorMessage =
      error instanceof Error
        ? error.message
        : '주문 생성 중 오류가 발생했습니다.';

    return {
      success: false,
      error: errorMessage,
    };
  }
}

