import axios from "axios";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { createMarker } from "../api/adminMarkers";
import { uploadMarkerImage } from "../api/adminUpload";
import { useLanguage } from "../context/LanguageContext";
import { getUi } from "../i18n/ui";
import { getMarkerTitle } from "../lib/markerDisplay";
import {
  authActionButtonStyle,
  authInputStyle,
  authLabelStyle,
  authStatusBoxStyle,
  authTextareaStyle
} from "../pages/authFormStyles";
import MarkerLocationMapPanel from "./MarkerLocationMapPanel";
import type { MarkerCategory, MarkerSummary } from "../types/marker";
import { getMarkerId } from "../types/marker";

type CreateMarkerViewProps = {
  markers: MarkerSummary[];
  onBack: () => void;
  onMarkerCreated?: () => void;
};

type FormStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

const CATEGORIES: MarkerCategory[] = [
  "building",
  "facility",
  "dining",
  "bus",
  "event",
  "cafe",
  "library",
  "etc"
];

export default function CreateMarkerView({
  markers,
  onBack,
  onMarkerCreated
}: CreateMarkerViewProps) {
  const { language } = useLanguage();
  const ui = getUi(language);
  const create = ui.createMarker;
  const m = ui.manager;

  const [titleKo, setTitleKo] = useState("");
  const [category, setCategory] = useState<MarkerCategory>("etc");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [markdownKo, setMarkdownKo] = useState("");
  const [parentId, setParentId] = useState("");
  const [activeFrom, setActiveFrom] = useState("");
  const [activeUntil, setActiveUntil] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

  const parentOptions = useMemo(
    () =>
      markers.filter((marker) => {
        const id = getMarkerId(marker);
        return id && (marker.parentId === null || marker.parentId === undefined);
      }),
    [markers]
  );

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (file && file.size > MAX_IMAGE_BYTES) {
      setStatus({ kind: "error", message: m.errors.imageTooLarge });
      event.target.value = "";
      setImageFile(null);
      return;
    }

    setImageFile(file);
  }

  function clearImage() {
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedTitleKo = titleKo.trim();
    const trimmedMarkdownKo = markdownKo.trim();
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!trimmedTitleKo) {
      setStatus({ kind: "error", message: m.errors.titleKoRequired });
      return;
    }

    if (!trimmedMarkdownKo) {
      setStatus({ kind: "error", message: m.errors.markdownKoRequired });
      return;
    }

    if (latitude.trim() === "" || longitude.trim() === "") {
      setStatus({ kind: "error", message: m.errors.latLngRequired });
      return;
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setStatus({ kind: "error", message: m.errors.latLngInvalid });
      return;
    }

    setStatus({ kind: "loading" });

    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        imageUrl = await uploadMarkerImage(imageFile);
      }

      await createMarker({
        titleKo: trimmedTitleKo,
        latitude: lat,
        longitude: lng,
        category,
        markdownKo: trimmedMarkdownKo,
        ...(parentId ? { parentId } : { parentId: null }),
        ...(activeFrom ? { activeFrom: new Date(activeFrom).toISOString() } : {}),
        ...(activeUntil ? { activeUntil: new Date(activeUntil).toISOString() } : {}),
        ...(imageUrl ? { imageUrl } : {})
      });

      setStatus({
        kind: "success",
        message: m.errors.markerCreated(trimmedTitleKo, Boolean(imageUrl))
      });
      clearImage();
      onMarkerCreated?.();
    } catch (error) {
      let messageText: string = m.errors.markerCreateFailed;

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          messageText = m.errors.authRequired;
        } else {
          const data = error.response?.data as { message?: string } | undefined;
          messageText = data?.message ?? messageText;
        }
      }

      setStatus({ kind: "error", message: messageText });
    }
  }

  const selectStyle = {
    ...authInputStyle,
    appearance: "menulist" as const
  };

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
          {create.title}
        </h1>

        <form onSubmit={handleSubmit}>
          <label style={authLabelStyle}>{create.markerTitle}</label>
          <input
            type="text"
            value={titleKo}
            onChange={(event) => setTitleKo(event.target.value)}
            placeholder={m.titleKoPlaceholder}
            style={authInputStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 16 }}>
            {create.latLng}
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              type="text"
              inputMode="decimal"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              placeholder={m.latitude}
              style={authInputStyle}
            />
            <input
              type="text"
              inputMode="decimal"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              placeholder={m.longitude}
              style={authInputStyle}
            />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>
            {create.latLngHint}
          </p>

          <label style={{ ...authLabelStyle, marginTop: 16 }}>
            {create.markdownContent}
          </label>
          <textarea
            value={markdownKo}
            onChange={(event) => setMarkdownKo(event.target.value)}
            placeholder={m.messagePlaceholder}
            style={{ ...authTextareaStyle, minHeight: 120 }}
          />

          <label style={{ ...authLabelStyle, marginTop: 16 }}>{m.category}</label>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as MarkerCategory)
            }
            style={selectStyle}
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {ui.categories[value]}
              </option>
            ))}
          </select>

          <label style={{ ...authLabelStyle, marginTop: 16 }}>
            {create.parentMarker}
          </label>
          <select
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            style={selectStyle}
          >
            <option value="">{create.noParent}</option>
            {parentOptions.map((marker) => {
              const markerId = getMarkerId(marker);

              return (
                <option key={markerId} value={markerId}>
                  {getMarkerTitle(marker, language)}
                </option>
              );
            })}
          </select>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>
            {create.parentHint}
          </p>

          <label style={{ ...authLabelStyle, marginTop: 16 }}>
            {create.backgroundImage}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 14,
              border: "1px dashed #9ca3af",
              background: "#f9fafb",
              color: "#374151",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {create.uploadImage}
          </button>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#6b7280" }}>
            {m.imageHint}
          </p>
          {imagePreviewUrl && (
            <div style={{ marginTop: 12 }}>
              <img
                src={imagePreviewUrl}
                alt={m.imagePreviewAlt}
                style={{
                  width: "100%",
                  maxHeight: 160,
                  objectFit: "cover",
                  borderRadius: 12,
                  background: "#f3f4f6"
                }}
              />
              <button
                type="button"
                onClick={clearImage}
                style={{
                  marginTop: 8,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  fontSize: 13,
                  cursor: "pointer"
                }}
              >
                {m.removeImage}
              </button>
            </div>
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
              type="datetime-local"
              value={activeFrom}
              onChange={(event) => setActiveFrom(event.target.value)}
              style={authInputStyle}
            />
            <span style={{ color: "#6b7280", fontWeight: 600 }}>~</span>
            <input
              type="datetime-local"
              value={activeUntil}
              onChange={(event) => setActiveUntil(event.target.value)}
              style={authInputStyle}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginTop: 28
            }}
          >
            <button
              type="submit"
              disabled={status.kind === "loading"}
              style={{
                ...authActionButtonStyle,
                background: "#22c55e",
                opacity: status.kind === "loading" ? 0.7 : 1
              }}
            >
              {status.kind === "loading"
                ? imageFile
                  ? m.uploading
                  : m.sending
                : create.create}
            </button>
            <button
              type="button"
              onClick={onBack}
              style={{
                ...authActionButtonStyle,
                background: "#ef4444"
              }}
            >
              {create.back}
            </button>
          </div>
        </form>

        {status.kind !== "idle" && status.kind !== "loading" && (
          <div
            role="status"
            style={authStatusBoxStyle(
              status.kind === "success" ? "success" : "error"
            )}
          >
            <strong>
              {status.kind === "success" ? ui.common.success : ui.common.failure}
            </strong>
            <div style={{ marginTop: 4 }}>{status.message}</div>
          </div>
        )}
      </aside>

      <MarkerLocationMapPanel
        markers={markers}
        latitude={latitude}
        longitude={longitude}
        onLatitudeChange={setLatitude}
        onLongitudeChange={setLongitude}
      />
    </div>
  );
}
