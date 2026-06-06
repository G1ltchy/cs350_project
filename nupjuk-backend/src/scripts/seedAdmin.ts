import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Manager } from "../models/Manager";
import { connectDB } from "../config/db";

const ADMIN_USERNAME = "admin";
const ADMIN_EMAIL = "admin@kaist.ac.kr";
const ADMIN_PASSWORD = "admin1234!";

async function seedAdmin() {
  await connectDB();

  const existing = await Manager.findOne({ username: ADMIN_USERNAME });
  if (existing) {
    console.log(`[Seed] '${ADMIN_USERNAME}' 계정이 이미 존재합니다.`);
    await mongoose.disconnect();
    return;
  }

  const pepper = process.env.PASSWORD_PEPPER ?? "";
  const passwordHash = await bcrypt.hash(pepper + ADMIN_PASSWORD, 12);

  await Manager.create({
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    passwordHash,
    status: "approved",
    role: "admin",
  });

  console.log(`[Seed] Admin 계정 생성 완료`);
  console.log(`  ID: ${ADMIN_USERNAME}`);
  console.log(`  PW: ${ADMIN_PASSWORD}`);
  console.log(`  ⚠️  로그인 후 반드시 비밀번호를 변경하세요.`);

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error("[Seed] 실패:", err);
  process.exit(1);
});
