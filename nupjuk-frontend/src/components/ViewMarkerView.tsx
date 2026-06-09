import axios from "axios";
import { useMemo, useState, type ReactNode } from "react";
import { deleteMarker } from "../api/adminMarkers";
import { useLanguage } from "../context/LanguageContext";
import { getUi } from "../i18n/ui";
import { isOwnMarker } from "../lib/markerOwnership";
import type { Language } from "../lib/language";
import {
  getMarkerMarkdown,
  getMarkerTitle,
  getParentTitle
} from "../lib/markerDisplay";
import { formatCoordinate } from "../lib/mapBounds";
import {
  authActionButtonStyle,
  authInputStyle,
  authLabelStyle,
  authStatusBoxStyle,
  authTextareaStyle
} from "../pages/authFormStyles";
import type { MarkerDetail, MarkerSummary } from "../types/marker";
import { getMarkerId } from "../types/marker";

type ViewMarkerViewProps = {
  marker: MarkerDetail;
  markers: MarkerSummary[];
  mapPanel: ReactNode;
  onBack: () => void;
  onDeleted?: () => void;
  onEdit?: () => void;
};

type ActionStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

const readOnlyInputStyle = {
  ...authInputStyle,
  background: "#f9fafb",
  color: "#374151"
};

const readOnlyTextareaStyle = {
  ...authTextareaStyle,
  minHeight: 120,
  background: "#f9fafb",
  color: "#374151"
};

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function resolveParentLabel(
  marker: MarkerDetail,
  markers: MarkerSummary[],
  language: Language
): string {
  if (marker.parentId && typeof marker.parentId === "object") {
    return getMarkerTitle(marker.parentId, language);
  }

  if (typeof marker.parentId === "string") {
    const parent = markers.find((item) => getMarkerId(item) === marker.parentId);
    return parent ? getMarkerTitle(parent, language) : marker.parentId;
  }

  return "";
}

export default function ViewMarkerView({
  marker,
  markers,
  mapPanel,
  onBack,
  onDeleted,
  onEdit
}: ViewMarkerViewProps) {
  const { language } = useLanguage();
  const ui = getUi(language);
  const view = ui.viewMarker;
  const create = ui.createMarker;
  const m = ui.manager;

  const [status, setStatus] = useState<ActionStatus>({ kind: "idle" });

  const markerId = getMarkerId(marker);
  const parentLabel = useMemo(
    () => resolveParentLabel(marker, markers, language),
    [marker, markers, language]
  );
  const parentDisplay =
    parentLabel || getParentTitle(marker.parentId, language) || create.noParent;
  const markdown = getMarkerMarkdown(marker, language, view.noContent);
  const activeFrom = toDatetimeLocalValue(marker.activeFrom);
  const activeUntil = toDatetimeLocalValue(marker.activeUntil);
  const canManage = isOwnMarker(marker);

  async function handleDelete() {
    if (!window.confirm(view.deleteConfirm)) {
      return;
    }

    setStatus({ kind: "loading" });

    try {
      await deleteMarker(markerId);
      onDeleted?.();
    } catch (error) {
      let message: string = view.deleteFailed;

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          message = m.errors.authRequired;
        } else {
          const data = error.response?.data as { message?: string } | undefined;
          message = data?.message ?? message;
        }
      }

      setStatus({ kind: "error", message });
    }
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        background: "#ffffff"
      }}
    >
      <aside
        style={{
          width: "65%",
          minWidth: 420,
          height: "100%",
          overflowY: "auto",
          borderRight: "1px solid #e5e7eb",
          padding: "28px 32px 32px"
        }}
      >
        <h1
          style={{
            margin: "0 0 24px",
            fontSize: 28,
            fontWeight: 700,
            color: "#111827"
          }}
        >
          {view.title}
        </h1>

        <label style={authLabelStyle}>{create.markerTitle}</label>
        <input
          type="text"
          readOnly
          value={getMarkerTitle(marker, language)}
          style={readOnlyInputStyle}
        />

        <label style={{ ...authLabelStyle, marginTop: 16 }}>{view.coordinate}</label>
        <input
          type="text"
          readOnly
          value={`${formatCoordinate(marker.latitude)}, ${formatCoordinate(marker.longitude)}`}
          style={readOnlyInputStyle}
        />

        <label style={{ ...authLabelStyle, marginTop: 16 }}>
          {create.markdownContent}
        </label>
        <textarea
          readOnly
          value={markdown}
          style={readOnlyTextareaStyle}
        />

        <label style={{ ...authLabelStyle, marginTop: 16 }}>{m.category}</label>
        <input
          type="text"
          readOnly
          value={ui.categories[marker.category]}
          style={readOnlyInputStyle}
        />

        <label style={{ ...authLabelStyle, marginTop: 16 }}>
          {create.parentMarker}
        </label>
        <input
          type="text"
          readOnly
          value={parentDisplay}
          style={readOnlyInputStyle}
        />

        <label style={{ ...authLabelStyle, marginTop: 16 }}>
          {create.backgroundImage}
        </label>
        {marker.imageUrl ? (
          <img
            src={marker.imageUrl}
            alt={view.imageAlt}
            style={{
              width: "100%",
              maxHeight: 180,
              objectFit: "cover",
              borderRadius: 12,
              background: "#f3f4f6"
            }}
          />
        ) : (
          <input
            type="text"
            readOnly
            value={view.noImage}
            style={readOnlyInputStyle}
          />
        )}

        <label style={{ ...authLabelStyle, marginTop: 16 }}>
          {create.activeDuration}
        </label>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 10,
            alignItems: "center"
          }}
        >
          <input
            type="text"
            readOnly
            value={activeFrom || view.noDuration}
            style={readOnlyInputStyle}
          />
          <span style={{ color: "#6b7280", fontWeight: 600 }}>~</span>
          <input
            type="text"
            readOnly
            value={activeUntil || view.noDuration}
            style={readOnlyInputStyle}
          />
        </div>

        {canManage ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
              marginTop: 28
            }}
          >
            <button
              type="button"
              onClick={() => onEdit?.()}
              style={{
                ...authActionButtonStyle,
                background: "#22c55e"
              }}
            >
              {view.editMarker}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={status.kind === "loading"}
              style={{
                ...authActionButtonStyle,
                background: "#ef4444",
                opacity: status.kind === "loading" ? 0.7 : 1
              }}
            >
              {view.deleteMarker}
            </button>
            <button
              type="button"
              onClick={onBack}
              style={{
                ...authActionButtonStyle,
                background: "#374151"
              }}
            >
              {create.back}
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 28 }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                ...authActionButtonStyle,
                width: "100%",
                background: "#374151"
              }}
            >
              {create.back}
            </button>
          </div>
        )}

        {status.kind === "error" && (
          <div role="status" style={authStatusBoxStyle("error")}>
            <strong>{ui.common.failure}</strong>
            <div style={{ marginTop: 4 }}>{status.message}</div>
          </div>
        )}
      </aside>

      <div style={{ flex: 1, minWidth: 0, height: "100%" }}>{mapPanel}</div>
    </div>
  );
}
