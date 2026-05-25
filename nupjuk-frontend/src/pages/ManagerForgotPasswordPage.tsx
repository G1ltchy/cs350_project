import axios from "axios";
import { FormEvent, useState } from "react";
import { forgotPasswordRequest } from "../api/auth";
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

type ManagerForgotPasswordPageProps = {
  onGoToLogin: () => void;
};

type FormStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function ManagerForgotPasswordPage({
  onGoToLogin
}: ManagerForgotPasswordPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail) {
      setStatus({
        kind: "error",
        message: "Manager ID와 Email을 입력해 주세요."
      });
      return;
    }

    setStatus({ kind: "loading" });

    try {
      const body = {
        username: trimmedUsername,
        email: trimmedEmail,
        ...(message.trim() ? { message: message.trim() } : {})
      };

      const data = await forgotPasswordRequest(body);
      setStatus({ kind: "success", message: data.message });
      setUsername("");
      setEmail("");
      setMessage("");
    } catch (error) {
      let messageText = "요청 전송에 실패했습니다.";

      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string } | undefined;
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

        <h1 style={authTitleStyle}>Forgot Password?</h1>

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

          <label style={{ ...authLabelStyle, marginTop: 18 }}>
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="관리자에게 전달할 메모"
            style={authTextareaStyle}
          />

          <button
            type="submit"
            disabled={status.kind === "loading"}
            style={{
              ...authActionButtonStyle,
              width: "100%",
              marginTop: 22,
              background: "#ef4444",
              opacity: status.kind === "loading" ? 0.7 : 1
            }}
          >
            {status.kind === "loading" ? "요청 중..." : "Forgot Password?"}
          </button>

          <button
            type="button"
            onClick={onGoToLogin}
            style={{
              ...authActionButtonStyle,
              width: "100%",
              marginTop: 12,
              background: "#374151"
            }}
          >
            Log-In
          </button>
        </form>

        {status.kind !== "idle" && status.kind !== "loading" && (
          <div
            role="status"
            style={authStatusBoxStyle(
              status.kind === "success" ? "success" : "error"
            )}
          >
            <strong>{status.kind === "success" ? "접수 완료" : "실패"}</strong>
            <div style={{ marginTop: 4 }}>{status.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
