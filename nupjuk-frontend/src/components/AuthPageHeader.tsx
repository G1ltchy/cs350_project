import { useLanguage } from "../context/LanguageContext";
import { getUi } from "../i18n/ui";

interface AuthPageHeaderProps {
  title?: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
}

export default function AuthPageHeader({
  title,
  subtitle,
  backLabel,
  onBack
}: AuthPageHeaderProps) {
  const { language, toggleLanguage } = useLanguage();
  const t = getUi(language);

  return (
    <header style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          marginBottom: 18
        }}
      >
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "8px 12px",
              background: "#f3f4f6",
              color: "#374151",
              cursor: "pointer",
              fontWeight: 700
            }}
          >
            ← {backLabel ?? "Back"}
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={toggleLanguage}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "8px 12px",
            background: "#111827",
            color: "#ffffff",
            cursor: "pointer",
            fontWeight: 700
          }}
        >
          {t.common.language}: {language.toUpperCase()}
        </button>
      </div>

      {title && (
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 900,
            color: "#111827"
          }}
        >
          {title}
        </h1>
      )}

      {subtitle && (
        <p
          style={{
            margin: "8px 0 0",
            color: "#6b7280",
            lineHeight: 1.5
          }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}