import {
  useGetGrokApiKey,
  useGetGrokModel,
  useSetGrokApiKey,
  useSetGrokModel,
} from "@/hooks/useApplications";
import type { GrokModel } from "@/store/useAppStore";
import { useRef, useState } from "react";

const FONT = "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif";

const MODELS: { value: GrokModel; label: string }[] = [
  { value: "grok-3", label: "GROK 3 — MOST CAPABLE" },
  { value: "grok-3-mini", label: "GROK 3 MINI — FASTER & EFFICIENT" },
  { value: "grok-2-1212", label: "GROK 2 — PREVIOUS GEN" },
];

export function SettingsPage() {
  const { data: savedKey } = useGetGrokApiKey();
  const { saveMutation, clearMutation } = useSetGrokApiKey();
  const { data: currentModel } = useGetGrokModel();
  const setModelMutation = useSetGrokModel();

  const [inputValue, setInputValue] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "cleared">(
    "idle",
  );
  const [selectedModel, setSelectedModel] = useState<GrokModel>(
    currentModel ?? "grok-3-mini",
  );
  const [modelSaveStatus, setModelSaveStatus] = useState<"idle" | "saved">(
    "idle",
  );
  const statusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modelStatusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSave() {
    if (!inputValue.trim()) return;
    saveMutation.mutate(inputValue.trim(), {
      onSuccess: () => {
        setInputValue("");
        setSaveStatus("saved");
        if (statusTimeout.current) clearTimeout(statusTimeout.current);
        statusTimeout.current = setTimeout(() => setSaveStatus("idle"), 4000);
      },
    });
  }

  function handleClear() {
    clearMutation.mutate(undefined, {
      onSuccess: () => {
        setInputValue("");
        setSaveStatus("cleared");
        if (statusTimeout.current) clearTimeout(statusTimeout.current);
        statusTimeout.current = setTimeout(() => setSaveStatus("idle"), 4000);
      },
    });
  }

  function handleModelSave() {
    setModelMutation.mutate(selectedModel, {
      onSuccess: () => {
        setModelSaveStatus("saved");
        if (modelStatusTimeout.current)
          clearTimeout(modelStatusTimeout.current);
        modelStatusTimeout.current = setTimeout(
          () => setModelSaveStatus("idle"),
          4000,
        );
      },
    });
  }

  const maskedKey = savedKey ? `••••••••${savedKey.slice(-4)}` : null;

  return (
    <div
      data-ocid="settings-page"
      className="relative min-h-screen w-full flex flex-col"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Full-bleed aerospace photography background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1446776709462-d6b525c57bd3?w=1920&q=80&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Dark overlay */}
      <div
        className="fixed inset-0 z-0"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      />

      {/* Content — sits directly on the photograph */}
      <div className="relative z-10 flex flex-col min-h-screen px-8 md:px-16 lg:px-24 pt-16 pb-24">
        {/* Hero title */}
        <div className="mb-16">
          <p
            style={{
              color: "rgba(240,240,250,0.5)",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              fontFamily: FONT,
              marginBottom: "12px",
            }}
          >
            JOBTRACK AI
          </p>
          <h1
            style={{
              color: "#f0f0fa",
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.96px",
              lineHeight: 1.05,
              fontFamily: FONT,
              margin: 0,
            }}
          >
            SETTINGS
          </h1>
          <p
            style={{
              color: "rgba(240,240,250,0.5)",
              fontSize: "16px",
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              fontFamily: FONT,
              marginTop: "16px",
            }}
          >
            CONFIGURE YOUR AI INTEGRATION
          </p>
        </div>

        {/* Divider line */}
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            height: "1px",
            backgroundColor: "rgba(240,240,250,0.15)",
            marginBottom: "48px",
          }}
        />

        {/* ── Grok API Key Section ─────────────────────────────────────── */}
        <div style={{ maxWidth: "560px", width: "100%" }}>
          <p
            style={{
              color: "rgba(240,240,250,0.45)",
              fontSize: "10px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              fontFamily: FONT,
              marginBottom: "24px",
            }}
          >
            AI CONFIGURATION
          </p>

          <label
            htmlFor="grok-api-key"
            style={{
              display: "block",
              color: "#f0f0fa",
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              fontFamily: FONT,
              marginBottom: "8px",
            }}
          >
            GROK API KEY
          </label>

          <p
            style={{
              color: "rgba(240,240,250,0.4)",
              fontSize: "11px",
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              fontFamily: FONT,
              marginBottom: "20px",
              lineHeight: 1.6,
            }}
          >
            ENTER YOUR GROK API KEY TO ENABLE AI-POWERED JOB PARSING. GET YOUR
            KEY AT{" "}
            <a
              href="https://api.x.ai"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "rgba(240,240,250,0.7)",
                textDecoration: "underline",
                textDecorationColor: "rgba(240,240,250,0.3)",
              }}
            >
              API.X.AI
            </a>
          </p>

          {maskedKey && (
            <p
              style={{
                color: "rgba(240,240,250,0.55)",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                fontFamily: FONT,
                marginBottom: "16px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              CURRENT KEY: {maskedKey}
            </p>
          )}

          <input
            id="grok-api-key"
            data-ocid="grok-api-key-input"
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder={
              savedKey ? "ENTER NEW KEY TO REPLACE" : "XAI-XXXXXXXXXXXXXXXX"
            }
            autoComplete="off"
            style={{
              display: "block",
              width: "100%",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid rgba(240,240,250,0.35)",
              color: "#f0f0fa",
              fontSize: "14px",
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              padding: "12px 0",
              outline: "none",
              fontFamily: "ui-monospace, 'SF Mono', 'Courier New', monospace",
              caretColor: "#f0f0fa",
            }}
          />

          <div className="flex items-center gap-4 mt-8">
            <button
              type="button"
              data-ocid="save-grok-key-btn"
              onClick={handleSave}
              disabled={!inputValue.trim() || saveMutation.isPending}
              style={{
                background: "rgba(240,240,250,0.1)",
                border: "1px solid rgba(240,240,250,0.35)",
                borderRadius: "32px",
                paddingLeft: "18px",
                paddingRight: "18px",
                paddingTop: "12px",
                paddingBottom: "12px",
                color: inputValue.trim() ? "#f0f0fa" : "rgba(240,240,250,0.35)",
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                fontFamily: FONT,
                cursor: inputValue.trim() ? "pointer" : "not-allowed",
                transition: "background 0.2s ease, color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!inputValue.trim()) return;
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(240,240,250,0.18)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(240,240,250,0.1)";
              }}
            >
              {saveMutation.isPending ? "SAVING..." : "SAVE KEY"}
            </button>

            {savedKey && (
              <button
                type="button"
                data-ocid="clear-grok-key-btn"
                onClick={handleClear}
                disabled={clearMutation.isPending}
                style={{
                  background: "rgba(240,240,250,0.1)",
                  border: "1px solid rgba(240,240,250,0.35)",
                  borderRadius: "32px",
                  paddingLeft: "18px",
                  paddingRight: "18px",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  color: "#f0f0fa",
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  fontFamily: FONT,
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(240,240,250,0.18)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(240,240,250,0.1)";
                }}
              >
                {clearMutation.isPending ? "CLEARING..." : "CLEAR KEY"}
              </button>
            )}
          </div>

          {saveStatus === "saved" && (
            <p
              data-ocid="settings-status-msg"
              style={{
                color: "rgba(240,240,250,0.7)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                fontFamily: FONT,
                marginTop: "20px",
              }}
            >
              ✓ API KEY SAVED SUCCESSFULLY
            </p>
          )}
          {saveStatus === "cleared" && (
            <p
              data-ocid="settings-status-msg"
              style={{
                color: "rgba(240,240,250,0.5)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                fontFamily: FONT,
                marginTop: "20px",
              }}
            >
              API KEY CLEARED
            </p>
          )}
        </div>

        {/* ── Section divider ─────────────────────────────────────────── */}
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            height: "1px",
            backgroundColor: "rgba(240,240,250,0.1)",
            marginTop: "56px",
            marginBottom: "48px",
          }}
        />

        {/* ── Model Selector Section ───────────────────────────────────── */}
        <div style={{ maxWidth: "560px", width: "100%" }}>
          <label
            htmlFor="grok-model"
            style={{
              display: "block",
              color: "#f0f0fa",
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              fontFamily: FONT,
              marginBottom: "8px",
            }}
          >
            AI MODEL
          </label>

          <p
            style={{
              color: "rgba(240,240,250,0.4)",
              fontSize: "11px",
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              fontFamily: FONT,
              marginBottom: "24px",
              lineHeight: 1.6,
            }}
          >
            CHOOSE WHICH GROK MODEL IS USED FOR JOB PARSING AND ANALYSIS.
          </p>

          {/* Model options — ghost-button radio list */}
          <div
            data-ocid="model-selector"
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {MODELS.map((m) => {
              const isSelected = selectedModel === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  data-ocid={`model-option-${m.value}`}
                  onClick={() => setSelectedModel(m.value)}
                  style={{
                    background: isSelected
                      ? "rgba(240,240,250,0.12)"
                      : "rgba(240,240,250,0.04)",
                    border: isSelected
                      ? "1px solid rgba(240,240,250,0.5)"
                      : "1px solid rgba(240,240,250,0.2)",
                    borderRadius: "32px",
                    padding: "14px 22px",
                    color: isSelected ? "#f0f0fa" : "rgba(240,240,250,0.5)",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1.17px",
                    fontFamily: FONT,
                    cursor: "pointer",
                    textAlign: "left",
                    transition:
                      "background 0.2s ease, border-color 0.2s ease, color 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                  onMouseEnter={(e) => {
                    if (isSelected) return;
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(240,240,250,0.08)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(240,240,250,0.75)";
                  }}
                  onMouseLeave={(e) => {
                    if (isSelected) return;
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(240,240,250,0.04)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(240,240,250,0.5)";
                  }}
                >
                  {/* Selection indicator */}
                  <span
                    style={{
                      display: "inline-block",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: isSelected
                        ? "#f0f0fa"
                        : "rgba(240,240,250,0.2)",
                      flexShrink: 0,
                      transition: "background 0.2s ease",
                    }}
                  />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Save model button */}
          <button
            type="button"
            data-ocid="save-model-btn"
            onClick={handleModelSave}
            disabled={setModelMutation.isPending}
            style={{
              marginTop: "28px",
              background: "rgba(240,240,250,0.1)",
              border: "1px solid rgba(240,240,250,0.35)",
              borderRadius: "32px",
              paddingLeft: "18px",
              paddingRight: "18px",
              paddingTop: "12px",
              paddingBottom: "12px",
              color: "#f0f0fa",
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              fontFamily: FONT,
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(240,240,250,0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(240,240,250,0.1)";
            }}
          >
            {setModelMutation.isPending ? "SAVING..." : "SAVE MODEL"}
          </button>

          {modelSaveStatus === "saved" && (
            <p
              data-ocid="model-status-msg"
              style={{
                color: "rgba(240,240,250,0.7)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                fontFamily: FONT,
                marginTop: "20px",
              }}
            >
              ✓ MODEL PREFERENCE SAVED
            </p>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <p
          style={{
            color: "rgba(240,240,250,0.2)",
            fontSize: "10px",
            fontWeight: 400,
            textTransform: "uppercase",
            letterSpacing: "1.17px",
            fontFamily: FONT,
            marginTop: "48px",
          }}
        >
          © {new Date().getFullYear()}. BUILT WITH LOVE USING{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(240,240,250,0.35)" }}
          >
            CAFFEINE.AI
          </a>
        </p>
      </div>
    </div>
  );
}
