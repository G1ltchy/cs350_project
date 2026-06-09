import { useMemo, useState, type CSSProperties } from "react";
import SearchBar from "./SearchBar";
import { useLanguage } from "../context/LanguageContext";
import { getUi } from "../i18n/ui";
import { getMarkerTitle, getParentTitle } from "../lib/markerDisplay";
import type { MarkerCategory, MarkerSummary } from "../types/marker";
import { getMarkerId } from "../types/marker";

type CategoryFilter = MarkerCategory | "all";
type ActiveFilter = "all" | "active" | "inactive";
type MineFilter = "all" | "mine" | "others";

type MarkerManagementPanelProps = {
  markers: MarkerSummary[];
  loading: boolean;
  categoryFilter: CategoryFilter;
  onCategoryFilterChange: (category: CategoryFilter) => void;
  onSelectMarker: (marker: MarkerSummary) => void;
  onCreateNew: () => void;
  onLogout?: () => void;
};

const thStyle: CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap"
};

const tdStyle: CSSProperties = {
  padding: "12px",
  fontSize: 13,
  color: "#111827",
  borderBottom: "1px solid #f3f4f6",
  verticalAlign: "middle"
};

const filterSelectStyle: CSSProperties = {
  marginTop: 4,
  padding: "4px 6px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 12,
  color: "#374151",
  background: "#ffffff",
  width: "100%",
  maxWidth: 120
};

export default function MarkerManagementPanel({
  markers,
  loading,
  categoryFilter,
  onCategoryFilterChange,
  onSelectMarker,
  onCreateNew,
  onLogout
}: MarkerManagementPanelProps) {
  const { language } = useLanguage();
  const ui = getUi(language);
  const mgmt = ui.markerManagement;

  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [mineFilter, setMineFilter] = useState<MineFilter>("all");

  const filteredMarkers = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();

    return markers.filter((marker) => {
      const title = getMarkerTitle(marker, language).toLowerCase();
      const parentTitle = getParentTitle(marker.parentId, language);
      const locationHint = parentTitle ? parentTitle.toLowerCase() : "";

      const matchesQuery =
        trimmedQuery === "" ||
        title.includes(trimmedQuery) ||
        locationHint.includes(trimmedQuery) ||
        marker.titleKo.toLowerCase().includes(trimmedQuery) ||
        marker.titleEn?.toLowerCase().includes(trimmedQuery);

      const matchesCategory =
        categoryFilter === "all" || marker.category === categoryFilter;

      const status = marker.status ?? "active";
      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" && status === "active") ||
        (activeFilter === "inactive" && status === "inactive");

      const isMine = Boolean(marker.createdBy);
      const matchesMine =
        mineFilter === "all" ||
        (mineFilter === "mine" && isMine) ||
        (mineFilter === "others" && !isMine);

      return matchesQuery && matchesCategory && matchesActive && matchesMine;
    });
  }, [markers, query, categoryFilter, activeFilter, mineFilter, language]);

  function formatMarkerTitle(marker: MarkerSummary): string {
    const title = getMarkerTitle(marker, language);
    const parentTitle = getParentTitle(marker.parentId, language);

    if (parentTitle) {
      return `${title} (${parentTitle})`;
    }

    return title;
  }

  return (
    <aside
      style={{
        width: "65%",
        minWidth: 420,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          padding: "28px 32px 20px",
          borderBottom: "1px solid #f3f4f6"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                color: "#111827"
              }}
            >
              {mgmt.title}
            </h1>
            <p
              style={{
                margin: "10px 0 0",
                fontSize: 14,
                color: "#6b7280",
                lineHeight: 1.5
              }}
            >
              {mgmt.description}
            </p>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              style={{
                flexShrink: 0,
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#374151",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
              }}
            >
              {ui.map.managerLogout}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "20px 32px 0" }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={mgmt.searchPlaceholder}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button
            type="button"
            onClick={onCreateNew}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)"
            }}
          >
            {mgmt.createNew}
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          marginTop: 20,
          padding: "0 32px 24px",
          overflow: "auto"
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed"
          }}
        >
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={{ ...thStyle, width: "36%" }}>{mgmt.columns.title}</th>
              <th style={{ ...thStyle, width: "22%" }}>
                <div>{mgmt.columns.category}</div>
                <select
                  value={categoryFilter}
                  onChange={(event) =>
                    onCategoryFilterChange(event.target.value as CategoryFilter)
                  }
                  style={filterSelectStyle}
                  aria-label={mgmt.columns.category}
                >
                  <option value="all">{ui.categories.all}</option>
                  {(
                    Object.keys(ui.categories) as Array<
                      keyof typeof ui.categories
                    >
                  )
                    .filter((key) => key !== "all")
                    .map((key) => (
                      <option key={key} value={key}>
                        {ui.categories[key]}
                      </option>
                    ))}
                </select>
              </th>
              <th style={{ ...thStyle, width: "21%" }}>
                <div>{mgmt.columns.active}</div>
                <select
                  value={activeFilter}
                  onChange={(event) =>
                    setActiveFilter(event.target.value as ActiveFilter)
                  }
                  style={filterSelectStyle}
                  aria-label={mgmt.columns.active}
                >
                  <option value="all">{mgmt.filters.all}</option>
                  <option value="active">{mgmt.filters.active}</option>
                  <option value="inactive">{mgmt.filters.inactive}</option>
                </select>
              </th>
              <th style={{ ...thStyle, width: "21%" }}>
                <div>{mgmt.columns.mine}</div>
                <select
                  value={mineFilter}
                  onChange={(event) =>
                    setMineFilter(event.target.value as MineFilter)
                  }
                  style={filterSelectStyle}
                  aria-label={mgmt.columns.mine}
                >
                  <option value="all">{mgmt.filters.all}</option>
                  <option value="mine">{mgmt.filters.mine}</option>
                  <option value="others">{mgmt.filters.others}</option>
                </select>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} style={{ ...tdStyle, color: "#6b7280" }}>
                  {ui.map.loadingMarkers}
                </td>
              </tr>
            )}

            {!loading && filteredMarkers.length === 0 && (
              <tr>
                <td colSpan={4} style={{ ...tdStyle, color: "#6b7280" }}>
                  {ui.map.noResults}
                </td>
              </tr>
            )}

            {!loading &&
              filteredMarkers.map((marker) => {
                const markerId = getMarkerId(marker);
                const status = marker.status ?? "active";
                const isMine = Boolean(marker.createdBy);

                return (
                  <tr
                    key={markerId}
                    onClick={() => onSelectMarker(marker)}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background = "#f9fafb";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td style={tdStyle}>{formatMarkerTitle(marker)}</td>
                    <td style={tdStyle}>{ui.categories[marker.category]}</td>
                    <td style={tdStyle}>
                      {status === "active"
                        ? mgmt.filters.active
                        : mgmt.filters.inactive}
                    </td>
                    <td style={tdStyle}>
                      {isMine ? mgmt.filters.mine : mgmt.filters.others}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </aside>
  );
}
