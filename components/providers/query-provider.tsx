'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * @file components/providers/query-provider.tsx
 * @description React Query Provider 컴포넌트
 *
 * React Query를 사용하기 위한 QueryClientProvider를 제공합니다.
 * QueryClient 인스턴스를 생성하고 기본 설정을 적용합니다.
 *
 * 주요 설정:
 * - staleTime: 1분 (1분 이내 데이터는 fresh로 간주)
 * - gcTime (이전 cacheTime): 5분 (5분 후 캐시에서 제거)
 * - refetchOnWindowFocus: false (윈도우 포커스 시 자동 리프레시 비활성화)
 * - retry: 1 (실패 시 1회 재시도)
 *
 * @dependencies
 * - @tanstack/react-query: React Query 라이브러리
 */

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            gcTime: 5 * 60 * 1000, // 5분 (이전 cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
