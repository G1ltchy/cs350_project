import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Marker } from "../models/Marker";
import { sanitizeMarkdown, sanitizeText } from "../utils/sanitize";

// 입력 검증 스키마
const createMarkerSchema = z.object({
  titleKo: z.string().min(1, "제목은 필수입니다."),
  titleEn: z.string().optional(),
  parentId: z.string().nullable().optional(),
  latitude: z.number(),
  longitude: z.number(),
  category: z.enum(["building", "facility", "dining", "bus", "event", "cafe", "library", "etc"]),
  markdownKo: z.string().min(1, "내용은 필수입니다."),
  markdownEn: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  activeFrom: z.string().datetime().optional(),
  activeUntil: z.string().datetime().optional(),
  dynamicType: z.enum(["none", "dining", "bus", "event"]).optional(),
  externalUrl: z.string().url().optional().or(z.literal("")),
});

const updateMarkerSchema = createMarkerSchema.partial();

/**
 * GET /api/admin/markers
 * Manager용: 모든 마커 반환 (inactive 포함)
 */
export async function adminGetMarkers(req: Request, res: Response): Promise<void> {
  try {
    const { category, status, ownership, query } = req.query;
    const managerId = req.user!.id;

    const filter: Record<string, unknown> = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (ownership === "mine") filter.createdBy = managerId;

    let markers = await Marker.find(filter)
      .populate("parentId", "titleKo titleEn")
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .lean();

    if (query && typeof query === "string") {
      const q = query.toLowerCase();
      markers = markers.filter((m) => {
        const titleMatch =
          m.titleKo.toLowerCase().includes(q) ||
          (m.titleEn?.toLowerCase().includes(q) ?? false);
        const parent = m.parentId as { titleKo?: string; titleEn?: string } | null;
        const parentMatch =
          parent?.titleKo?.toLowerCase().includes(q) ||
          (parent?.titleEn?.toLowerCase().includes(q) ?? false);
        return titleMatch || parentMatch;
      });
    }

    res.json(markers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
}

/**
 * GET /api/admin/markers/:id
 * 마커 상세
 */
export async function adminGetMarkerById(req: Request, res: Response): Promise<void> {
  try {
    const marker = await Marker.findById(req.params.id)
      .populate("parentId", "titleKo titleEn")
      .populate("createdBy", "username")
      .lean();

    if (!marker) {
      res.status(404).json({ message: "마커를 찾을 수 없습니다." });
      return;
    }

    const children = await Marker.find({ parentId: marker._id })
      .select("titleKo titleEn latitude longitude category status")
      .lean();

    res.json({ ...marker, children });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
}

/**
 * POST /api/admin/markers
 * 마커 생성
 */
export async function adminCreateMarker(req: Request, res: Response): Promise<void> {
  try {
    const parsed = createMarkerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "입력값 오류", errors: parsed.error.flatten() });
      return;
    }

    const data = parsed.data;
    const managerId = req.user!.id;

    const marker = await Marker.create({
      ...data,
      titleKo: sanitizeText(data.titleKo),
      titleEn: data.titleEn ? sanitizeText(data.titleEn) : undefined,
      markdownKo: sanitizeMarkdown(data.markdownKo),
      markdownEn: data.markdownEn ? sanitizeMarkdown(data.markdownEn) : undefined,
      parentId: data.parentId ? new mongoose.Types.ObjectId(data.parentId) : null,
      createdBy: new mongoose.Types.ObjectId(managerId),
      activeFrom: data.activeFrom ? new Date(data.activeFrom) : undefined,
      activeUntil: data.activeUntil ? new Date(data.activeUntil) : undefined,
    });

    res.status(201).json(marker);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
}

/**
 * PUT /api/admin/markers/:id
 * 마커 수정 (자기 것만)
 */
export async function adminUpdateMarker(req: Request, res: Response): Promise<void> {
  try {
    const marker = await Marker.findById(req.params.id);
    if (!marker) {
      res.status(404).json({ message: "마커를 찾을 수 없습니다." });
      return;
    }

    // 권한 체크: 자기 마커만 수정 가능
    if (marker.createdBy.toString() !== req.user!.id && req.user!.role !== "admin") {
      res.status(403).json({ message: "자신이 만든 마커만 수정할 수 있습니다." });
      return;
    }

    const parsed = updateMarkerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "입력값 오류", errors: parsed.error.flatten() });
      return;
    }

    const data = parsed.data;

    if (data.activeUntil && new Date(data.activeUntil) < new Date()) {
      (data as Record<string, unknown>).status = "inactive";
    }

    const updated = await Marker.findByIdAndUpdate(
      req.params.id,
      {
        ...data,
        ...(data.titleKo !== undefined && { titleKo: sanitizeText(data.titleKo) }),
        ...(data.titleEn !== undefined && { titleEn: sanitizeText(data.titleEn) }),
        ...(data.markdownKo !== undefined && { markdownKo: sanitizeMarkdown(data.markdownKo) }),
        ...(data.markdownEn !== undefined && { markdownEn: sanitizeMarkdown(data.markdownEn) }),
        parentId: data.parentId !== undefined
          ? (data.parentId ? new mongoose.Types.ObjectId(data.parentId) : null)
          : undefined,
        activeFrom: data.activeFrom ? new Date(data.activeFrom) : undefined,
        activeUntil: data.activeUntil ? new Date(data.activeUntil) : undefined,
      },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
}

/**
 * DELETE /api/admin/markers/:id
 * 마커 삭제 (자기 것만)
 */
export async function adminDeleteMarker(req: Request, res: Response): Promise<void> {
  try {
    const marker = await Marker.findById(req.params.id);
    if (!marker) {
      res.status(404).json({ message: "마커를 찾을 수 없습니다." });
      return;
    }

    // 권한 체크
    if (marker.createdBy.toString() !== req.user!.id && req.user!.role !== "admin") {
      res.status(403).json({ message: "자신이 만든 마커만 삭제할 수 있습니다." });
      return;
    }

    // 이 마커가 parent인 child marker들도 처리
    // SRS상 삭제 시 child는 root로 올라가도록 처리
    await Marker.updateMany(
      { parentId: marker._id },
      { $set: { parentId: null } }
    );

    await marker.deleteOne();

    res.json({ message: "마커가 삭제되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
}
