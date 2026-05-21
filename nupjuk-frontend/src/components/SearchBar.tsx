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
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid #d1d5db",
          fontSize: 16,
          outline: "none",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)"
        }}
      />
    );
  }