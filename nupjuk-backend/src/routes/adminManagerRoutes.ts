import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  listManagers,
  approveManager,
  rejectManager,
  listPasswordResetRequests,
  resolvePasswordResetRequest,
} from "../controllers/adminManagerController";

const router = Router();

router.use(requireAuth, requireAdmin);

// 비밀번호 재설정 요청 — /:id 보다 먼저 등록해야 라우팅 충돌 없음
router.get("/password-reset-requests", listPasswordResetRequests);
router.put("/password-reset-requests/:id/resolve", resolvePasswordResetRequest);

// 매니저 계정 관리
router.get("/", listManagers);
router.put("/:id/approve", approveManager);
router.put("/:id/reject", rejectManager);

export default router;
