import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Manager } from "../models/Manager";
import { PasswordResetRequest } from "../models/PasswordResetRequest";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const registerSchema = z.object({
  username: z.string().min(1).trim(),
  email: z.string().email().trim(),
  password: z.string().min(8),
  message: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  message: z.string().optional(),
});

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "ID 또는 비밀번호가 올바르지 않습니다." });
    return;
  }

  const { username, password } = parsed.data;
  const GENERIC_ERROR = "ID 또는 비밀번호가 올바르지 않습니다.";

  const manager = await Manager.findOne({ username });
  if (!manager || manager.status !== "approved") {
    res.status(401).json({ message: GENERIC_ERROR });
    return;
  }

  const valid = await manager.comparePassword(password);
  if (!valid) {
    res.status(401).json({ message: GENERIC_ERROR });
    return;
  }

  const secret = process.env.JWT_SECRET!;
  const token = jwt.sign(
    { id: manager._id.toString(), username: manager.username, role: manager.role },
    secret,
    { expiresIn: "7d" }
  );

  res.json({ token });
}

export async function registerRequest(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "입력값이 올바르지 않습니다.", errors: parsed.error.flatten() });
    return;
  }

  const { username, email, password, message } = parsed.data;

  if (!email.endsWith("@kaist.ac.kr")) {
    res.status(400).json({ message: "KAIST 이메일(@kaist.ac.kr)만 가입할 수 있습니다." });
    return;
  }

  const existing = await Manager.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    const field = existing.username === username ? "username" : "email";
    res.status(409).json({ message: `이미 사용 중인 ${field}입니다.` });
    return;
  }

  const pepper = process.env.PASSWORD_PEPPER ?? "";
  const passwordHash = await bcrypt.hash(pepper + password, 12);

  await Manager.create({ username, email, passwordHash, message, status: "pending" });

  res.status(201).json({ message: "가입 요청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다." });
}

export async function forgotPasswordRequest(req: Request, res: Response): Promise<void> {
  const ALWAYS_OK = { message: "요청이 접수되었습니다. 관리자가 확인 후 연락드립니다." };

  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(200).json(ALWAYS_OK);
    return;
  }

  const { username, email, message } = parsed.data;

  const manager = await Manager.findOne({ username, email });
  if (manager) {
    await PasswordResetRequest.create({ managerId: manager._id, message });
  }

  res.status(200).json(ALWAYS_OK);
}
