'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @file product-pagination.tsx
 * @description 상품 목록 페이지네이션 컴포넌트
 *
 * 이 컴포넌트는 상품 목록의 페이지네이션을 제공합니다.
 *
 * 주요 기능:
 * 1. 이전/다음 버튼
 * 2. 페이지 번호 표시 (현재 페이지 중심)
 * 3. 총 페이지 수 계산 및 표시
 * 4. 현재 페이지 하이라이트
 * 5. 첫/마지막 페이지에서 버튼 비활성화
 *
 * 핵심 구현 로직:
 * - useSearchParams로 현재 URL 파라미터 읽기
 * - useRouter로 URL 파라미터 업데이트
 * - 페이지 변경 시 카테고리/정렬 파라미터 유지
 * - 반응형 디자인 (모바일에서는 페이지 번호 축소)
 *
 * @dependencies
 * - next/navigation: useRouter, useSearchParams
 * - @/components/ui/button: shadcn/ui Button 컴포넌트
 * - lucide-react: 아이콘
 * - @/lib/utils: cn 함수 (클래스 병합)
 */

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function ProductPagination({ currentPage, totalPages }: ProductPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 총 페이지가 1 이하면 페이지네이션 숨김
  if (totalPages <= 1) {
    return null;
  }

  // 페이지 번호 범위 계산 (현재 페이지 중심으로 ±2개)
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5; // 최대 표시할 페이지 번호 수

    if (totalPages <= maxVisiblePages) {
      // 총 페이지가 적으면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 주변만 표시
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      // 시작 페이지가 1보다 크면 1과 ellipsis 추가
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('ellipsis');
        }
      }

      // 중간 페이지들
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // 끝 페이지가 마지막보다 작으면 ellipsis와 마지막 페이지 추가
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('ellipsis');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }

    // URL 업데이트 (페이지 리로드 없이)
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* 이전 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="gap-1"
      >
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">이전</span>
      </Button>

      {/* 페이지 번호들 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-sm text-gray-500"
              >
                ...
              </span>
            );
          }

          const isCurrentPage = page === currentPage;
          return (
            <Button
              key={page}
              variant={isCurrentPage ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(page)}
              className={cn(
                'min-w-[2.5rem]',
                isCurrentPage && 'shadow-md'
              )}
            >
              {page}
            </Button>
          );
        })}
      </div>

      {/* 다음 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="gap-1"
      >
        <span className="hidden sm:inline">다음</span>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

