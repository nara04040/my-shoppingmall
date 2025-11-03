'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Product } from '@/types/product';

/**
 * @file product-detail-cart.tsx
 * @description 상품 상세 페이지 장바구니 UI 컴포넌트
 *
 * 이 컴포넌트는 상품 상세 페이지의 우측에 고정되는 장바구니 UI를 제공합니다.
 *
 * 주요 기능:
 * 1. 수량 선택 (Input number)
 * 2. 장바구니 담기 버튼
 * 3. 재고 상태 표시 및 품절 처리
 *
 * 핵심 구현 로직:
 * - useState로 수량 상태 관리
 * - 수량 범위 검증 (1 ~ 재고 수량)
 * - 재고가 0인 경우 버튼 비활성화
 * - 장바구니 담기 기능은 Phase 3에서 구현 예정 (현재는 placeholder)
 *
 * @dependencies
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/input: Input 컴포넌트
 * - @/types/product: Product 타입
 */

interface ProductDetailCartProps {
  product: Product;
}

export function ProductDetailCart({ product }: ProductDetailCartProps) {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock_quantity === 0;
  const maxQuantity = product.stock_quantity;

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
    // Phase 3에서 구현 예정
    console.log('장바구니 담기:', { productId: product.id, quantity });
    alert(`장바구니 기능은 Phase 3에서 구현될 예정입니다.\n상품: ${product.name}\n수량: ${quantity}`);
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
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={quantity >= maxQuantity}
                className="h-9 w-9"
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
          disabled={isOutOfStock}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          {isOutOfStock ? '품절' : '장바구니 담기'}
        </Button>
      </div>
    </div>
  );
}

