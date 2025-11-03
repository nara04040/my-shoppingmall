'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAddToCart } from '@/hooks/use-cart-mutations';
import { showLoginRequired, showStockError, showError } from '@/lib/utils/toast';
import type { Product } from '@/types/product';

/**
 * @file product-detail-cart.tsx
 * @description 상품 상세 페이지 장바구니 UI 컴포넌트
 *
 * 이 컴포넌트는 상품 상세 페이지의 우측에 고정되는 장바구니 UI를 제공합니다.
 *
 * 주요 기능:
 * 1. 수량 선택 (Input number)
 * 2. 장바구니 담기 버튼 (실제 기능 구현)
 * 3. 재고 상태 표시 및 품절 처리
 * 4. 로그인 상태 확인
 * 5. 장바구니 담기 성공 시 Dialog 표시
 *
 * 핵심 구현 로직:
 * - useState로 수량, 로딩, Dialog 상태 관리
 * - 수량 범위 검증 (1 ~ 재고 수량)
 * - 재고가 0인 경우 버튼 비활성화
 * - 로그인 상태 확인 (useAuth)
 * - Server Action (addToCartAction) 호출하여 장바구니에 추가
 * - 성공 시 Dialog 표시, 실패 시 alert로 에러 메시지 표시
 *
 * @dependencies
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/input: Input 컴포넌트
 * - @/components/ui/dialog: Dialog 컴포넌트
 * - @/actions/cart: 장바구니 Server Actions
 * - @clerk/nextjs: 인증 상태 관리 (useAuth)
 * - next/navigation: 라우팅 (useRouter)
 * - @/types/product: Product 타입
 */

interface ProductDetailCartProps {
  product: Product;
}

export function ProductDetailCart({ product }: ProductDetailCartProps) {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const addToCartMutation = useAddToCart();
  const isOutOfStock = product.stock_quantity === 0;
  const maxQuantity = product.stock_quantity;
  const isLoading = addToCartMutation.isPending;

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue) || numValue < 1) {
      setQuantity(1);
      return;
    }

    if (numValue > maxQuantity) {
      setQuantity(maxQuantity);
      return;
    }

    setQuantity(numValue);
  };

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    // 1. 로그인 상태 확인
    if (!isLoaded) {
      return;
    }

    if (!userId) {
      showLoginRequired();
      return;
    }

    // 2. 클라이언트 측 재고 검증 (추가 확인)
    if (quantity > maxQuantity) {
      showStockError(maxQuantity, quantity);
      return;
    }

    // 3. Mutation 호출 (자동으로 쿼리 무효화 처리됨)
    addToCartMutation.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => {
          // 성공 처리: Dialog 열기 (기존 Dialog 유지)
          setIsDialogOpen(true);
        },
        onError: (error) => {
          // 실패 처리: 에러 메시지 표시
          showError('장바구니 추가 실패', error.message || '장바구니 추가 중 오류가 발생했습니다.');
        },
      }
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900 shadow-sm">
      <div className="space-y-6">
        {/* 가격 정보 */}
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">가격</div>
          <div className="text-2xl font-bold text-primary">
            {product.price.toLocaleString()}원
          </div>
        </div>

        {/* 재고 정보 */}
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">재고 현황</div>
          {isOutOfStock ? (
            <div className="text-red-500 font-medium">품절</div>
          ) : (
            <div className="text-gray-900 dark:text-gray-100 font-medium">
              {product.stock_quantity}개 남음
            </div>
          )}
        </div>

        {/* 수량 선택 */}
        {!isOutOfStock && (
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">수량</div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="h-9 w-9"
                aria-label="수량 감소"
              >
                −
              </Button>
              <Input
                type="number"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value === '' || parseInt(e.target.value, 10) < 1) {
                    setQuantity(1);
                  }
                }}
                className="w-20 text-center"
                aria-label="상품 수량"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={quantity >= maxQuantity}
                className="h-9 w-9"
                aria-label="수량 증가"
              >
                +
              </Button>
            </div>
          </div>
        )}

        {/* 총 금액 */}
        {!isOutOfStock && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">총 금액</span>
              <span className="text-xl font-bold text-primary">
                {(product.price * quantity).toLocaleString()}원
              </span>
            </div>
          </div>
        )}

        {/* 장바구니 담기 버튼 */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isLoading}
          className="w-full h-12 text-base font-medium"
          size="lg"
          aria-label={isOutOfStock ? '품절된 상품' : '장바구니에 담기'}
        >
          {isOutOfStock ? '품절' : isLoading ? '담는 중...' : '장바구니 담기'}
        </Button>
      </div>

      {/* 장바구니 담기 성공 Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>장바구니에 추가되었습니다</DialogTitle>
            <DialogDescription>
              <div className="mt-4 space-y-2">
                <div>
                  <span className="font-medium">상품명:</span> {product.name}
                </div>
                <div>
                  <span className="font-medium">수량:</span> {quantity}개
                </div>
                <div>
                  <span className="font-medium">총 금액:</span>{' '}
                  {(product.price * quantity).toLocaleString()}원
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              쇼핑 계속하기
            </Button>
            <Button
              onClick={() => {
                router.push('/cart');
                setIsDialogOpen(false);
              }}
            >
              장바구니로 이동
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

