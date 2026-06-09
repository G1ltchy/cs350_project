import { useRef, useState } from "react";
import type { MarkerCategory } from "../types/marker";

type CategoryFilter = MarkerCategory | "all";
type Language = "ko" | "en";

interface CategoryChipsProps {
  selected: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
  language?: Language;
}

const categories: {
  labelKo: string;
  labelEn: string;
  value: CategoryFilter;
}[] = [
  { labelKo: "전체", labelEn: "All", value: "all" },
  { labelKo: "건물", labelEn: "Buildings", value: "building" },
  { labelKo: "식당", labelEn: "Dining", value: "dining" },
  { labelKo: "카페", labelEn: "Cafe", value: "cafe" },
  { labelKo: "버스", labelEn: "Bus", value: "bus" },
  { labelKo: "시설", labelEn: "Facilities", value: "facility" },
  { labelKo: "도서관", labelEn: "Library", value: "library" },
  { labelKo: "기타", labelEn: "Other", value: "etc" }
];

export default function CategoryChips({
  selected,
  onSelect,
  language = "ko"
}: CategoryChipsProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const movedRef = useRef(false);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!rowRef.current) return;

    setIsDragging(true);
    movedRef.current = false;
    startXRef.current = event.clientX;
    startScrollLeftRef.current = rowRef.current.scrollLeft;
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || !rowRef.current) return;

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
    if (!rowRef.current) return;

    const amount =
      Math.abs(event.deltaY) > Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;

    rowRef.current.scrollLeft += amount;
  }

  function handleChipPointerUp(category: CategoryFilter) {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }

    onSelect(category);
  }

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
      {categories.map((category) => {
        const isSelected = selected === category.value;
        const label = language === "ko" ? category.labelKo : category.labelEn;

        return (
          <button
            key={category.value}
            type="button"
            className={`category-chip ${isSelected ? "selected" : ""}`}
            onPointerUp={() => handleChipPointerUp(category.value)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}