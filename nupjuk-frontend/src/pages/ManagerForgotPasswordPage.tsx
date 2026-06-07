import axios from "axios";
import { FormEvent, useState } from "react";
import { forgotPasswordRequest } from "../api/auth";
import AuthPageHeader from "../components/AuthPageHeader";
import { useLanguage } from "../context/LanguageContext";
import { getUi } from "../i18n/ui";
import {
  authActionButtonStyle,
  authContainerStyle,
  authInputStyle,
  authLabelStyle,
  authPageStyle,
  authStatusBoxStyle,
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
  const { language } = useLanguage();
  const ui = getUi(language);
  const m = ui.manager;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail) {
      setStatus({ kind: "error", message: m.errors.forgotFields });
      return;
    }

    setStatus({ kind: "loading" });

    try {
      const data = await forgotPasswordRequest({
        username: trimmedUsername,
        email: trimmedEmail
      });

      setStatus({
        kind: "success",
        message: data.message
      });
      setUsername("");
      setEmail("");
    } catch (error) {
      let messageText: string = m.errors.forgotFailed;

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
        <AuthPageHeader backLabel={m.backToLogin} onBack={onGoToLogin} />

        <h1 style={authTitleStyle}>{m.forgotTitle}</h1>

        <form onSubmit={handleSubmit}>
          <label style={authLabelStyle}>{m.managerId}</label>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="ID"
            autoComplete="username"
            style={authInputStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 18 }}>{m.kaistEmail}</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={m.kaistEmailPlaceholder}
            autoComplete="email"
            style={authInputStyle}
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
            {status.kind === "loading" ? m.requesting : m.forgotPassword}
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
            {m.login}
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
              {status.kind === "success" ? m.received : ui.common.failure}
            </strong>
            <div style={{ marginTop: 4 }}>{status.message}</div>
            {status.kind === "success" && (
              <div style={{ marginTop: 8, fontWeight: 600 }}>
                {m.forgotTempPasswordStatus}: {m.forgotTempPasswordAssignedYes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
