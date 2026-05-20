import { Router } from "express";
import { getMarkers, getMarkerById } from "../controllers/markerController";
import { getDynamicInfo } from "../controllers/dynamicController";

const router = Router();

router.get("/", getMarkers);
router.get("/:id", getMarkerById);
router.get("/:id/dynamic", getDynamicInfo);

export default router;
