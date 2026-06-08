import type { ReactNode } from "react";

interface BottomSheetProps {
  children: ReactNode;
  onClose: () => void;
}

export default function BottomSheet({ children, onClose }: BottomSheetProps) {
  return (
    <div className="bottom-sheet-container">
      <section className="bottom-sheet">
        <div className="bottom-sheet-handle" />

        <button type="button" onClick={onClose} className="bottom-sheet-close">
          닫기
        </button>

        {children}
      </section>
    </div>
  );
}