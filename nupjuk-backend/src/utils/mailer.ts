import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@nupjuk.kaist.ac.kr";

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[Mailer] SMTP 설정이 없어 이메일을 보내지 않습니다.");
    console.warn(`  To: ${to} | Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({ from: FROM, to, subject, html });
}

export async function sendApprovalEmail(email: string, username: string): Promise<void> {
  await sendMail(
    email,
    "[Nupjuk Guide] 계정이 승인되었습니다",
    `
    <h2>안녕하세요, ${username}님</h2>
    <p>Nupjuk Guide 매니저 계정이 <strong>승인</strong>되었습니다.</p>
    <p>이제 로그인하여 마커를 관리할 수 있습니다.</p>
    <br/>
    <p>— Nupjuk Guide 팀</p>
    `
  );
}

export async function sendRejectionEmail(email: string, username: string): Promise<void> {
  await sendMail(
    email,
    "[Nupjuk Guide] 계정 요청이 거절되었습니다",
    `
    <h2>안녕하세요, ${username}님</h2>
    <p>Nupjuk Guide 매니저 계정 요청이 <strong>거절</strong>되었습니다.</p>
    <p>문의 사항은 관리자에게 연락해주세요.</p>
    <br/>
    <p>— Nupjuk Guide 팀</p>
    `
  );
}

export async function sendPasswordResetEmail(email: string, username: string, tempPassword: string): Promise<void> {
  await sendMail(
    email,
    "[Nupjuk Guide] 임시 비밀번호가 발급되었습니다",
    `
    <h2>안녕하세요, ${username}님</h2>
    <p>비밀번호 재설정 요청이 처리되었습니다.</p>
    <p>임시 비밀번호: <strong style="font-size:18px; color:#d32f2f;">${tempPassword}</strong></p>
    <p>로그인 후 반드시 비밀번호를 변경해주세요.</p>
    <br/>
    <p>— Nupjuk Guide 팀</p>
    `
  );
}
