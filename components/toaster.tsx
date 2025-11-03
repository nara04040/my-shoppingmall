'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * @file components/toaster.tsx
 * @description Toast 알림 시스템 Provider
 *
 * Sonner Toast 라이브러리를 사용한 전역 Toast Provider입니다.
 * app/layout.tsx에 추가하여 앱 전체에서 toast를 사용할 수 있습니다.
 *
 * @dependencies
 * - sonner: Toast 라이브러리
 */

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      duration={3000}
    />
  );
}
