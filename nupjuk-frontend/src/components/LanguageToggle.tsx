import { useLanguage } from "../context/LanguageContext";
import { getUi } from "../i18n/ui";
import type { Language } from "../lib/language";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const labels = getUi(language).languageToggle;

  const options: { value: Language; label: string }[] = [
    { value: "ko", label: labels.ko },
    { value: "en", label: labels.en }
  ];

  return (
    <div
      role="group"
      aria-label="Language"
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        borderRadius: 12,
        background: "#f3f4f6",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
      }}
    >
      {options.map((option) => {
        const isSelected = language === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLanguage(option.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: "none",
              background: isSelected ? "#111827" : "transparent",
              color: isSelected ? "#ffffff" : "#374151",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
