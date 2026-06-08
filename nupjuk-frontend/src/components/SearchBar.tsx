interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search markers"
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 14,
        border: "none",
        outline: "none",
        background: "#ffffff",
        color: "#111827",
        fontSize: 14,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", "Apple SD Gothic Neo", Arial, sans-serif',
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.12)"
      }}
    />
  );
}