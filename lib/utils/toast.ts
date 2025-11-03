import { toast } from 'sonner';

/**
 * @file lib/utils/toast.ts
 * @description Toast 알림 유틸리티 함수
 *
 * 장바구니 관련 작업의 성공/실패 피드백을 위한 Toast 메시지 함수들을 제공합니다.
 *
 * @dependencies
 * - sonner: toast 함수
 */

/**
 * 장바구니 추가 성공 Toast
 */
export function showCartAddSuccess(productName: string, quantity: number) {
  toast.success('장바구니에 추가되었습니다', {
    description: `${productName} ${quantity}개가 장바구니에 추가되었습니다.`,
  });
}

/**
 * 장바구니 수량 변경 성공 Toast
 */
export function showCartUpdateSuccess(productName: string, quantity: number) {
  toast.success('수량이 변경되었습니다', {
    description: `${productName}의 수량이 ${quantity}개로 변경되었습니다.`,
  });
}

/**
 * 장바구니 아이템 삭제 성공 Toast
 */
export function showCartDeleteSuccess(productName: string) {
  toast.success('장바구니에서 제거되었습니다', {
    description: `${productName}이(가) 장바구니에서 제거되었습니다.`,
  });
}

/**
 * 재고 부족 에러 Toast
 */
export function showStockError(currentStock: number, requestedQuantity: number) {
  toast.error('재고가 부족합니다', {
    description: `현재 재고: ${currentStock}개, 요청 수량: ${requestedQuantity}개`,
    action: {
      label: '최대 수량으로 추가',
      onClick: () => {
        // 이 함수는 호출하는 쪽에서 처리
      },
    },
  });
}

/**
 * 상품 비활성화 에러 Toast
 */
export function showProductInactiveError(productName?: string) {
  toast.error('상품을 구매할 수 없습니다', {
    description: productName
      ? `${productName}은(는) 현재 판매 중지된 상품입니다.`
      : '이 상품은 현재 판매 중지되었습니다.',
  });
}

/**
 * 네트워크 에러 Toast
 */
export function showNetworkError(message?: string) {
  toast.error('네트워크 오류', {
    description: message || '연결에 실패했습니다. 잠시 후 다시 시도해주세요.',
    action: {
      label: '재시도',
      onClick: () => {
        window.location.reload();
      },
    },
  });
}

/**
 * 일반 에러 Toast
 */
export function showError(title: string, description?: string) {
  toast.error(title, {
    description,
  });
}

/**
 * 일반 성공 Toast
 */
export function showSuccess(title: string, description?: string) {
  toast.success(title, {
    description,
  });
}

/**
 * 로그인 필요 Toast
 */
export function showLoginRequired() {
  toast.warning('로그인이 필요합니다', {
    description: '장바구니 기능을 사용하려면 로그인이 필요합니다.',
  });
}
