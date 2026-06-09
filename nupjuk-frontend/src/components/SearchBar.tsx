type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search markers"
}: SearchBarProps) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "13px 16px",
        borderRadius: 18,
        border: "none",
        outline: "none",
        background: "#ffffff",
        color: "#111827",
        fontSize: 16,
        fontWeight: 600,
        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.14)"
      }}
    />
  );
}