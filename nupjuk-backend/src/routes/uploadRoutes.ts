import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { upload } from "../utils/upload";
import { uploadImage } from "../controllers/uploadController";

const router = Router();

router.use(requireAuth);

router.post("/image", upload.single("image"), uploadImage);

export default router;
