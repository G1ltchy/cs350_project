import { useRef, useState } from "react";
import type { MarkerCategory } from "../types/marker";

type CategoryFilter = MarkerCategory | "all";

interface CategoryChipsProps {
  selected: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
}

const categories: { label: string; value: CategoryFilter }[] = [
  { label: "전체", value: "all" },
  { label: "건물", value: "building" },
  { label: "식당", value: "dining" },
  { label: "카페", value: "cafe" },
  { label: "버스", value: "bus" },
  { label: "시설", value: "facility" },
  { label: "도서관", value: "library" },
  { label: "기타", value: "etc" }
];

export default function CategoryChips({
  selected,
  onSelect
}: CategoryChipsProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const didDrag = useRef(false);

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (!rowRef.current) return;

    setIsDragging(true);
    didDrag.current = false;
    dragStartX.current = event.pageX;
    scrollStartX.current = rowRef.current.scrollLeft;
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!isDragging || !rowRef.current) return;

    const deltaX = event.pageX - dragStartX.current;

    if (Math.abs(deltaX) > 4) {
      didDrag.current = true;
    }

    rowRef.current.scrollLeft = scrollStartX.current - deltaX;
  }

  function stopDragging() {
    setIsDragging(false);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (!rowRef.current) return;

    event.preventDefault();

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      rowRef.current.scrollLeft += event.deltaY;
    } else {
      rowRef.current.scrollLeft += event.deltaX;
    }
  }

  function handleCategoryClick(category: CategoryFilter) {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }

    onSelect(category);
  }

  return (
    <div
      ref={rowRef}
      className={`category-chip-row ${isDragging ? "dragging" : ""}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onWheel={handleWheel}
    >
      {categories.map((category) => {
        const isSelected = selected === category.value;

        return (
          <button
            key={category.value}
            type="button"
            onClick={() => handleCategoryClick(category.value)}
            className={`category-chip ${isSelected ? "selected" : ""}`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}