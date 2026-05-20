import cron from "node-cron";
import { Marker } from "../models/Marker";

// 매 5분마다 activeUntil이 지난 active 마커를 inactive로 전환
export function startMarkerExpiryJob(): void {
  cron.schedule("*/5 * * * *", async () => {
    const result = await Marker.updateMany(
      { status: "active", activeUntil: { $lt: new Date() } },
      { $set: { status: "inactive" } }
    );

    if (result.modifiedCount > 0) {
      console.log(`[MarkerExpiryJob] ${result.modifiedCount}개 마커를 inactive 처리`);
    }
  });
}
