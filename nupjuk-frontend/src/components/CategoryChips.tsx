import { useMemo, useRef, useState } from "react";
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
  mobileLayout?: boolean;
}

export default function CategoryChips({
  selected,
  onSelect,
  mobileLayout = false
}: CategoryChipsProps) {
  const { language } = useLanguage();
  const ui = getUi(language);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const movedRef = useRef(false);

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

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!mobileLayout || !rowRef.current) {
      return;
    }

    setIsDragging(true);
    movedRef.current = false;
    startXRef.current = event.clientX;
    startScrollLeftRef.current = rowRef.current.scrollLeft;
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!mobileLayout || !isDragging || !rowRef.current) {
      return;
    }

    const deltaX = event.clientX - startXRef.current;

    if (Math.abs(deltaX) > 6) {
      movedRef.current = true;
    }

    rowRef.current.scrollLeft = startScrollLeftRef.current - deltaX;
  }

  function stopDragging() {
    setIsDragging(false);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (!mobileLayout || !rowRef.current) {
      return;
    }

    const amount =
      Math.abs(event.deltaY) > Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;

    rowRef.current.scrollLeft += amount;
  }

  function handleChipPointerUp(category: CategoryValue) {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }

    onSelect(category);
  }

  if (mobileLayout) {
    return (
      <div
        ref={rowRef}
        className={`category-chip-row ${isDragging ? "dragging" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={stopDragging}
        onWheel={handleWheel}
      >
        {categoryOptions.map((option) => {
          const isSelected = selected === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={`category-chip ${isSelected ? "selected" : ""}`}
              onPointerUp={() => handleChipPointerUp(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }

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
