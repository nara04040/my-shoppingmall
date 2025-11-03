'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * @file category-filter.tsx
 * @description 카테고리 필터링 컴포넌트
 *
 * 이 컴포넌트는 상품 카테고리별로 필터링할 수 있는 버튼 그룹을 제공합니다.
 *
 * 주요 기능:
 * 1. 카테고리 버튼 표시 (전체, electronics, clothing, books, food, sports, beauty, home)
 * 2. 선택된 카테고리 상태 관리
 * 3. 선택된 카테고리를 부모 컴포넌트에 전달
 *
 * 핵심 구현 로직:
 * - useState로 선택된 카테고리 관리
 * - 카테고리 선택 시 onCategoryChange 콜백 호출
 * - 선택된 버튼은 시각적으로 구분 (variant 변경)
 *
 * @dependencies
 * - @/components/ui/button: shadcn/ui Button 컴포넌트
 * - @/lib/utils: cn 함수 (클래스 병합)
 */

export type Category = 'all' | 'electronics' | 'clothing' | 'books' | 'food' | 'sports' | 'beauty' | 'home' | null;

interface CategoryFilterProps {
  onCategoryChange: (category: Category) => void;
  initialCategory?: Category;
}

const CATEGORIES: Array<{ value: Category; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'electronics', label: '전자제품' },
  { value: 'clothing', label: '의류' },
  { value: 'books', label: '도서' },
  { value: 'food', label: '식품' },
  { value: 'sports', label: '스포츠' },
  { value: 'beauty', label: '뷰티' },
  { value: 'home', label: '생활/가정' },
];

export function CategoryFilter({ onCategoryChange, initialCategory = 'all' }: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);

  // initialCategory가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category.value;
        return (
          <Button
            key={category.value}
            onClick={() => handleCategoryClick(category.value)}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'transition-all',
              isSelected && 'shadow-md'
            )}
          >
            {category.label}
          </Button>
        );
      })}
    </div>
  );
}

