# Nupjuk Guide

KAIST 캠퍼스 가이드 애플리케이션 — 지도 기반으로 건물, 식당, 버스, 이벤트 등 캠퍼스 정보를 통합 제공합니다.

> CS350 Team 4 — Seungwan Cho, Bosung Park, Jihun Park, Doyeol Oh

## 프로젝트 구조

```
cs350_project/
├── nupjuk-backend/    # REST API 서버 (Node.js + Express + MongoDB)
├── nupjuk-frontend/   # 유저용 웹 클라이언트 (React + Vite)
├── SRS.pdf            # Software Requirements Specification v1.0
└── README.md
```

## 기술 스택

| 구분 | 스택 |
|------|------|
| **Backend** | Node.js, Express, TypeScript (strict), MongoDB (Mongoose), Zod |
| **Auth** | JWT + bcrypt (salt & pepper) |
| **File Upload** | multer (로컬 저장, `/uploads` 정적 서빙) |
| **Email** | nodemailer (SMTP, 선택사항) |
| **Scheduler** | node-cron (만료 마커 자동 비활성화) |
| **Frontend** | React 19, Vite, TypeScript, Kakao Map API |

## 시작하기

### 1. Backend

```bash
cd nupjuk-backend
npm install
cp .env.example .env   # 아래 환경 변수 표 참고하여 값 채우기
npm run seed           # 초기 Admin 계정 + KAIST 마커 데이터 생성
npm run dev            # http://localhost:3000
```

### 2. Frontend

```bash
cd nupjuk-frontend
npm install
npm run dev            # http://localhost:5173
```

> 백엔드와 프론트엔드를 **각각 별도 터미널**에서 실행해야 합니다.

### 초기 Admin 계정

| 항목 | 값 |
|------|------|
| ID | `admin` |
| PW | `admin1234!` |

> `npm run seed`로 자동 생성됩니다. 로그인 후 비밀번호를 변경하세요.

## 환경 변수 (nupjuk-backend/.env)

| 변수 | 필수 | 설명 |
|------|------|------|
| `PORT` | - | 서버 포트 (기본: 3000) |
| `MONGODB_URI` | O | MongoDB 연결 URI |
| `JWT_SECRET` | O | JWT 서명 시크릿 |
| `PASSWORD_PEPPER` | O | 비밀번호 해싱용 pepper |
| `BASE_URL` | - | 이미지 URL prefix (기본: `http://localhost:3000`) |
| `SMTP_HOST` | - | 이메일 SMTP 호스트 (기본: `smtp.gmail.com`) |
| `SMTP_PORT` | - | SMTP 포트 (기본: `587`) |
| `SMTP_USER` | - | SMTP 계정 (없으면 이메일 미발송, 콘솔 로그만 출력) |
| `SMTP_PASS` | - | SMTP 비밀번호 / 앱 비밀번호 |
| `SMTP_FROM` | - | 발신자 표시 (기본: SMTP_USER) |

## API 엔드포인트

### Public (인증 불필요)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/health` | 서버 상태 확인 |
| GET | `/api/markers` | 마커 목록 (`?category=dining&query=카이마루&includeChildren=true`) |
| GET | `/api/markers/:id` | 마커 상세 + 자식 마커 |
| GET | `/api/markers/:id/dynamic` | 동적 정보 (bus / dining / event) |

### Auth

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 → JWT 반환 (7일 유효) |
| POST | `/api/auth/register-request` | 매니저 가입 요청 (@kaist.ac.kr만 허용) |
| POST | `/api/auth/forgot-password-request` | 비밀번호 재설정 요청 (항상 200 반환) |

### Manager (JWT 필요)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/markers` | 전체 마커 목록 (`?category=&status=&ownership=mine&query=`) |
| GET | `/api/admin/markers/:id` | 마커 상세 |
| POST | `/api/admin/markers` | 마커 생성 |
| PUT | `/api/admin/markers/:id` | 마커 수정 (본인 마커만) |
| DELETE | `/api/admin/markers/:id` | 마커 삭제 (본인 마커만) |
| POST | `/api/admin/upload/image` | 이미지 업로드 → URL 반환 (5MB, jpeg/png/webp/gif) |

### Admin (JWT + role: admin)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/managers` | 매니저 목록 (`?status=pending`) |
| PUT | `/api/admin/managers/:id/approve` | 매니저 승인 → 이메일 알림 |
| PUT | `/api/admin/managers/:id/reject` | 매니저 거절 → 이메일 알림 |
| GET | `/api/admin/managers/password-reset-requests` | 비밀번호 재설정 요청 목록 |
| PUT | `/api/admin/managers/password-reset-requests/:id/resolve` | 요청 처리 완료 → 이메일 알림 |

## 유저 역할

| 역할 | 설명 |
|------|------|
| **General User** | 로그인 없이 지도/마커 조회, 검색, 필터, 길찾기 |
| **Manager** | KAIST 이메일로 가입 요청 → Admin 승인 후 마커 CRUD |
| **Admin** | 매니저 계정 승인/거절, 비밀번호 재설정 처리, 시스템 관리 |

## npm scripts (backend)

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (hot reload) |
| `npm run build` | TypeScript → JavaScript 빌드 |
| `npm run start` | 빌드된 서버 실행 |
| `npm run seed` | Admin 계정 + 마커 시드 데이터 생성 |
| `npm run seed:admin` | Admin 계정만 생성 |
| `npm run seed:markers` | 마커 시드 데이터만 생성 (기존 마커 초기화) |

## 보안

- 비밀번호: bcrypt (rounds=12) + pepper
- 로그인 실패 시 구체적 이유 미노출 ("ID 또는 비밀번호가 올바르지 않습니다.")
- 비밀번호 찾기: 계정 존재 여부와 무관하게 항상 200 반환 (유저 열거 공격 방지)
- 회원가입: @kaist.ac.kr 도메인만 허용
- 마커 입력값: Markdown/텍스트 XSS sanitize 적용
- 마커 수정/삭제: 본인 마커만 가능 (Admin은 전체 가능)
