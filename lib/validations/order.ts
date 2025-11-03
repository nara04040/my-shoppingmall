import { z } from 'zod';

/**
 * @file lib/validations/order.ts
 * @description 주문 폼 검증 스키마
 *
 * Zod를 사용한 주문 폼 데이터 검증 스키마입니다.
 *
 * 주요 검증:
 * - 배송지 정보: 이름, 전화번호, 주소
 * - 주문 메모: 선택사항, 최대 길이 제한
 */

/**
 * 배송지 정보 검증 스키마
 */
export const shippingAddressSchema = z.object({
  recipientName: z
    .string()
    .min(2, '이름은 최소 2자 이상 입력해주세요.')
    .max(50, '이름은 최대 50자까지 입력 가능합니다.')
    .trim(),
  phone: z
    .string()
    .min(1, '연락처를 입력해주세요.')
    .regex(
      /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$|^01[0-9]{9}$/,
      '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678 또는 01012345678)'
    ),
  address: z
    .string()
    .min(10, '주소는 최소 10자 이상 입력해주세요.')
    .max(200, '주소는 최대 200자까지 입력 가능합니다.')
    .trim(),
});

/**
 * 주문 폼 전체 검증 스키마
 */
export const orderFormSchema = z.object({
  shippingAddress: shippingAddressSchema,
  orderNote: z
    .string()
    .max(500, '주문 메모는 최대 500자까지 입력 가능합니다.')
    .optional()
    .or(z.literal('')),
});

/**
 * 주문 폼 데이터 타입 (Zod 스키마에서 추론)
 */
export type OrderFormData = z.infer<typeof orderFormSchema>;
