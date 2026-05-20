import { Request, Response } from "express";
import { Marker } from "../models/Marker";
import { buildActiveDurationFilter } from "../utils/activeDuration";

/**
 * GET /api/markers
 * 일반 유저용: active한 마커만 반환
 * Query: category, query(검색어), includeChildren
 */
export async function getMarkers(req: Request, res: Response): Promise<void> {
  try {
    const { category, query, includeChildren } = req.query;

    const filter: Record<string, unknown> = {
      status: "active",
      ...buildActiveDurationFilter(),
    };

    if (category) {
      filter.category = category;
    }

    // includeChildren=false(기본)면 parent marker만 반환
    if (includeChildren !== "true") {
      filter.parentId = null;
    }

    let markers = await Marker.find(filter)
      .select("titleKo titleEn parentId latitude longitude category imageUrl status dynamicType")
      .populate("parentId", "titleKo titleEn")
      .lean();

    // 검색어 필터링 (title 또는 parent title)
    if (query && typeof query === "string") {
      const q = query.toLowerCase();
      markers = markers.filter((m) => {
        const titleMatch = m.titleKo.toLowerCase().includes(q) ||
          (m.titleEn?.toLowerCase().includes(q) ?? false);
        const parent = m.parentId as { titleKo?: string; titleEn?: string } | null;
        const parentMatch = parent?.titleKo?.toLowerCase().includes(q) ||
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
 * GET /api/markers/:id
 * 마커 상세 (children 포함)
 */
export async function getMarkerById(req: Request, res: Response): Promise<void> {
  try {
    const marker = await Marker.findOne({
      _id: req.params.id,
      status: "active",
      ...buildActiveDurationFilter(),
    })
      .populate("parentId", "titleKo titleEn")
      .lean();

    if (!marker) {
      res.status(404).json({ message: "마커를 찾을 수 없습니다." });
      return;
    }

    // child markers 함께 로드
    const children = await Marker.find({
      parentId: marker._id,
      status: "active",
      ...buildActiveDurationFilter(),
    })
      .select("titleKo titleEn latitude longitude category imageUrl dynamicType")
      .lean();

    res.json({ ...marker, children });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
}
