import { supabase } from '@/lib/supabase/client';
import { createClerkSupabaseClient } from '@/lib/supabase/server';
import type { Product } from '@/types/product';
import type { Category } from '@/components/category-filter';

/**
 * 페이지네이션된 상품 목록 반환 타입
 */
export interface ProductsWithPagination {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

/**
 * 상품 정렬 옵션
 */
export type SortOption = 'latest' | 'price-asc' | 'price-desc' | 'popularity';

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

/**
 * 서버 컴포넌트용 활성 상품 조회
 * 
 * 페이지네이션, 정렬, 카테고리 필터 기능은 추후 getProductsWithPagination에서 구현 예정
 */
export async function getActiveProductsServer(): Promise<Product[]> {
  const supabase = createClerkSupabaseClient();
  
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
 * 페이지네이션, 정렬, 카테고리 필터링이 가능한 상품 조회 함수 (서버 컴포넌트용)
 * 
 * @param options - 페이지네이션 및 필터 옵션
 * @param options.category - 카테고리 필터 ('all' 또는 null이면 전체 조회)
 * @param options.page - 페이지 번호 (기본값: 1)
 * @param options.limit - 페이지당 상품 수 (기본값: 12)
 * @param options.sortBy - 정렬 옵션 (기본값: 'latest')
 * @returns 페이지네이션된 상품 목록 및 메타데이터
 */
export async function getProductsWithPagination(
  options: {
    category?: Category | null;
    page?: number;
    limit?: number;
    sortBy?: SortOption;
  } = {}
): Promise<ProductsWithPagination> {
  const {
    category = null,
    page = 1,
    limit = 12,
    sortBy = 'latest',
  } = options;

  // 입력값 검증
  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, limit);
  const offset = (validPage - 1) * validLimit;

  const supabase = createClerkSupabaseClient();

  // 판매량 정렬은 별도 로직으로 처리
  if (sortBy === 'popularity') {
    return await getProductsWithPaginationByPopularity(
      supabase,
      category,
      validPage,
      validLimit
    );
  }

  // 기본 쿼리 구성: is_active 필터 적용
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  // 카테고리 필터링: 'all' 또는 null이면 필터링하지 않음
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  // 정렬 적용
  switch (sortBy) {
    case 'latest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // 페이지네이션 적용
  query = query.range(offset, offset + validLimit - 1);

  // 쿼리 실행
  const { data, error, count } = await query;

  if (error) throw error;

  // 총 개수 계산
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / validLimit));

  // 현재 페이지가 전체 페이지 수를 초과하는 경우 조정
  const adjustedPage = validPage > totalPages ? totalPages : validPage;

  // price 필드를 숫자로 변환
  const products = (data || []).map(product => {
    const parsedPrice = parseFloat(product.price);
    if (isNaN(parsedPrice)) {
      console.warn(`상품 ${product.id}의 가격이 유효하지 않습니다: ${product.price}`);
    }
    return {
      ...product,
      price: isNaN(parsedPrice) ? 0 : parsedPrice,
    };
  });

  return {
    products,
    totalCount,
    currentPage: adjustedPage,
    totalPages,
  };
}

/**
 * 판매량 기준 페이지네이션된 상품 조회 (내부 헬퍼 함수)
 */
async function getProductsWithPaginationByPopularity(
  supabase: ReturnType<typeof createClerkSupabaseClient>,
  category: Category | null,
  page: number,
  limit: number
): Promise<ProductsWithPagination> {
  // 1. 판매량 집계 (order_items에서 product_id별 quantity 합계)
  const { data: salesData, error: salesError } = await supabase
    .from('order_items')
    .select('product_id, quantity');

  // 판매량 데이터가 없거나 에러 발생 시 최신순으로 폴백
  if (salesError || !salesData || salesData.length === 0) {
    return getProductsWithPagination({
      category,
      page,
      limit,
      sortBy: 'latest',
    });
  }

  // 2. 판매량 계산 (product_id별 quantity 합계)
  const salesMap = new Map<string, number>();
  for (const item of salesData) {
    const productId = item.product_id;
    const quantity = item.quantity || 0;
    const currentTotal = salesMap.get(productId) || 0;
    salesMap.set(productId, currentTotal + quantity);
  }

  // 3. 총 개수 조회용 쿼리 구성
  let countQuery = supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (category && category !== 'all') {
    countQuery = countQuery.eq('category', category);
  }

  const { count, error: countError } = await countQuery;
  if (countError) throw countError;

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  
  // 현재 페이지가 전체 페이지 수를 초과하는 경우 조정
  const adjustedPage = page > totalPages ? totalPages : page;
  const offset = (adjustedPage - 1) * limit;

  // 4. 판매량이 있는 상품들 조회
  const productIdsWithSales = Array.from(salesMap.keys());
  let productsWithSales: Product[] = [];

  if (productIdsWithSales.length > 0) {
    let salesQuery = supabase
      .from('products')
      .select('*')
      .in('id', productIdsWithSales)
      .eq('is_active', true);

    if (category && category !== 'all') {
      salesQuery = salesQuery.eq('category', category);
    }

    const { data, error } = await salesQuery;
    if (error) throw error;

    if (data) {
      // 판매량 기준으로 정렬
      productsWithSales = data
        .map(product => {
          const parsedPrice = parseFloat(product.price);
          return {
            ...product,
            price: isNaN(parsedPrice) ? 0 : parsedPrice,
            _salesCount: salesMap.get(product.id) || 0,
          };
        })
        .sort((a, b) => (b._salesCount || 0) - (a._salesCount || 0))
        .map(({ _salesCount, ...product }) => product);
    }
  }

  // 5. 페이지네이션 적용: 판매량이 있는 상품에서 필요한 범위만 선택
  const paginatedProductsWithSales = productsWithSales.slice(offset, offset + limit);

  // 6. 판매량이 있는 상품이 부족한 경우, 판매량이 없는 상품으로 보충
  let finalProducts = paginatedProductsWithSales;

  if (paginatedProductsWithSales.length < limit) {
    const needed = limit - paginatedProductsWithSales.length;
    const existingIds = paginatedProductsWithSales.map(p => p.id);

    // 판매량이 없는 상품들 조회
    let noSalesQuery = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      noSalesQuery = noSalesQuery.eq('category', category);
    }

    // 이미 선택된 상품 제외
    if (existingIds.length > 0) {
      noSalesQuery = noSalesQuery.not('id', 'in', `(${existingIds.join(',')})`);
    }

    // 판매량이 있는 상품 제외
    if (productIdsWithSales.length > 0) {
      // 이미 existingIds에 포함된 것은 제외 처리했으므로, 별도로 처리할 필요 없음
      // 하지만 더 정확한 필터링을 위해 추가 조건 적용
      const idsToExclude = [...new Set([...existingIds, ...productIdsWithSales])];
      if (idsToExclude.length > 0 && idsToExclude.length <= 100) {
        // Supabase의 'in' 필터는 최대 100개까지만 지원하므로 제한
        noSalesQuery = noSalesQuery.not('id', 'in', `(${idsToExclude.join(',')})`);
      }
    }

    noSalesQuery = noSalesQuery.limit(needed);

    const { data: noSalesData, error: noSalesError } = await noSalesQuery;
    
    // 에러가 발생하거나 데이터가 없으면 기존 결과만 반환
    if (!noSalesError && noSalesData) {
      const noSalesProducts = noSalesData.map(product => {
        const parsedPrice = parseFloat(product.price);
        if (isNaN(parsedPrice)) {
          console.warn(`상품 ${product.id}의 가격이 유효하지 않습니다: ${product.price}`);
        }
        return {
          ...product,
          price: isNaN(parsedPrice) ? 0 : parsedPrice,
        };
      });

      finalProducts = [...paginatedProductsWithSales, ...noSalesProducts];
    }
  }

  return {
    products: finalProducts,
    totalCount,
    currentPage: adjustedPage,
    totalPages,
  };
}

/**
 * 상품 ID로 단건 조회 (서버 컴포넌트용)
 * 
 * @param id - 상품 UUID
 * @returns 상품 정보 또는 null (없거나 비활성화된 경우)
 */
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  // 데이터베이스 에러는 상위로 전파
  if (error) {
    // 상품이 없는 경우 (PGRST116)는 null 반환
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  // 데이터가 없는 경우
  if (!data) {
    return null;
  }

  // price 필드를 숫자로 변환
  const parsedPrice = parseFloat(data.price);
  if (isNaN(parsedPrice)) {
    console.warn(`상품 ${data.id}의 가격이 유효하지 않습니다: ${data.price}`);
  }

  return {
    ...data,
    price: isNaN(parsedPrice) ? 0 : parsedPrice,
  };
}

