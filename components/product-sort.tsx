'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SortOption } from '@/lib/supabase/queries/products';

/**
 * @file product-sort.tsx
 * @description 상품 정렬 UI 컴포넌트
 *
 * 이 컴포넌트는 상품 목록을 정렬할 수 있는 버튼 그룹을 제공합니다.
 *
 * 주요 기능:
 * 1. 정렬 옵션 버튼 표시 (최신순, 가격 낮은순, 가격 높은순, 인기순)
 * 2. 선택된 정렬 옵션 상태 관리
 * 3. 정렬 변경 시 URL 쿼리 파라미터 업데이트
 * 4. 정렬 변경 시 페이지를 1로 리셋
 *
 * 핵심 구현 로직:
 * - useSearchParams로 현재 URL 파라미터 읽기
 * - useRouter로 URL 파라미터 업데이트
 * - 선택된 버튼은 시각적으로 구분 (variant 변경)
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/components/ui/button: shadcn/ui Button 컴포넌트
 * - lucide-react: 아이콘
 * - @/lib/utils: cn 함수 (클래스 병합)
 * - @/lib/supabase/queries/products: SortOption 타입
 */

interface ProductSortProps {
  initialSort?: SortOption;
}

const SORT_OPTIONS: Array<{ value: SortOption; label: string; icon: React.ReactNode }> = [
  { value: 'latest', label: '최신순', icon: <ArrowUpDown className="size-4" /> },
  { value: 'price-asc', label: '가격 낮은순', icon: <ArrowUp className="size-4" /> },
  { value: 'price-desc', label: '가격 높은순', icon: <ArrowDown className="size-4" /> },
  { value: 'popularity', label: '인기순', icon: <TrendingUp className="size-4" /> },
];

export function ProductSort({ initialSort = 'latest' }: ProductSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL에서 현재 정렬 옵션 읽기
  const currentSort = (searchParams.get('sort') as SortOption) || initialSort;
  const [selectedSort, setSelectedSort] = useState<SortOption>(currentSort);

  // currentSort가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    setSelectedSort(currentSort);
  }, [currentSort]);

  const handleSortClick = (sort: SortOption) => {
    setSelectedSort(sort);
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (sort === 'latest') {
      // 기본값이면 파라미터에서 제거
      params.delete('sort');
    } else {
      params.set('sort', sort);
    }
    
    // 정렬 변경 시 페이지를 1로 리셋
    params.delete('page');
    
    // URL 업데이트 (페이지 리로드 없이)
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {SORT_OPTIONS.map((option) => {
        const isSelected = selectedSort === option.value;
        return (
          <Button
            key={option.value}
            onClick={() => handleSortClick(option.value)}
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'transition-all',
              isSelected && 'shadow-md'
            )}
          >
            {option.icon}
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

