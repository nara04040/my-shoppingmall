'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { getCartItemCountAction } from '@/actions/cart';

/**
 * @file hooks/use-cart-count.ts
 * @description 장바구니 아이템 수 조회 훅
 *
 * React Query를 사용하여 장바구니 아이템 수를 조회하고 캐싱합니다.
 * GNB 배지 업데이트에 사용됩니다.
 *
 * 주요 기능:
 * 1. 로그인 상태에 따른 자동 조회/비활성화
 * 2. 쿼리 캐싱 및 자동 리프레시
 * 3. 에러 처리 및 로딩 상태 관리
 *
 * 쿼리 키: ['cart', 'count', userId]
 * - userId가 변경되면 자동으로 새로운 쿼리 생성
 *
 * @example
 * ```tsx
 * const { data: cartCount, isLoading } = useCartCount();
 * ```
 *
 * @dependencies
 * - @tanstack/react-query: useQuery 훅
 * - @clerk/nextjs: useAuth 훅
 * - @/actions/cart: getCartItemCountAction
 */

export function useCartCount() {
  const { isLoaded, userId } = useAuth();

  const { data: cartCount = 0, isLoading, error } = useQuery({
    queryKey: ['cart', 'count', userId],
    queryFn: async () => {
      const result = await getCartItemCountAction();
      if (result.success && 'data' in result) {
        return result.data;
      }
      const errorMessage = 'error' in result ? result.error : '장바구니 개수 조회 실패';
      throw new Error(errorMessage);
    },
    enabled: isLoaded && !!userId, // 로그인 상태일 때만 조회
    staleTime: 30 * 1000, // 30초 동안 fresh 상태 유지
  });

  return {
    cartCount,
    isLoading,
    error,
  };
}
