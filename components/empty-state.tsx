import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * @file empty-state.tsx
 * @description 재사용 가능한 빈 상태 컴포넌트
 *
 * 데이터가 없을 때 표시하는 빈 상태 UI 컴포넌트입니다.
 * 다양한 상황에서 재사용 가능하도록 설계되었습니다.
 *
 * 주요 기능:
 * 1. 아이콘 표시
 * 2. 제목 및 설명 텍스트
 * 3. 선택적 액션 버튼/링크
 * 4. 반응형 디자인
 *
 * @dependencies
 * - @/components/ui/button: Button 컴포넌트
 * - lucide-react: 아이콘 (부모에서 전달받음)
 * - next/link: Link 컴포넌트
 */

interface EmptyStateProps {
  /** 아이콘 컴포넌트 (lucide-react 아이콘) */
  icon?: ReactNode;
  /** 제목 텍스트 */
  title: string;
  /** 설명 텍스트 */
  description?: string;
  /** 액션 버튼 표시 여부 */
  action?: {
    /** 버튼 텍스트 */
    label: string;
    /** 버튼 클릭 핸들러 (링크 사용 시 undefined) */
    onClick?: () => void;
    /** 링크 URL (링크 사용 시) */
    href?: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* 아이콘 */}
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}

      {/* 제목 */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {/* 설명 */}
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
      )}

      {/* 액션 버튼 */}
      {action && (
        <div>
          {action.href ? (
            <Button asChild variant="default">
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick} variant="default">
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

