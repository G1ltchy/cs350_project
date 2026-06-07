import axios from "axios";
import { FormEvent, useState } from "react";
import { registerRequest } from "../api/auth";
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
  const { language } = useLanguage();
  const ui = getUi(language);
  const m = ui.manager;

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
      setStatus({ kind: "error", message: m.errors.registerFields });
      return;
    }

    if (password.length < 8) {
      setStatus({ kind: "error", message: m.errors.registerPassword });
      return;
    }

    if (!trimmedEmail.endsWith("@kaist.ac.kr")) {
      setStatus({ kind: "error", message: m.errors.registerEmail });
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
      let messageText: string = m.errors.registerFailed;

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
        <AuthPageHeader backLabel={m.backToLogin} onBack={onGoToLogin} />

        <h1 style={authTitleStyle}>{m.registerTitle}</h1>

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
            placeholder="name@kaist.ac.kr"
            autoComplete="email"
            style={authInputStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 18 }}>{m.password}</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="8 characters or more"
            autoComplete="new-password"
            style={authInputStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 18 }}>
            {m.messageOptional}
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={m.messageOptionalPlaceholder}
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
              {status.kind === "loading" ? m.requesting : m.register}
            </button>
            <button
              type="button"
              onClick={onGoToLogin}
              style={{
                ...authActionButtonStyle,
                background: "#374151"
              }}
            >
              {m.login}
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
            <strong>
              {status.kind === "success" ? ui.common.success : ui.common.failure}
            </strong>
            <div style={{ marginTop: 4 }}>{status.message}</div>
          </div>
        )}
      </div>
    </div>
  );
}
