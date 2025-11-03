'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * @file components/cart-add-dialog.tsx
 * @description 장바구니 담기 성공 Dialog 컴포넌트
 *
 * 이 컴포넌트는 상품을 장바구니에 추가한 후 표시되는 확인 Dialog입니다.
 *
 * 주요 기능:
 * 1. 장바구니 담기 성공 메시지 표시
 * 2. 상품명, 수량, 총액 정보 표시
 * 3. "쇼핑 계속하기" 버튼 (Dialog 닫기)
 * 4. "장바구니로 이동" 버튼 (장바구니 페이지로 이동)
 *
 * 핵심 구현 로직:
 * - 외부에서 open/onOpenChange로 상태 제어
 * - useRouter를 사용하여 장바구니 페이지로 이동
 * - 재사용 가능한 컴포넌트로 설계
 *
 * @dependencies
 * - next/navigation: 라우팅 (useRouter)
 * - @/components/ui/dialog: Dialog 컴포넌트들
 * - @/components/ui/button: Button 컴포넌트
 */

interface CartAddDialogProps {
  /** Dialog 열림/닫힘 상태 */
  open: boolean;
  /** Dialog 상태 변경 핸들러 */
  onOpenChange: (open: boolean) => void;
  /** 상품명 */
  productName: string;
  /** 수량 */
  quantity: number;
  /** 총 금액 (가격 × 수량) */
  totalAmount: number;
}

export function CartAddDialog({
  open,
  onOpenChange,
  productName,
  quantity,
  totalAmount,
}: CartAddDialogProps) {
  const router = useRouter();

  const handleContinueShopping = () => {
    onOpenChange(false);
  };

  const handleGoToCart = () => {
    router.push('/cart');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>장바구니에 추가되었습니다</DialogTitle>
          <DialogDescription>
            <div className="mt-4 space-y-2">
              <div>
                <span className="font-medium">상품명:</span> {productName}
              </div>
              <div>
                <span className="font-medium">수량:</span> {quantity}개
              </div>
              <div>
                <span className="font-medium">총 금액:</span>{' '}
                {totalAmount.toLocaleString()}원
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleContinueShopping}>
            쇼핑 계속하기
          </Button>
          <Button onClick={handleGoToCart}>장바구니로 이동</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
