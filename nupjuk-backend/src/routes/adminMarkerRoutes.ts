import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  adminGetMarkers,
  adminGetMarkerById,
  adminCreateMarker,
  adminUpdateMarker,
  adminDeleteMarker,
} from "../controllers/adminMarkerController";

const router = Router();

// 모든 admin 라우트는 인증 필요
router.use(requireAuth);

// GET  /api/admin/markers
router.get("/", adminGetMarkers);

// GET  /api/admin/markers/:id
router.get("/:id", adminGetMarkerById);

// POST /api/admin/markers
router.post("/", adminCreateMarker);

// PUT  /api/admin/markers/:id
router.put("/:id", adminUpdateMarker);

// DELETE /api/admin/markers/:id
router.delete("/:id", adminDeleteMarker);

export default router;
