- [x] Phase 1: 기본 인프라
  - [x] Next.js 프로젝트 셋업 (pnpm, App Router, React 19)
  - [x] Clerk 연동 (로그인/회원가입, 미들웨어 보호)
  - [x] 기본 레이아웃/네비게이션 구성 (`app/layout.tsx`, `components/Navbar.tsx`)
  - [x] Supabase 프로젝트 연결 및 환경변수 세팅 (`.env.local`)
  - [x] DB 스키마 준비: `products`, `cart_items`, `orders`, `order_items` (개발 환경 RLS 비활성화)
  - [x] 마이그레이션 작성/적용 (`supabase/migrations/*`)

- [ ] Phase 2: 상품 기능
  - [ ] 홈페이지 
    - [x] 상품 목록 (grid 레이아웃)
    - [x] 카테고리 필터링 (electronics, clothing, books, food, sports, beauty, home)
    - [x] 인기상품 섹션 (판매량 기반 또는 관리자 지정)
  - [ ] 상품 목록 페이지: 페이지네이션/정렬/카테고리 필터
    - [x] 라우트 및 페이지 구조 (`app/products/page.tsx`)
    - [x] URL 쿼리 파라미터 관리 (category, page, sort, limit) - 기본 구조 완료
    - [ ] 서버 사이드 페이지네이션 쿼리 함수 작성 (`lib/supabase/queries/products.ts`)
      - `getProductsWithPagination(category, page, limit, sortBy)` 함수 추가
      - 정렬 옵션: 최신순(created_at), 가격순(price), 판매량순(sales_count)
      - 카테고리 필터링 지원
      - 총 상품 수(count) 반환
    - [ ] 정렬 UI 컴포넌트 (`components/product-sort.tsx`)
      - 드롭다운 또는 버튼 그룹으로 정렬 옵션 제공
      - 정렬 옵션: 최신순, 가격 낮은순, 가격 높은순, 인기순
    - [ ] 페이지네이션 컴포넌트 (`components/product-pagination.tsx`)
      - 이전/다음 버튼
      - 페이지 번호 표시 (현재 페이지 중심)
      - 총 페이지 수 계산 및 표시
    - [ ] 상품 목록 페이지 UI 구성
      - CategoryFilter 컴포넌트 재사용
      - ProductSort 컴포넌트 배치
      - ProductList 또는 새로운 ProductGrid 컴포넌트로 상품 표시
      - ProductPagination 컴포넌트 하단 배치
    - [ ] 로딩/에러/빈 상태 처리
      - 로딩 스켈레톤 UI
      - 에러 메시지 표시
      - 검색 결과 없음 상태 메시지
  - [ ] 상품 상세 페이지: 재고/가격/설명 표시
  - [ ] 어드민 상품 등록은 대시보드에서 수기 관리(문서화만)

- [ ] Phase 3: 장바구니 & 주문
  - [ ] 장바구니 담기/삭제/수량 변경 (`cart_items` 연동)
  - [ ] 주문 생성 흐름(주소/메모 입력 포함)
  - [ ] 주문테이블 저장(`orders`, `order_items`) 및 합계 검증

- [ ] Phase 4: 결제 통합 (Toss Payments 테스트 모드)
  - [ ] 결제위젯 연동 및 클라이언트 플로우 구축
  - [ ] 결제 성공/실패 콜백 처리
  - [ ] 결제 완료 후 주문 상태 업데이트(`orders.status`)

- [ ] Phase 5: 마이페이지
  - [ ] 주문 내역 목록 조회 (사용자별 `orders`)
  - [ ] 주문 상세 보기 (`order_items` 포함)

- [ ] Phase 6: 테스트 & 배포
  - [ ] 전체 사용자 플로우 E2E 점검
  - [ ] 주요 버그 수정 및 예외처리 강화
  - [ ] Vercel 배포 설정 및 환경변수 구성

- [ ] 공통 작업 & 문서화
  - [ ] 오류/로딩/비어있는 상태 UI 정비
  - [ ] 타입 안전성 강화 (Zod + react-hook-form 적용 구간)
  - [ ] README/PRD 반영, 운영 가이드 업데이트
  - [ ] 접근성/반응형/다크모드 점검

- [ ] 환경/리포지토리 기초 세팅
  - [ ] `.gitignore` / `.cursorignore` 정비
  - [ ] `eslint.config.mjs` / 포맷터 설정 확정
  - [ ] 아이콘/OG 이미지/파비콘 추가 (`public/`)
  - [ ] SEO 관련 파일 (`robots.ts`, `sitemap.ts`, `manifest.ts`)
