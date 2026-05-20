import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";
import { startMarkerExpiryJob } from "./utils/markerExpiryJob";

const PORT = process.env.PORT || 3000;

async function main() {
  await connectDB();
  startMarkerExpiryJob();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch(console.error);
