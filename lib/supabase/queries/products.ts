import { supabase } from '@/lib/supabase/client';
import type { Product } from '@/types/product';

export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Supabase는 DECIMAL 타입을 문자열로 반환하므로 숫자로 변환
  return (data || []).map(product => ({
    ...product,
    price: parseFloat(product.price),
  }));
}

/**
 * 인기상품 조회 (판매량 기반)
 * 
 * order_items 테이블에서 판매량을 집계하여 상위 6개 상품을 반환합니다.
 * 판매량이 없거나 데이터가 부족한 경우, 최신 상품으로 폴백합니다.
 */
export async function getPopularProducts(limit: number = 6): Promise<Product[]> {
  // 1. 판매량 집계 쿼리 (order_items에서 product_id별 quantity 합계)
  const { data: salesData, error: salesError } = await supabase
    .from('order_items')
    .select('product_id, quantity'); // 모든 주문 아이템 조회

  if (salesError) {
    console.warn('판매량 조회 실패, 최신 상품으로 폴백:', salesError);
    // 에러 발생 시 최신 상품으로 폴백
    return getActiveProducts().then(products => products.slice(0, limit));
  }

  // 2. 판매량 계산 (product_id별 quantity 합계)
  const salesMap = new Map<string, number>();
  if (salesData) {
    for (const item of salesData) {
      const productId = item.product_id;
      const quantity = item.quantity || 0;
      const currentTotal = salesMap.get(productId) || 0;
      salesMap.set(productId, currentTotal + quantity);
    }
  }

  // 3. 판매량이 있는 상품들 가져오기
  const productIdsWithSales = Array.from(salesMap.keys());
  
  let popularProducts: Product[] = [];

  if (productIdsWithSales.length > 0) {
    // 판매량이 있는 상품 조회
    const { data: productsWithSales, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIdsWithSales)
      .eq('is_active', true);

    if (!productsError && productsWithSales) {
      // 판매량 기준으로 정렬
      popularProducts = productsWithSales
        .map(product => ({
          ...product,
          price: parseFloat(product.price),
          _salesCount: salesMap.get(product.id) || 0, // 임시로 판매량 저장
        }))
        .sort((a, b) => (b._salesCount || 0) - (a._salesCount || 0))
        .slice(0, limit)
        .map(({ _salesCount, ...product }) => product); // 판매량 제거
    }
  }

  // 4. 판매량이 있는 상품이 limit보다 적으면 최신 상품으로 보충
  if (popularProducts.length < limit) {
    const { data: latestProducts, error: latestError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!latestError && latestProducts) {
      const latestProductsFormatted = latestProducts.map(product => ({
        ...product,
        price: parseFloat(product.price),
      }));

      // 이미 포함된 상품 제외
      const existingIds = new Set(popularProducts.map(p => p.id));
      const additionalProducts = latestProductsFormatted.filter(
        p => !existingIds.has(p.id)
      );

      popularProducts = [
        ...popularProducts,
        ...additionalProducts.slice(0, limit - popularProducts.length),
      ];
    }
  }

  // 5. 판매량이 전혀 없는 경우 최신 상품으로 폴백
  if (popularProducts.length === 0) {
    const { data: latestProducts, error: latestError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (latestError) throw latestError;

    return (latestProducts || []).map(product => ({
      ...product,
      price: parseFloat(product.price),
    }));
  }

  return popularProducts;
}

