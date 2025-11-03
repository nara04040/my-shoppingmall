'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useUpdateCartItem,
  useRemoveCartItem,
} from '@/hooks/use-cart-mutations';
import {
  showCartUpdateSuccess,
  showCartDeleteSuccess,
  showStockError,
  showError,
  showProductInactiveError,
} from '@/lib/utils/toast';
import type { CartItemWithProduct } from '@/types/cart';

/**
 * @file components/cart-item.tsx
 * @description 장바구니 아이템 컴포넌트
 *
 * 이 컴포넌트는 장바구니에 담긴 단일 아이템을 표시하고, 수량 조절 및 삭제 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 상품 정보 표시 (이미지, 이름, 가격)
 * 2. 수량 조절 UI (+/- 버튼, 숫자 입력)
 * 3. 아이템 삭제 버튼
 * 4. 아이템별 총액 계산 및 표시
 * 5. 재고 부족 경고 표시
 * 6. 수량 변경 시 로딩 상태 표시
 *
 * 핵심 구현 로직:
 * - Client Component로 구현 (Server Actions 호출)
 * - 로컬 상태로 수량 관리 (초기값은 item.quantity)
 * - 수량 변경 시 updateCartItemAction 호출
 * - 삭제 시 removeCartItemAction 호출 후 페이지 리프레시
 * - 재고 검증 및 경고 표시
 *
 * @dependencies
 * - next/image: Image 컴포넌트
 * - next/link: Link 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/input: Input 컴포넌트
 * - @/actions/cart: 장바구니 Server Actions
 * - @/types/cart: CartItemWithProduct 타입
 * - lucide-react: Trash2 아이콘
 */

interface CartItemProps {
  /** 장바구니 아이템 (상품 정보 포함) */
  item: CartItemWithProduct;
  /** 선택적 업데이트 콜백 (장바구니 페이지 리프레시용) */
  onUpdate?: () => void;
}

export function CartItem({ item, onUpdate }: CartItemProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const updateCartItemMutation = useUpdateCartItem();
  const removeCartItemMutation = useRemoveCartItem();
  const isUpdating = updateCartItemMutation.isPending;
  const isDeleting = removeCartItemMutation.isPending;

  // props의 quantity가 변경되면 로컬 상태도 업데이트 (동기화)
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const maxQuantity = item.product.stock_quantity;
  const isOutOfStock = maxQuantity === 0;
  const hasStockWarning = quantity > maxQuantity && !isOutOfStock;

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

  const handleUpdateQuantity = () => {
    // 수량이 변경되지 않았으면 업데이트하지 않음
    if (quantity === item.quantity) {
      return;
    }

    // 클라이언트 측 재고 검증
    if (quantity > maxQuantity) {
      showStockError(maxQuantity, quantity);
      setQuantity(maxQuantity);
      return;
    }

    updateCartItemMutation.mutate(
      { cartItemId: item.id, quantity },
      {
        onSuccess: () => {
          // 성공 시 Toast 메시지 및 부모 컴포넌트에 알림 (쿼리 무효화는 자동 처리됨)
          showCartUpdateSuccess(item.product.name, quantity);
          if (onUpdate) {
            onUpdate();
          } else {
            router.refresh();
          }
        },
        onError: (error) => {
          // 실패 시 에러 표시 및 원래 수량으로 복원
          const errorMessage = error.message || '수량 변경 중 오류가 발생했습니다.';
          
          // 에러 타입별 처리
          if (errorMessage.includes('비활성화')) {
            showProductInactiveError(item.product.name);
          } else if (errorMessage.includes('재고')) {
            showStockError(maxQuantity, quantity);
          } else {
            showError('수량 변경 실패', errorMessage);
          }
          
          setQuantity(item.quantity);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!confirm('정말 이 상품을 장바구니에서 제거하시겠습니까?')) {
      return;
    }

    removeCartItemMutation.mutate(
      { cartItemId: item.id },
      {
        onSuccess: () => {
          // 성공 시 Toast 메시지 및 부모 컴포넌트에 알림 (쿼리 무효화는 자동 처리됨)
          showCartDeleteSuccess(item.product.name);
          if (onUpdate) {
            onUpdate();
          } else {
            router.refresh();
          }
        },
        onError: (error) => {
          showError('삭제 실패', error.message || '장바구니 아이템 삭제 중 오류가 발생했습니다.');
        },
      }
    );
  };

  // 수량 변경 시 자동으로 업데이트 (500ms debounce)
  useEffect(() => {
    // 수량이 실제로 변경되었고, 업데이트 중이 아닐 때만 실행
    if (quantity !== item.quantity && !isUpdating) {
      const timeoutId = setTimeout(() => {
        handleUpdateQuantity();
      }, 500); // 500ms 후 자동 업데이트

      return () => clearTimeout(timeoutId);
    }
    // handleUpdateQuantity는 함수 내부에서 quantity와 item.quantity를 참조하므로 의존성 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, item.quantity, isUpdating]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
      <div className="flex flex-col md:flex-row gap-4">
        {/* 좌측: 이미지 + 상품 정보 */}
        <div className="flex gap-4 flex-1">
          {/* 상품 이미지 */}
          <Link
            href={`/products/${item.product.id}`}
            className="flex-shrink-0"
          >
            <div className="relative w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
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
              <h3 className="font-semibold text-lg mb-1 truncate">
                {item.product.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              단가: {item.product.price.toLocaleString()}원
            </p>
            {hasStockWarning && (
              <p className="text-sm text-red-500 font-medium mt-1">
                재고 부족 (재고: {maxQuantity}개)
              </p>
            )}
          </div>
        </div>

        {/* 중앙: 수량 조절 UI */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={quantity <= 1 || isUpdating || isDeleting}
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
              onBlur={handleUpdateQuantity}
              disabled={isUpdating || isDeleting || isOutOfStock}
              className="w-20 text-center"
              aria-label={`${item.product.name} 수량`}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={quantity >= maxQuantity || isUpdating || isDeleting}
              className="h-9 w-9"
              aria-label="수량 증가"
            >
              +
            </Button>
          </div>
        </div>

        {/* 우측: 총액 + 삭제 버튼 */}
        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6">
          <div className="text-right">
            <p className="font-bold text-lg text-primary">
              {(item.product.price * quantity).toLocaleString()}원
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label="장바구니에서 삭제"
          >
            {isDeleting ? (
              <span className="text-xs">...</span>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
