import axios from "axios";
import { type CSSProperties, FormEvent, useState } from "react";
import { login } from "../api/auth";

type ManagerLoginPageProps = {
  onGoToMap: () => void;
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
};

type LoginStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function ManagerLoginPage({
  onGoToMap,
  onGoToRegister,
  onGoToForgotPassword
}: ManagerLoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<LoginStatus>({ kind: "idle" });

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setStatus({
        kind: "error",
        message: "Manager ID와 Password를 입력해 주세요."
      });
      return;
    }

    setStatus({ kind: "loading" });

    try {
      const token = await login(trimmedUsername, password);
      localStorage.setItem("token", token);
      setStatus({
        kind: "success",
        message: "로그인에 성공했습니다. 토큰이 저장되었습니다."
      });
    } catch (error) {
      let message = "로그인에 실패했습니다.";

      if (axios.isAxiosError(error)) {
        message =
          (error.response?.data as { message?: string } | undefined)?.message ??
          message;
      }

      setStatus({ kind: "error", message });
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        padding: 24
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <button
          type="button"
          onClick={onGoToMap}
          style={{
            marginBottom: 20,
            padding: "8px 14px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            color: "#374151",
            cursor: "pointer",
            fontSize: 14
          }}
        >
          ← 지도로 이동
        </button>

        <h1
          style={{
            margin: "0 0 28px",
            textAlign: "center",
            fontSize: 32,
            fontWeight: 700,
            color: "#1f2937"
          }}
        >
          Manager Log-In
        </h1>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontSize: 15,
              fontWeight: 600,
              color: "#111827"
            }}
          >
            Manager ID
          </label>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="ID"
            autoComplete="username"
            style={inputStyle}
          />

          <label
            style={{
              display: "block",
              margin: "18px 0 8px",
              fontSize: 15,
              fontWeight: 600,
              color: "#111827"
            }}
          >
            Manager Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            style={inputStyle}
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
                ...actionButtonStyle,
                background: "#22c55e",
                opacity: status.kind === "loading" ? 0.7 : 1
              }}
            >
              {status.kind === "loading" ? "로그인 중..." : "Log-In"}
            </button>
            <button
              type="button"
              onClick={onGoToRegister}
              style={{
                ...actionButtonStyle,
                background: "#374151"
              }}
            >
              Register
            </button>
          </div>

          <button
            type="button"
            onClick={onGoToForgotPassword}
            style={{
              ...actionButtonStyle,
              width: "100%",
              marginTop: 12,
              background: "#ef4444"
            }}
          >
            Forgot Password?
          </button>
        </form>

        {status.kind !== "idle" && status.kind !== "loading" && (
          <div
            role="status"
            style={{
              marginTop: 20,
              padding: "12px 14px",
              borderRadius: 12,
              background: status.kind === "success" ? "#ecfdf5" : "#fef2f2",
              color: status.kind === "success" ? "#166534" : "#b91c1c",
              fontSize: 14,
              lineHeight: 1.5
            }}
          >
            <strong>
              {status.kind === "success" ? "성공" : "실패"}
            </strong>
            <div style={{ marginTop: 4 }}>{status.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  border: "none",
  borderRadius: 14,
  background: "#f3f4f6",
  fontSize: 16,
  color: "#111827",
  outline: "none"
};

const actionButtonStyle: CSSProperties = {
  padding: "14px 12px",
  border: "none",
  borderRadius: 14,
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer"
};
