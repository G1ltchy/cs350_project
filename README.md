# Nupjuk Guide

KAIST 캠퍼스 가이드 애플리케이션 — 지도 기반으로 건물, 식당, 버스, 이벤트 등 캠퍼스 정보를 제공합니다.

## 프로젝트 구조

```
cs350_project/
├── nupjuk-backend/   # REST API 서버 (Node.js + Express + MongoDB)
└── SRS.pdf           # Software Requirements Specification v1.0
```

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (jsonwebtoken) + bcrypt (salt+pepper)
- **Validation**: Zod
- **File Upload**: multer

## 시작하기

```bash
cd nupjuk-backend
npm install
cp .env.example .env   # .env 값 채우기
npm run dev
```

## 환경 변수 (.env)

| 변수 | 설명 |
|------|------|
| `PORT` | 서버 포트 (기본: 3000) |
| `MONGODB_URI` | MongoDB 연결 URI |
| `JWT_SECRET` | JWT 서명 시크릿 |
| `PASSWORD_PEPPER` | 비밀번호 해싱용 pepper |
| `BASE_URL` | 이미지 URL 생성용 서버 주소 (예: `https://api.example.com`) |

## API 엔드포인트

### Public (인증 불필요)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/markers` | 마커 목록 (`?category=dining&query=카이마루`) |
| GET | `/api/markers/:id` | 마커 상세 + 자식 마커 |
| GET | `/api/markers/:id/dynamic` | 동적 정보 (bus / dining / event) |

### Auth

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 로그인 → JWT 반환 |
| POST | `/api/auth/register-request` | 매니저 가입 요청 |
| POST | `/api/auth/forgot-password-request` | 비밀번호 재설정 요청 |

### Manager (JWT 필요)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/markers` | 전체 마커 목록 (`?category=&status=&ownership=mine&query=`) |
| GET | `/api/admin/markers/:id` | 마커 상세 |
| POST | `/api/admin/markers` | 마커 생성 |
| PUT | `/api/admin/markers/:id` | 마커 수정 (본인 마커만) |
| DELETE | `/api/admin/markers/:id` | 마커 삭제 (본인 마커만) |
| POST | `/api/admin/upload/image` | 이미지 업로드 → URL 반환 |

### Admin (JWT + role: admin 필요)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/admin/managers` | 매니저 목록 (`?status=pending`) |
| PUT | `/api/admin/managers/:id/approve` | 매니저 승인 |
| PUT | `/api/admin/managers/:id/reject` | 매니저 거절 |
| GET | `/api/admin/managers/password-reset-requests` | 비밀번호 재설정 요청 목록 |
| PUT | `/api/admin/managers/password-reset-requests/:id/resolve` | 요청 처리 완료 |

## 유저 역할

| 역할 | 설명 |
|------|------|
| General User | 로그인 없이 지도/마커 조회만 가능 |
| Manager | KAIST 이메일로 가입 요청 → 관리자 승인 후 마커 CRUD 가능 |
| Admin | 매니저 계정 승인/거절, 비밀번호 재설정 요청 처리 |
