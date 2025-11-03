'use client';

import { SignedOut, SignInButton, SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCartCount } from '@/hooks/use-cart-count';

/**
 * @file components/Navbar.tsx
 * @description 네비게이션 바 컴포넌트
 *
 * 주요 기능:
 * 1. 로고 및 홈 링크
 * 2. 장바구니 아이콘 (로그인 시 표시, 배지 포함)
 * 3. 로그인/회원가입 버튼 또는 사용자 프로필
 *
 * @dependencies
 * - @clerk/nextjs: 인증 상태 관리
 * - @/hooks/use-cart-count: 장바구니 개수 조회 훅
 * - lucide-react: ShoppingCart 아이콘
 */
function Navbar() {
  const { cartCount } = useCartCount();

  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 max-w-7xl mx-auto">
      <Link href="/" className="text-2xl font-bold">
        SaaS Template
      </Link>
      <div className="flex gap-4 items-center">
        {/* 장바구니 아이콘 (로그인 시에만 표시) */}
        <SignedIn>
          <Link
            href="/cart"
            className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="장바구니"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </SignedIn>

        {/* 로그인/회원가입 버튼 또는 사용자 프로필 */}
        <SignedOut>
          <SignInButton mode="modal">
            <Button>로그인</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}

export default Navbar;
