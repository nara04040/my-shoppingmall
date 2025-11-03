'use server';

import { auth } from '@clerk/nextjs/server';
import {
  addToCart as addToCartQuery,
  updateCartItemQuantity as updateCartItemQuantityQuery,
  removeCartItem as removeCartItemQuery,
  clearCart as clearCartQuery,
  getCartItemCount as getCartItemCountQuery,
} from '@/lib/supabase/queries/cart';
import type { CartItem } from '@/types/cart';

/**
 * @file actions/cart.ts
 * @description 장바구니 관련 Server Actions
 *
 * 이 파일은 클라이언트에서 호출할 수 있는 장바구니 관련 Server Actions를 제공합니다.
 *
 * 주요 기능:
 * 1. 장바구니 추가 (Clerk 세션 확인 포함)
 * 2. 수량 변경
 * 3. 장바구니 아이템 삭제
 * 4. 장바구니 전체 비우기
 *
 * 핵심 구현 로직:
 * - Server Actions로 구현 ('use server' 디렉티브 사용)
 * - Clerk 인증 확인 (auth()로 userId 추출)
 * - 비로그인 사용자 접근 시 에러 반환
 * - 쿼리 함수 호출 및 에러 처리
 * - 일관된 반환 형식 (success/error)
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증 (auth)
 * - @/lib/supabase/queries/cart: 장바구니 쿼리 함수들
 * - @/types/cart: 장바구니 관련 타입
 */

/**
 * Server Action 응답 타입
 *
 * T가 void인 경우 data 속성을 생략할 수 있습니다.
 */
type ActionResult<T = void> = T extends void
  ? { success: true } | { success: false; error: string }
  : { success: true; data: T } | { success: false; error: string };

/**
 * 장바구니에 상품 추가
 *
 * @param productId - 추가할 상품 ID
 * @param quantity - 추가할 수량 (기본값: 1)
 * @returns 성공 시 장바구니 아이템, 실패 시 에러 메시지
 */
export async function addToCartAction(
  productId: string,
  quantity: number = 1
): Promise<ActionResult<CartItem>> {
  try {
    // 1. Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      };
    }

    // 2. 입력값 검증
    if (!productId || productId.trim() === '') {
      return {
        success: false,
        error: '상품 ID가 필요합니다.',
      };
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return {
        success: false,
        error: '수량은 1 이상의 정수여야 합니다.',
      };
    }

    // 3. 장바구니에 추가
    const cartItem = await addToCartQuery(userId, productId, quantity);

    return {
      success: true,
      data: cartItem,
    };
  } catch (error) {
    console.error('장바구니 추가 오류:', error);

    // 에러 메시지 추출
    const errorMessage =
      error instanceof Error ? error.message : '장바구니 추가 중 오류가 발생했습니다.';

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 장바구니 아이템 수량 변경
 *
 * @param cartItemId - 변경할 장바구니 아이템 ID
 * @param quantity - 새로운 수량
 * @returns 성공 시 업데이트된 장바구니 아이템, 실패 시 에러 메시지
 */
export async function updateCartItemAction(
  cartItemId: string,
  quantity: number
): Promise<ActionResult<CartItem>> {
  try {
    // 1. Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      };
    }

    // 2. 입력값 검증
    if (!cartItemId || cartItemId.trim() === '') {
      return {
        success: false,
        error: '장바구니 아이템 ID가 필요합니다.',
      };
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return {
        success: false,
        error: '수량은 1 이상의 정수여야 합니다.',
      };
    }

    // 3. 수량 변경
    const cartItem = await updateCartItemQuantityQuery(cartItemId, quantity);

    return {
      success: true,
      data: cartItem,
    };
  } catch (error) {
    console.error('장바구니 수량 변경 오류:', error);

    // 에러 메시지 추출
    const errorMessage =
      error instanceof Error ? error.message : '수량 변경 중 오류가 발생했습니다.';

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 장바구니에서 아이템 삭제
 *
 * @param cartItemId - 삭제할 장바구니 아이템 ID
 * @returns 성공 시 void, 실패 시 에러 메시지
 */
export async function removeCartItemAction(
  cartItemId: string
): Promise<ActionResult> {
  try {
    // 1. Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      };
    }

    // 2. 입력값 검증
    if (!cartItemId || cartItemId.trim() === '') {
      return {
        success: false,
        error: '장바구니 아이템 ID가 필요합니다.',
      };
    }

    // 3. 장바구니 아이템 삭제
    await removeCartItemQuery(cartItemId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('장바구니 아이템 삭제 오류:', error);

    // 에러 메시지 추출
    const errorMessage =
      error instanceof Error ? error.message : '장바구니 아이템 삭제 중 오류가 발생했습니다.';

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 장바구니 전체 비우기
 *
 * @returns 성공 시 void, 실패 시 에러 메시지
 */
export async function clearCartAction(): Promise<ActionResult> {
  try {
    // 1. Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      };
    }

    // 2. 장바구니 전체 비우기
    await clearCartQuery(userId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('장바구니 비우기 오류:', error);

    // 에러 메시지 추출
    const errorMessage =
      error instanceof Error ? error.message : '장바구니 비우기 중 오류가 발생했습니다.';

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 장바구니 아이템 총 개수 조회
 *
 * GNB 배지 표시용으로 사용됩니다.
 *
 * @returns 성공 시 장바구니 아이템 총 개수, 실패 시 에러 메시지
 */
export async function getCartItemCountAction(): Promise<ActionResult<number>> {
  try {
    // 1. Clerk 인증 확인
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: '로그인이 필요합니다.',
      };
    }

    // 2. 장바구니 아이템 개수 조회
    const count = await getCartItemCountQuery(userId);

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error('장바구니 개수 조회 오류:', error);

    // 에러 메시지 추출
    const errorMessage =
      error instanceof Error ? error.message : '장바구니 개수 조회 중 오류가 발생했습니다.';

    return {
      success: false,
      error: errorMessage,
    };
  }
}
