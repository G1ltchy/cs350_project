import type { CSSProperties } from "react";

export const authPageStyle: CSSProperties = {
  width: "100vw",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffffff",
  padding: 24
};

export const authContainerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 420
};

export const authBackButtonStyle: CSSProperties = {
  marginBottom: 20,
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  cursor: "pointer",
  fontSize: 14
};

export const authTitleStyle: CSSProperties = {
  margin: "0 0 28px",
  textAlign: "center",
  fontSize: 32,
  fontWeight: 700,
  color: "#1f2937"
};

export const authLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontSize: 15,
  fontWeight: 600,
  color: "#111827"
};

export const authInputStyle: CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  border: "none",
  borderRadius: 14,
  background: "#f3f4f6",
  fontSize: 16,
  color: "#111827",
  outline: "none"
};

export const authTextareaStyle: CSSProperties = {
  ...authInputStyle,
  minHeight: 96,
  resize: "vertical"
};

export const authActionButtonStyle: CSSProperties = {
  padding: "14px 12px",
  border: "none",
  borderRadius: 14,
  color: "#ffffff",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer"
};

export const authStatusBoxStyle = (
  kind: "success" | "error"
): CSSProperties => ({
  marginTop: 20,
  padding: "12px 14px",
  borderRadius: 12,
  background: kind === "success" ? "#ecfdf5" : "#fef2f2",
  color: kind === "success" ? "#166534" : "#b91c1c",
  fontSize: 14,
  lineHeight: 1.5
});
