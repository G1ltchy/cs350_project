import axios from "axios";
import { FormEvent, useState } from "react";
import { registerRequest } from "../api/auth";
import {
  authActionButtonStyle,
  authBackButtonStyle,
  authContainerStyle,
  authInputStyle,
  authLabelStyle,
  authPageStyle,
  authStatusBoxStyle,
  authTextareaStyle,
  authTitleStyle
} from "./authFormStyles";

type ManagerRegisterPageProps = {
  onGoToLogin: () => void;
};

type FormStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function ManagerRegisterPage({
  onGoToLogin
}: ManagerRegisterPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail || !password) {
      setStatus({
        kind: "error",
        message: "Manager ID, Email, Password를 모두 입력해 주세요."
      });
      return;
    }

    if (password.length < 8) {
      setStatus({
        kind: "error",
        message: "Password는 8자 이상이어야 합니다."
      });
      return;
    }

    if (!trimmedEmail.endsWith("@kaist.ac.kr")) {
      setStatus({
        kind: "error",
        message: "KAIST 이메일(@kaist.ac.kr)만 가입할 수 있습니다."
      });
      return;
    }

    setStatus({ kind: "loading" });

    try {
      const body = {
        username: trimmedUsername,
        email: trimmedEmail,
        password,
        ...(message.trim() ? { message: message.trim() } : {})
      };

      const data = await registerRequest(body);
      setStatus({ kind: "success", message: data.message });
      setUsername("");
      setEmail("");
      setPassword("");
      setMessage("");
    } catch (error) {
      let messageText = "가입 요청에 실패했습니다.";

      if (axios.isAxiosError(error)) {
        const data = error.response?.data as
          | { message?: string; errors?: unknown }
          | undefined;
        messageText = data?.message ?? messageText;
      }

      setStatus({ kind: "error", message: messageText });
    }
  }

  return (
    <div style={authPageStyle}>
      <div style={authContainerStyle}>
        <button
          type="button"
          onClick={onGoToLogin}
          style={authBackButtonStyle}
        >
          ← Log-In으로 돌아가기
        </button>

        <h1 style={authTitleStyle}>Manager Register</h1>

        <form onSubmit={handleSubmit}>
          <label style={authLabelStyle}>Manager ID</label>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="ID"
            autoComplete="username"
            style={authInputStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 18 }}>KAIST Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@kaist.ac.kr"
            autoComplete="email"
            style={authInputStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 18 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8 characters or more"
            autoComplete="new-password"
            style={authInputStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 18 }}>
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="관리자에게 전달할 메모"
            style={authTextareaStyle}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 22
            }}
          >
            <button
              type="submit"
              disabled={status.kind === "loading"}
              style={{
                ...authActionButtonStyle,
                background: "#22c55e",
                opacity: status.kind === "loading" ? 0.7 : 1
              }}
            >
              {status.kind === "loading" ? "요청 중..." : "Register"}
            </button>
            <button
              type="button"
              onClick={onGoToLogin}
              style={{
                ...authActionButtonStyle,
                background: "#374151"
              }}
            >
              Log-In
            </button>
          </div>
        </form>

        {status.kind !== "idle" && status.kind !== "loading" && (
          <div
            role="status"
            style={authStatusBoxStyle(
              status.kind === "success" ? "success" : "error"
            )}
          >
            <strong>{status.kind === "success" ? "성공" : "실패"}</strong>
            <div style={{ marginTop: 4 }}>{status.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
