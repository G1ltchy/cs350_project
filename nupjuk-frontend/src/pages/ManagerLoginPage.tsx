import axios from "axios";
import { FormEvent, useState } from "react";
import AuthPageHeader from "../components/AuthPageHeader";
import { useLanguage } from "../context/LanguageContext";
import { login } from "../api/auth";
import { getUi } from "../i18n/ui";
import { setAuthToken } from "../lib/authToken";
import {
  authActionButtonStyle,
  authContainerStyle,
  authInputStyle,
  authLabelStyle,
  authStatusBoxStyle,
  authTitleStyle
} from "./authFormStyles";

type ManagerLoginPageProps = {
  onGoToMap: () => void;
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
  onLoginSuccess: () => void;
};

type LoginStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function ManagerLoginPage({
  onGoToMap,
  onGoToRegister,
  onGoToForgotPassword,
  onLoginSuccess
}: ManagerLoginPageProps) {
  const { language } = useLanguage();
  const ui = getUi(language);
  const m = ui.manager;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<LoginStatus>({ kind: "idle" });

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setStatus({ kind: "error", message: m.errors.loginFields });
      return;
    }

    setStatus({ kind: "loading" });

    try {
      const token = await login(trimmedUsername, password);
      setAuthToken(token);
      onLoginSuccess();
    } catch (error) {
      let message: string = m.errors.loginFailed;

      if (axios.isAxiosError(error)) {
        message =
          (error.response?.data as { message?: string } | undefined)?.message ??
          message;
      }

      setStatus({ kind: "error", message });
    }
  }

  return (
    <div className="auth-page-content" style={authContainerStyle}>
      <AuthPageHeader backLabel={m.backToMap} onBack={onGoToMap} />

      <h1 style={authTitleStyle}>{m.loginTitle}</h1>

      <form onSubmit={handleLogin}>
        <label style={authLabelStyle}>{m.managerId}</label>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="ID"
          autoComplete="username"
          style={authInputStyle}
        />

        <label style={{ ...authLabelStyle, marginTop: 18 }}>
          {m.managerPassword}
        </label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={m.passwordPlaceholder}
          autoComplete="current-password"
          style={authInputStyle}
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
            {status.kind === "loading" ? m.loggingIn : m.login}
          </button>
          <button
            type="button"
            onClick={onGoToRegister}
            style={{
              ...authActionButtonStyle,
              background: "#374151"
            }}
          >
            {m.register}
          </button>
        </div>

        <button
          type="button"
          onClick={onGoToForgotPassword}
          style={{
            ...authActionButtonStyle,
            width: "100%",
            marginTop: 12,
            background: "#ef4444"
          }}
        >
          {m.forgotPassword}
        </button>
      </form>

      {status.kind !== "idle" && status.kind !== "loading" && (
        <div
          role="status"
          style={authStatusBoxStyle(
            status.kind === "success" ? "success" : "error"
          )}
        >
          <strong>
            {status.kind === "success" ? ui.common.success : ui.common.failure}
          </strong>
          <div style={{ marginTop: 4 }}>{status.message}</div>
        </div>
      )}
    </div>
  );
}
