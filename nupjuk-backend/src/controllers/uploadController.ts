import { Request, Response } from "express";

/**
 * POST /api/admin/upload/image
 * 이미지 파일 업로드 → 접근 가능한 URL 반환
 */
export function uploadImage(req: Request, res: Response): void {
  if (!req.file) {
    res.status(400).json({ message: "이미지 파일이 없습니다." });
    return;
  }

  const baseUrl = process.env.BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

  res.status(201).json({ imageUrl });
}
