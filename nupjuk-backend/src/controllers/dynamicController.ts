import { Request, Response } from "express";
import { Marker } from "../models/Marker";
import { buildActiveDurationFilter } from "../utils/activeDuration";

/**
 * GET /api/markers/:id/dynamic
 * 카테고리별 동적 정보 반환
 *
 * - bus:    externalUrl이 있으면 함께 반환 (클라이언트가 외부 API 직접 호출하거나 표시용)
 * - dining: externalUrl이 있으면 함께 반환
 * - event:  activeUntil 기준 남은 시간(초) 계산
 * - 기타:   동적 정보 없음
 */
export async function getDynamicInfo(req: Request, res: Response): Promise<void> {
  const marker = await Marker.findOne({
    _id: req.params.id,
    status: "active",
    ...buildActiveDurationFilter(),
  }).lean();

  if (!marker) {
    res.status(404).json({ message: "마커를 찾을 수 없습니다." });
    return;
  }

  switch (marker.dynamicType) {
    case "bus": {
      res.json({
        type: "bus",
        externalUrl: marker.externalUrl ?? null,
      });
      break;
    }

    case "dining": {
      res.json({
        type: "dining",
        externalUrl: marker.externalUrl ?? null,
      });
      break;
    }

    case "event": {
      if (!marker.activeUntil) {
        res.json({ type: "event", remainingSeconds: null });
        break;
      }
      const remainingSeconds = Math.max(
        0,
        Math.floor((marker.activeUntil.getTime() - Date.now()) / 1000)
      );
      res.json({
        type: "event",
        activeUntil: marker.activeUntil,
        remainingSeconds,
      });
      break;
    }

    default: {
      res.json({ type: "none" });
    }
  }
}
