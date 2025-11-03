'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addToCartAction,
  updateCartItemAction,
  removeCartItemAction,
  clearCartAction,
} from '@/actions/cart';
import type { CartItem } from '@/types/cart';

/**
 * @file hooks/use-cart-mutations.ts
 * @description 장바구니 변경 작업 훅
 *
 * React Query의 useMutation을 사용하여 장바구니 변경 작업을 래핑합니다.
 * 성공 시 자동으로 쿼리 무효화하여 실시간 업데이트를 보장합니다.
 *
 * 주요 기능:
 * 1. 장바구니 추가/수정/삭제/비우기 작업
 * 2. 성공 시 자동 쿼리 무효화 (['cart'] 키)
 * 3. 에러 처리 및 로딩 상태 관리
 *
 * 쿼리 무효화:
 * - 모든 장바구니 관련 쿼리가 자동으로 리프레시됨
 * - GNB 배지가 실시간으로 업데이트됨
 *
 * @example
 * ```tsx
 * const { mutate: addToCart, isPending } = useAddToCart();
 * addToCart({ productId: '123', quantity: 1 });
 * ```
 *
 * @dependencies
 * - @tanstack/react-query: useMutation, useQueryClient
 * - @/actions/cart: 장바구니 Server Actions
 * - @/types/cart: CartItem 타입
 */

/**
 * 장바구니에 상품 추가
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
    }) => {
      const result = await addToCartAction(productId, quantity);
      if (result.success && 'data' in result) {
        return result.data;
      }
      const errorMessage = 'error' in result ? result.error : '장바구니 추가 실패';
      throw new Error(errorMessage);
    },
    onSuccess: () => {
      // 장바구니 관련 모든 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/**
 * 장바구니 아이템 수량 변경
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartItemId,
      quantity,
    }: {
      cartItemId: string;
      quantity: number;
    }) => {
      const result = await updateCartItemAction(cartItemId, quantity);
      if (result.success && 'data' in result) {
        return result.data;
      }
      const errorMessage = 'error' in result ? result.error : '수량 변경 실패';
      throw new Error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/**
 * 장바구니 아이템 삭제
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cartItemId }: { cartItemId: string }) => {
      const result = await removeCartItemAction(cartItemId);
      if (result.success) {
        return;
      }
      const errorMessage = 'error' in result ? result.error : '장바구니 아이템 삭제 실패';
      throw new Error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

/**
 * 장바구니 전체 비우기
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await clearCartAction();
      if (result.success) {
        return;
      }
      const errorMessage = 'error' in result ? result.error : '장바구니 비우기 실패';
      throw new Error(errorMessage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}
