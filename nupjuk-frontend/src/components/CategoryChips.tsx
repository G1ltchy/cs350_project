import type { MarkerCategory } from "../types/marker";

type CategoryValue = MarkerCategory | "all";

interface CategoryOption {
  label: string;
  value: CategoryValue;
}

const categoryOptions: CategoryOption[] = [
  { label: "전체", value: "all" },
  { label: "식당", value: "dining" },
  { label: "버스", value: "bus" },
  { label: "건물", value: "building" },
  { label: "행사", value: "event" },
  { label: "시설", value: "facility" },
  { label: "카페", value: "cafe" },
  { label: "도서관", value: "library" }
];

interface CategoryChipsProps {
  selected: CategoryValue;
  onSelect: (category: CategoryValue) => void;
}

export default function CategoryChips({
  selected,
  onSelect
}: CategoryChipsProps) {
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