import type { ReactNode } from "react";

interface BottomSheetProps {
  children: ReactNode;
  onClose: () => void;
  mobileLayout?: boolean;
}

export default function BottomSheet({
  children,
  onClose,
  mobileLayout = true
}: BottomSheetProps) {
  if (mobileLayout) {
    return (
      <div className="bottom-sheet-container">
        <section className="bottom-sheet">
          <div className="bottom-sheet-handle" />

          <button
            type="button"
            onClick={onClose}
            className="bottom-sheet-close"
          >
            닫기
          </button>

          {children}
        </section>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#ffffff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        zIndex: 20,
        boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.18)",
        maxHeight: "65vh",
        overflowY: "auto"
      }}
    >
      <div
        style={{
          width: 44,
          height: 5,
          borderRadius: 999,
          background: "#d1d5db",
          margin: "0 auto 16px"
        }}
      />

      <button
        onClick={onClose}
        style={{
          border: "none",
          background: "#f3f4f6",
          borderRadius: 10,
          padding: "8px 12px",
          cursor: "pointer"
        }}
      >
        닫기
      </button>

      {children}
    </div>
  );
}
