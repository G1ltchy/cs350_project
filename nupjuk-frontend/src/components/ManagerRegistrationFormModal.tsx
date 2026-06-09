import axios from "axios";
import { type ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { createMarker } from "../api/adminMarkers";
import { uploadMarkerImage } from "../api/adminUpload";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "../context/LanguageContext";
import { getUi } from "../i18n/ui";
import type { MarkerCategory } from "../types/marker";
import {
  authActionButtonStyle,
  authInputStyle,
  authLabelStyle,
  authStatusBoxStyle,
  authTextareaStyle
} from "../pages/authFormStyles";

const CATEGORIES: { value: MarkerCategory; label: string }[] = [
  { value: "building", label: "Building" },
  { value: "facility", label: "Facility" },
  { value: "dining", label: "Dining" },
  { value: "bus", label: "Bus" },
  { value: "event", label: "Event" },
  { value: "cafe", label: "Cafe" },
  { value: "library", label: "Library" },
  { value: "etc", label: "Etc" }
];

type ManagerRegistrationFormModalProps = {
  onClose: () => void;
  onMarkerCreated?: () => void;
};

type FormStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function ManagerRegistrationFormModal({
  onClose,
  onMarkerCreated
}: ManagerRegistrationFormModalProps) {
  const { language } = useLanguage();
  const ui = getUi(language);
  const m = ui.manager;

  const [titleKo, setTitleKo] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [category, setCategory] = useState<MarkerCategory>("etc");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [markdownKo, setMarkdownKo] = useState("");
  const [markdownEn, setMarkdownEn] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

      const marker = await createMarker({
        titleKo: trimmedTitleKo,
        ...(titleEn.trim() ? { titleEn: titleEn.trim() } : {}),
        latitude: lat,
        longitude: lng,
        category,
        markdownKo: trimmedMarkdownKo,
        ...(markdownEn.trim() ? { markdownEn: markdownEn.trim() } : {}),
        ...(imageUrl ? { imageUrl } : {})
      });

      setStatus({
        kind: "success",
        message: m.errors.markerCreated(marker.titleKo, Boolean(imageUrl))
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="manager-registration-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(0, 0, 0, 0.45)"
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#ffffff",
          border: "2px solid #374151",
          borderRadius: 4,
          padding: "28px 32px 32px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 12
          }}
        >
          <LanguageToggle />
        </div>

        <h2
          id="manager-registration-title"
          style={{
            margin: "0 0 24px",
            fontSize: 28,
            fontWeight: 700,
            color: "#1f2937",
            lineHeight: 1.25,
            whiteSpace: "pre-line"
          }}
        >
          {m.registrationFormTitle}
        </h2>

        <form onSubmit={handleSubmit}>
          <label style={authLabelStyle}>{m.titleKo}</label>
          <input
            type="text"
            value={titleKo}
            onChange={(event) => setTitleKo(event.target.value)}
            placeholder={m.titleKoPlaceholder}
            style={authInputStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 16 }}>{m.titleEn}</label>
          <input
            type="text"
            value={titleEn}
            onChange={(event) => setTitleEn(event.target.value)}
            placeholder={m.titleEnPlaceholder}
            style={authInputStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 16 }}>{m.category}</label>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as MarkerCategory)
            }
            style={selectStyle}
          >
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label style={{ ...authLabelStyle, marginTop: 16 }}>{m.latitude}</label>
          <input
            type="text"
            inputMode="decimal"
            value={latitude}
            onChange={(event) => setLatitude(event.target.value)}
            placeholder="36.373"
            style={authInputStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 16 }}>{m.longitude}</label>
          <input
            type="text"
            inputMode="decimal"
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
            placeholder="127.360"
            style={authInputStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 16 }}>{m.messageKo}</label>
          <textarea
            value={markdownKo}
            onChange={(event) => setMarkdownKo(event.target.value)}
            placeholder={m.messagePlaceholder}
            style={authTextareaStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 16 }}>{m.messageEn}</label>
          <textarea
            value={markdownEn}
            onChange={(event) => setMarkdownEn(event.target.value)}
            placeholder={m.titleEnPlaceholder}
            style={authTextareaStyle}
          />

          <label style={{ ...authLabelStyle, marginTop: 16 }}>{m.imageOptional}</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            style={{
              width: "100%",
              padding: "10px 0",
              fontSize: 14,
              color: "#374151"
            }}
          />
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginTop: 24
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
                : m.sendRequest}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                ...authActionButtonStyle,
                background: "#ef4444"
              }}
            >
              {m.back}
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
      </div>
    </div>
  );
}
