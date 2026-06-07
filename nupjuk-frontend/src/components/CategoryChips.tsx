import { useMemo } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getUi } from "../i18n/ui";
import type { MarkerCategory } from "../types/marker";

type CategoryValue = MarkerCategory | "all";

const CATEGORY_CHIP_ORDER: CategoryValue[] = [
  "all",
  "dining",
  "bus",
  "building",
  "event",
  "facility",
  "cafe",
  "library",
  "etc"
];

interface CategoryChipsProps {
  selected: CategoryValue;
  onSelect: (category: CategoryValue) => void;
}

export default function CategoryChips({
  selected,
  onSelect
}: CategoryChipsProps) {
  const { language } = useLanguage();
  const ui = getUi(language);

  const categoryOptions = useMemo(
    () =>
      CATEGORY_CHIP_ORDER.map((value) => ({
        value,
        label:
          value === "all"
            ? ui.categories.all
            : ui.categories[value as MarkerCategory]
      })),
    [language, ui.categories]
  );

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginTop: 8,
        overflowX: "auto",
        paddingBottom: 4
      }}
    >
      {categoryOptions.map((option) => {
        const isSelected = selected === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: isSelected ? "#111827" : "#ffffff",
              color: isSelected ? "#ffffff" : "#111827",
              whiteSpace: "nowrap",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)"
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
