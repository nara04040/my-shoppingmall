import { createClerkSupabaseClient } from '@/lib/supabase/server';
import type { CartItem, CartItemWithProduct, CartSummary } from '@/types/cart';
import type { Product } from '@/types/product';

/**
 * @file lib/supabase/queries/cart.ts
 * @description 장바구니 관련 Supabase 쿼리 함수
 *
 * 이 파일은 장바구니 기능에서 사용되는 모든 데이터베이스 쿼리 함수를 제공합니다.
 *
 * 주요 기능:
 * 1. 장바구니 아이템 조회 (상품 정보 JOIN)
 * 2. 장바구니 추가 (UPSERT 로직, 재고 검증)
 * 3. 수량 변경 (재고 검증 포함)
 * 4. 장바구니 아이템 삭제
 * 5. 장바구니 비우기
 * 6. 장바구니 아이템 개수 조회
 *
 * 핵심 구현 로직:
 * - 서버 사이드에서 사용 (createClerkSupabaseClient 사용)
 * - clerk_id로 사용자별 장바구니 필터링
 * - 재고 수량 검증 (stock_quantity 초과 불가)
 * - 상품 정보 JOIN을 통한 최신 가격/재고 정보 제공
 * - UPSERT 로직으로 동일 상품 추가 시 수량 증가
 *
 * @dependencies
 * - @/lib/supabase/server: 서버 사이드 Supabase 클라이언트
 * - @/types/cart: 장바구니 관련 타입
 * - @/types/product: 상품 타입
 */

/**
 * 현재 사용자의 장바구니 아이템 전체 조회 (상품 정보 포함)
 *
 * @param clerkId - Clerk 사용자 ID
 * @returns 상품 정보가 포함된 장바구니 아이템 배열
 * @throws 데이터베이스 에러 시 에러 throw
 */
export async function getCartItems(
  clerkId: string
): Promise<CartItemWithProduct[]> {
  const supabase = createClerkSupabaseClient();

  // cart_items와 products 테이블 JOIN
  const { data, error } = await supabase
    .from('cart_items')
    .select(
      `
      id,
      clerk_id,
      product_id,
      quantity,
      created_at,
      updated_at,
      products (
        id,
        name,
        description,
        price,
        category,
        stock_quantity,
        is_active,
        created_at,
        updated_at
      )
    `
    )
    .eq('clerk_id', clerkId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  if (!data || data.length === 0) {
    return [];
  }

  // 타입 변환 및 price 숫자 변환
  return data
    .filter((item) => item.products !== null) // 비활성화되거나 삭제된 상품 제외
    .map((item) => {
      const product = item.products as Product;
      return {
        id: item.id,
        clerk_id: item.clerk_id,
        product_id: item.product_id,
        quantity: item.quantity,
        created_at: item.created_at,
        updated_at: item.updated_at,
        product: {
          ...product,
          price: parseFloat(product.price),
        },
      };
    });
}

/**
 * 장바구니에 상품 추가 (UPSERT 로직)
 *
 * 이미 해당 상품이 장바구니에 있으면 수량을 증가시키고,
 * 없으면 새로 추가합니다.
 *
 * @param clerkId - Clerk 사용자 ID
 * @param productId - 추가할 상품 ID
 * @param quantity - 추가할 수량 (기본값: 1)
 * @returns 생성 또는 업데이트된 장바구니 아이템
 * @throws 재고 부족 시 에러 throw
 * @throws 상품이 없거나 비활성화된 경우 에러 throw
 */
export async function addToCart(
  clerkId: string,
  productId: string,
  quantity: number = 1
): Promise<CartItem> {
  const supabase = createClerkSupabaseClient();

  // 1. 상품 정보 조회 (재고 확인용)
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (productError) {
    if (productError.code === 'PGRST116') {
      throw new Error('상품을 찾을 수 없습니다.');
    }
    throw productError;
  }

  if (!product) {
    throw new Error('상품을 찾을 수 없습니다.');
  }

  // 2. 재고 검증
  const stockQuantity = product.stock_quantity || 0;
  if (stockQuantity <= 0) {
    throw new Error('품절된 상품입니다.');
  }

  // 3. 기존 장바구니 아이템 확인
  const { data: existingItem, error: findError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('clerk_id', clerkId)
    .eq('product_id', productId)
    .single();

  // 에러가 있지만 '없음' 에러가 아닌 경우에만 throw
  if (findError && findError.code !== 'PGRST116') {
    throw findError;
  }

  let finalQuantity: number;

  if (existingItem) {
    // 기존 아이템이 있으면 수량 증가
    finalQuantity = existingItem.quantity + quantity;

    // 재고 초과 검증
    if (finalQuantity > stockQuantity) {
      throw new Error(
        `재고가 부족합니다. (현재 재고: ${stockQuantity}개, 요청 수량: ${finalQuantity}개)`
      );
    }

    // 수량 업데이트
    const { data: updatedItem, error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: finalQuantity })
      .eq('id', existingItem.id)
      .select()
      .single();

    if (updateError) throw updateError;
    if (!updatedItem) throw new Error('장바구니 업데이트 실패');

    return updatedItem;
  } else {
    // 새 아이템 추가
    finalQuantity = quantity;

    // 재고 초과 검증
    if (finalQuantity > stockQuantity) {
      throw new Error(
        `재고가 부족합니다. (현재 재고: ${stockQuantity}개, 요청 수량: ${finalQuantity}개)`
      );
    }

    const { data: newItem, error: insertError } = await supabase
      .from('cart_items')
      .insert({
        clerk_id: clerkId,
        product_id: productId,
        quantity: finalQuantity,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    if (!newItem) throw new Error('장바구니 추가 실패');

    return newItem;
  }
}

/**
 * 장바구니 아이템 수량 변경
 *
 * @param cartItemId - 변경할 장바구니 아이템 ID
 * @param quantity - 새로운 수량 (최소 1, 최대 재고 수량)
 * @returns 업데이트된 장바구니 아이템
 * @throws 재고 부족 시 에러 throw
 * @throws 아이템이 없으면 에러 throw
 */
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<CartItem> {
  const supabase = createClerkSupabaseClient();

  // 1. 최소 수량 검증
  if (quantity < 1) {
    throw new Error('수량은 1개 이상이어야 합니다.');
  }

  // 2. 장바구니 아이템 조회 (상품 정보 포함)
  const { data: cartItem, error: findError } = await supabase
    .from('cart_items')
    .select(
      `
      *,
      products (
        id,
        stock_quantity,
        is_active
      )
    `
    )
    .eq('id', cartItemId)
    .single();

  if (findError) {
    if (findError.code === 'PGRST116') {
      throw new Error('장바구니 아이템을 찾을 수 없습니다.');
    }
    throw findError;
  }

  if (!cartItem) {
    throw new Error('장바구니 아이템을 찾을 수 없습니다.');
  }

  const product = cartItem.products as { stock_quantity: number; is_active: boolean } | null;

  if (!product || !product.is_active) {
    throw new Error('상품이 비활성화되었습니다.');
  }

  // 3. 재고 검증
  const stockQuantity = product.stock_quantity || 0;
  if (quantity > stockQuantity) {
    throw new Error(
      `재고가 부족합니다. (현재 재고: ${stockQuantity}개, 요청 수량: ${quantity}개)`
    );
  }

  // 4. 수량 업데이트
  const { data: updatedItem, error: updateError } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId)
    .select()
    .single();

  if (updateError) throw updateError;
  if (!updatedItem) throw new Error('수량 변경 실패');

  return updatedItem;
}

/**
 * 장바구니에서 아이템 삭제
 *
 * @param cartItemId - 삭제할 장바구니 아이템 ID
 * @throws 아이템이 없으면 에러 throw
 */
export async function removeCartItem(cartItemId: string): Promise<void> {
  const supabase = createClerkSupabaseClient();

  const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);

  if (error) throw error;
}

/**
 * 현재 사용자의 장바구니 전체 비우기
 *
 * @param clerkId - Clerk 사용자 ID
 */
export async function clearCart(clerkId: string): Promise<void> {
  const supabase = createClerkSupabaseClient();

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('clerk_id', clerkId);

  if (error) throw error;
}

/**
 * 현재 사용자의 장바구니 아이템 개수 조회
 *
 * GNB 배지 표시용으로 사용됩니다.
 * 장바구니에 담긴 서로 다른 상품 종류 수를 반환합니다.
 *
 * @param clerkId - Clerk 사용자 ID
 * @returns 장바구니 아이템 종류 수 (서로 다른 상품 개수, 수량 합계가 아님)
 */
export async function getCartItemCount(clerkId: string): Promise<number> {
  const supabase = createClerkSupabaseClient();

  const { count, error } = await supabase
    .from('cart_items')
    .select('*', { count: 'exact', head: true })
    .eq('clerk_id', clerkId);

  if (error) throw error;

  return count || 0;
}

/**
 * 장바구니 요약 정보 계산
 *
 * 장바구니 페이지의 하단 요약 컴포넌트에서 사용됩니다.
 *
 * @param clerkId - Clerk 사용자 ID
 * @returns 장바구니 요약 정보 (총 아이템 수, 총 금액 등)
 */
export async function getCartSummary(clerkId: string): Promise<CartSummary> {
  const cartItems = await getCartItems(clerkId);

  let totalItems = 0;
  let totalAmount = 0;

  for (const item of cartItems) {
    totalItems += item.quantity;
    totalAmount += item.product.price * item.quantity;
  }

  const shippingFee = 0; // 현재는 배송비 무료, 추후 확장 가능
  const grandTotal = totalAmount + shippingFee;

  return {
    totalItems,
    totalAmount,
    shippingFee,
    grandTotal,
  };
}
