import type { ReactNode } from "react";

type PhoneFrameProps = {
  children: ReactNode;
  variant?: "map" | "auth";
};

export default function PhoneFrame({
  children,
  variant = "map"
}: PhoneFrameProps) {
  return (
    <div
      className={
        variant === "auth" ? "phone-frame phone-frame--auth" : "phone-frame"
      }
    >
      {children}
    </div>
  );
}
