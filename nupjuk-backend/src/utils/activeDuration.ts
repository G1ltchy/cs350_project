/**
 * 현재 시각 기준으로 active한 마커만 반환하는 MongoDB 쿼리 조건
 * - activeFrom, activeUntil 둘 다 없으면 항상 노출
 * - activeFrom만 있으면 그 이후부터 노출
 * - activeUntil만 있으면 그 이전까지 노출
 */
export function buildActiveDurationFilter() {
  const now = new Date();
  return {
    $and: [
      {
        $or: [
          { activeFrom: { $exists: false } },
          { activeFrom: null },
          { activeFrom: { $lte: now } },
        ],
      },
      {
        $or: [
          { activeUntil: { $exists: false } },
          { activeUntil: null },
          { activeUntil: { $gte: now } },
        ],
      },
    ],
  };
}
