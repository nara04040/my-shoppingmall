'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { orderFormSchema, type OrderFormData } from '@/lib/validations/order';
import { createOrderAction } from '@/actions/order';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

/**
 * @file components/order-form.tsx
 * @description 주문 폼 컴포넌트
 *
 * 이 컴포넌트는 주문 페이지에서 배송지 정보와 주문 메모를 입력받는 폼을 제공합니다.
 *
 * 주요 기능:
 * 1. 배송지 정보 입력 (이름, 연락처, 주소)
 * 2. 주문 메모 입력 (선택사항)
 * 3. react-hook-form + Zod를 사용한 폼 검증
 * 4. 폼 제출 시 createOrderAction 호출하여 주문 저장
 * 5. 성공 시 주문 완료 페이지로 리다이렉트
 *
 * 핵심 구현 로직:
 * - Client Component로 구현
 * - react-hook-form의 useForm 훅 사용
 * - zodResolver를 통한 Zod 스키마 검증
 * - shadcn/ui Form 컴포넌트 사용
 * - createOrderAction으로 주문 저장
 * - Toast 알림으로 성공/실패 피드백
 *
 * @dependencies
 * - react-hook-form: useForm 훅
 * - @hookform/resolvers: zodResolver
 * - zod: 스키마 검증
 * - @/components/ui/form: Form 컴포넌트
 * - @/components/ui/input: Input 컴포넌트
 * - @/components/ui/textarea: Textarea 컴포넌트
 * - @/lib/validations/order: Zod 스키마
 * - @/actions/order: createOrderAction
 * - sonner: Toast 알림
 */

import type { CartItemWithProduct } from '@/types/cart';

interface OrderFormProps {
  /** 장바구니 요약 정보 (총 주문 금액 계산용) */
  expectedTotalAmount: number;
  /** 장바구니 아이템 목록 (주문명 생성용) */
  cartItems: CartItemWithProduct[];
}

export function OrderForm({ expectedTotalAmount, cartItems }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      shippingAddress: {
        recipientName: '',
        phone: '',
        address: '',
      },
      orderNote: '',
    },
  });

  /**
   * 주문명 생성
   *
   * 장바구니 아이템 목록을 기반으로 주문명을 생성합니다.
   * 예: "상품1 외 2건"
   */
  const generateOrderName = (items: CartItemWithProduct[]): string => {
    if (items.length === 0) {
      return '주문';
    }

    const firstItem = items[0];
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

    if (items.length === 1) {
      return `${firstItem.product.name}`;
    }

    return `${firstItem.product.name} 외 ${totalCount - firstItem.quantity}건`;
  };

  /**
   * 결제창 열기
   *
   * 토스페이먼츠 SDK를 사용하여 결제창을 엽니다.
   */
  const handlePayment = async (
    orderId: string,
    orderName: string,
    amount: number
  ) => {
    try {
      console.group('[OrderForm] 결제창 열기 시작');
      console.log('[OrderForm] 결제 정보:', { orderId, orderName, amount });

      // 클라이언트 키 확인
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        console.error('[OrderForm] 클라이언트 키가 설정되지 않음');
        toast.error('결제 준비 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        setIsSubmitting(false);
        console.groupEnd();
        return;
      }

      // 토스페이먼츠 SDK 초기화
      const tossPayments = await loadTossPayments(clientKey);
      console.log('[OrderForm] SDK 초기화 완료');

      // 결제창 열기
      await tossPayments.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        customerName: form.getValues('shippingAddress.recipientName'),
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });

      console.log('[OrderForm] 결제창 열기 완료');
    } catch (error) {
      console.error('[OrderForm] 결제창 열기 실패:', error);

      // 사용자가 결제창을 닫은 경우
      if (error && typeof error === 'object' && 'code' in error && error.code === 'USER_CANCEL') {
        toast.info('결제가 취소되었습니다.');
      } else {
        toast.error('결제창을 여는 중 오류가 발생했습니다.');
      }

      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  const onSubmit = async (data: OrderFormData) => {
    try {
      setIsSubmitting(true);
      console.group('[OrderForm] 주문 제출 시작');
      console.log('[OrderForm] 주문 데이터:', data);
      console.log('[OrderForm] 예상 총액:', expectedTotalAmount);

      // shippingAddress가 필수인지 확인 (Zod 검증으로 보장되지만 타입 안전성을 위해)
      if (!data.shippingAddress || 
          !data.shippingAddress.recipientName || 
          !data.shippingAddress.phone || 
          !data.shippingAddress.address) {
        toast.error('배송지 정보를 모두 입력해주세요.');
        setIsSubmitting(false);
        console.groupEnd();
        return;
      }

      // createOrderAction 호출
      // 타입 단언: Zod 검증을 통과한 데이터는 CreateOrderData 형태가 보장됨
      const result = await createOrderAction({
        shippingAddress: {
          recipientName: data.shippingAddress.recipientName,
          phone: data.shippingAddress.phone,
          address: data.shippingAddress.address,
        },
        orderNote: data.orderNote,
        expectedTotalAmount,
      });

      if (!result.success) {
        // 타입 가드로 error 속성이 있음을 명확히 함
        const errorMessage = 'error' in result ? result.error : '주문 생성 중 오류가 발생했습니다.';
        console.error('[OrderForm] 주문 생성 실패:', errorMessage);
        toast.error(errorMessage);
        setIsSubmitting(false);
        console.groupEnd();
        return;
      }

      console.log('[OrderForm] 주문 생성 성공, 주문 ID:', result.data?.orderId);
      
      const orderId = result.data?.orderId;
      if (!orderId) {
        toast.error('주문 ID를 받아오지 못했습니다.');
        setIsSubmitting(false);
        console.groupEnd();
        return;
      }

      // 주문명 생성
      const orderName = generateOrderName(cartItems);

      // 주문 생성 성공 후 결제창 열기
      await handlePayment(orderId, orderName, expectedTotalAmount);
      
      console.groupEnd();
    } catch (error) {
      console.error('[OrderForm] 예상치 못한 오류:', error);
      toast.error('주문 처리 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-900">
      <h2 className="text-xl font-bold mb-6">배송지 정보</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 받는 사람 이름 */}
          <FormField
            control={form.control}
            name="shippingAddress.recipientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>받는 사람 이름</FormLabel>
                <FormControl>
                  <Input
                    placeholder="홍길동"
                    {...field}
                    aria-label="받는 사람 이름"
                  />
                </FormControl>
                <FormDescription>
                  주문을 받을 분의 이름을 입력해주세요.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 연락처 */}
          <FormField
            control={form.control}
            name="shippingAddress.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>연락처</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="010-1234-5678"
                    {...field}
                    aria-label="연락처"
                  />
                </FormControl>
                <FormDescription>
                  배송 연락이 가능한 전화번호를 입력해주세요.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 주소 */}
          <FormField
            control={form.control}
            name="shippingAddress.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>배송지 주소</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="서울시 강남구 테헤란로 123"
                    rows={3}
                    {...field}
                    aria-label="배송지 주소"
                  />
                </FormControl>
                <FormDescription>
                  상세 주소까지 모두 입력해주세요.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 주문 메모 */}
          <FormField
            control={form.control}
            name="orderNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>주문 메모 (선택사항)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="배송 시 요청사항을 입력해주세요."
                    rows={4}
                    {...field}
                    aria-label="주문 메모"
                  />
                </FormControl>
                <FormDescription>
                  배송 시 요청사항이나 특이사항을 입력할 수 있습니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 제출 버튼 */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            size="lg"
            disabled={isSubmitting || form.formState.isSubmitting}
            aria-label="주문하기"
          >
            {isSubmitting || form.formState.isSubmitting ? '처리 중...' : '주문하기'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
