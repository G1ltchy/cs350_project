import { Request, Response } from "express";
import { z } from "zod";
import { Manager } from "../models/Manager";
import { PasswordResetRequest } from "../models/PasswordResetRequest";

const rejectSchema = z.object({
  reason: z.string().optional(),
});

/**
 * GET /api/admin/managers
 * 매니저 목록 조회 (status 필터 지원)
 */
export async function listManagers(req: Request, res: Response): Promise<void> {
  const { status } = req.query;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const managers = await Manager.find(filter)
    .select("username email status role message createdAt")
    .sort({ createdAt: -1 })
    .lean();

  res.json(managers);
}

/**
 * PUT /api/admin/managers/:id/approve
 * 매니저 승인
 */
export async function approveManager(req: Request, res: Response): Promise<void> {
  const manager = await Manager.findById(req.params.id);
  if (!manager) {
    res.status(404).json({ message: "존재하지 않는 계정입니다." });
    return;
  }

  if (manager.status === "approved") {
    res.status(409).json({ message: "이미 승인된 계정입니다." });
    return;
  }

  manager.status = "approved";
  await manager.save();

  res.json({ message: `${manager.username} 계정이 승인되었습니다.` });
}

/**
 * PUT /api/admin/managers/:id/reject
 * 매니저 거절
 */
export async function rejectManager(req: Request, res: Response): Promise<void> {
  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "입력값 오류", errors: parsed.error.flatten() });
    return;
  }

  const manager = await Manager.findById(req.params.id);
  if (!manager) {
    res.status(404).json({ message: "존재하지 않는 계정입니다." });
    return;
  }

  if (manager.status === "approved") {
    res.status(409).json({ message: "이미 승인된 계정은 거절할 수 없습니다." });
    return;
  }

  manager.status = "rejected";
  await manager.save();

  res.json({ message: `${manager.username} 계정이 거절되었습니다.` });
}

/**
 * GET /api/admin/managers/password-reset-requests
 * 비밀번호 재설정 요청 목록
 */
export async function listPasswordResetRequests(req: Request, res: Response): Promise<void> {
  const { status } = req.query;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const requests = await PasswordResetRequest.find(filter)
    .populate("managerId", "username email")
    .sort({ createdAt: -1 })
    .lean();

  res.json(requests);
}

/**
 * PUT /api/admin/managers/password-reset-requests/:id/resolve
 * 비밀번호 재설정 요청 처리 완료
 */
export async function resolvePasswordResetRequest(req: Request, res: Response): Promise<void> {
  const request = await PasswordResetRequest.findById(req.params.id);
  if (!request) {
    res.status(404).json({ message: "존재하지 않는 요청입니다." });
    return;
  }

  if (request.status === "resolved") {
    res.status(409).json({ message: "이미 처리된 요청입니다." });
    return;
  }

  request.status = "resolved";
  await request.save();

  res.json({ message: "비밀번호 재설정 요청이 처리 완료되었습니다." });
}
