'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/product-card';
import { CategoryFilter, type Category } from '@/components/category-filter';
import type { Product } from '@/types/product';

/**
 * @file product-list.tsx
 * @description 상품 목록 및 카테고리 필터링 컴포넌트
 *
 * 이 컴포넌트는 상품 목록을 표시하고 카테고리별 필터링 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 상품 목록 그리드 레이아웃 표시
 * 2. 카테고리 필터링
 * 3. 빈 상태 메시지 표시
 *
 * 핵심 구현 로직:
 * - useState로 선택된 카테고리 관리
 * - useMemo로 필터링된 상품 목록 계산
 * - 카테고리 필터 컴포넌트와 연동
 *
 * @dependencies
 * - @/components/product-card: 상품 카드 컴포넌트
 * - @/components/category-filter: 카테고리 필터 컴포넌트
 * - @/types/product: Product 타입
 */

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all' || selectedCategory === null) {
      return products;
    }
    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <>
      <CategoryFilter onCategoryChange={setSelectedCategory} />

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {selectedCategory === 'all' || selectedCategory === null
            ? '등록된 상품이 없습니다.'
            : '해당 카테고리의 상품이 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

