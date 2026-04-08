import { r as reactExports, j as jsxRuntimeExports } from "./index-DUeTtLWC.js";
import { g as useGetGrokApiKey, h as useSetGrokApiKey } from "./useApplications-BsvSmbTF.js";
function SettingsPage() {
  const { data: savedKey } = useGetGrokApiKey();
  const { saveMutation, clearMutation } = useSetGrokApiKey();
  const [inputValue, setInputValue] = reactExports.useState("");
  const [saveStatus, setSaveStatus] = reactExports.useState(
    "idle"
  );
  const statusTimeout = reactExports.useRef(null);
  function handleSave() {
    if (!inputValue.trim()) return;
    saveMutation.mutate(inputValue.trim(), {
      onSuccess: () => {
        setInputValue("");
        setSaveStatus("saved");
        if (statusTimeout.current) clearTimeout(statusTimeout.current);
        statusTimeout.current = setTimeout(() => setSaveStatus("idle"), 4e3);
      }
    });
  }
  function handleClear() {
    clearMutation.mutate(void 0, {
      onSuccess: () => {
        setInputValue("");
        setSaveStatus("cleared");
        if (statusTimeout.current) clearTimeout(statusTimeout.current);
        statusTimeout.current = setTimeout(() => setSaveStatus("idle"), 4e3);
      }
    });
  }
  const maskedKey = savedKey ? `••••••••${savedKey.slice(-4)}` : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "settings-page",
      className: "relative min-h-screen w-full flex flex-col",
      style: { backgroundColor: "#000000" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "fixed inset-0 z-0",
            style: {
              backgroundImage: "url('https://images.unsplash.com/photo-1446776709462-d6b525c57bd3?w=1920&q=80&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "fixed inset-0 z-0",
            style: { backgroundColor: "rgba(0,0,0,0.55)" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col min-h-screen px-8 md:px-16 lg:px-24 pt-16 pb-24", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-16", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                style: {
                  color: "rgba(240,240,250,0.5)",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  fontFamily: "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif",
                  marginBottom: "12px"
                },
                children: "JOBTRACK AI"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "h1",
              {
                style: {
                  color: "#f0f0fa",
                  fontSize: "clamp(2.5rem, 6vw, 5rem)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.96px",
                  lineHeight: 1.05,
                  fontFamily: "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif",
                  margin: 0
                },
                children: "SETTINGS"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                style: {
                  color: "rgba(240,240,250,0.5)",
                  fontSize: "16px",
                  fontWeight: 400,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  fontFamily: "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif",
                  marginTop: "16px"
                },
                children: "CONFIGURE YOUR AI INTEGRATION"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              style: {
                width: "100%",
                maxWidth: "560px",
                height: "1px",
                backgroundColor: "rgba(240,240,250,0.15)",
                marginBottom: "48px"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: "560px", width: "100%" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                style: {
                  color: "rgba(240,240,250,0.45)",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  fontFamily: "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif",
                  marginBottom: "24px"
                },
                children: "AI CONFIGURATION"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "grok-api-key",
                style: {
                  display: "block",
                  color: "#f0f0fa",
                  fontSize: "13px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  fontFamily: "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif",
                  marginBottom: "8px"
                },
                children: "GROK API KEY"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "p",
              {
                style: {
                  color: "rgba(240,240,250,0.4)",
                  fontSize: "11px",
                  fontWeight: 400,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  fontFamily: "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif",
                  marginBottom: "20px",
                  lineHeight: 1.6
                },
                children: [
                  "ENTER YOUR GROK API KEY TO ENABLE AI-POWERED JOB PARSING. GET YOUR KEY AT",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: "https://api.x.ai",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      style: {
                        color: "rgba(240,240,250,0.7)",
                        textDecoration: "underline",
                        textDecorationColor: "rgba(240,240,250,0.3)"
                      },
                      children: "API.X.AI"
                    }
                  )
                ]
              }
            ),
            maskedKey && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "p",
              {
                style: {
                  color: "rgba(240,240,250,0.55)",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  fontFamily: "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif",
                  marginBottom: "16px",
                  fontVariantNumeric: "tabular-nums"
                },
                children: [
                  "CURRENT KEY: ",
                  maskedKey
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "grok-api-key",
                "data-ocid": "grok-api-key-input",
                type: "password",
                value: inputValue,
                onChange: (e) => setInputValue(e.target.value),
                onKeyDown: (e) => e.key === "Enter" && handleSave(),
                placeholder: savedKey ? "ENTER NEW KEY TO REPLACE" : "XAI-XXXXXXXXXXXXXXXX",
                autoComplete: "off",
                style: {
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
                  caretColor: "#f0f0fa"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mt-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  "data-ocid": "save-grok-key-btn",
                  onClick: handleSave,
                  disabled: !inputValue.trim() || saveMutation.isPending,
                  style: {
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
                    fontFamily: "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif",
                    cursor: inputValue.trim() ? "pointer" : "not-allowed",
                    transition: "background 0.2s ease, color 0.2s ease"
                  },
                  onMouseEnter: (e) => {
                    if (!inputValue.trim()) return;
                    e.currentTarget.style.background = "rgba(240,240,250,0.18)";
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.background = "rgba(240,240,250,0.1)";
                  },
                  children: saveMutation.isPending ? "SAVING..." : "SAVE KEY"
                }
              ),
              savedKey && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  "data-ocid": "clear-grok-key-btn",
                  onClick: handleClear,
                  disabled: clearMutation.isPending,
                  style: {
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
                    fontFamily: "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif",
                    cursor: "pointer",
                    transition: "background 0.2s ease"
                  },
                  onMouseEnter: (e) => {
                    e.currentTarget.style.background = "rgba(240,240,250,0.18)";
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.background = "rgba(240,240,250,0.1)";
                  },
                  children: clearMutation.isPending ? "CLEARING..." : "CLEAR KEY"
                }
              )
            ] }),
            saveStatus === "saved" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                "data-ocid": "settings-status-msg",
                style: {
                  color: "rgba(240,240,250,0.7)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  fontFamily: "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif",
                  marginTop: "20px"
                },
                children: "✓ API KEY SAVED SUCCESSFULLY"
              }
            ),
            saveStatus === "cleared" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "p",
              {
                "data-ocid": "settings-status-msg",
                style: {
                  color: "rgba(240,240,250,0.5)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.17px",
                  fontFamily: "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif",
                  marginTop: "20px"
                },
                children: "API KEY CLEARED"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "p",
            {
              style: {
                color: "rgba(240,240,250,0.2)",
                fontSize: "10px",
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "1.17px",
                fontFamily: "'D-DIN', 'DIN', 'Barlow', ui-sans-serif, system-ui, sans-serif",
                marginTop: "48px"
              },
              children: [
                "© ",
                (/* @__PURE__ */ new Date()).getFullYear(),
                ". BUILT WITH LOVE USING",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    style: { color: "rgba(240,240,250,0.35)" },
                    children: "CAFFEINE.AI"
                  }
                )
              ]
            }
          )
        ] })
      ]
    }
  );
}
export {
  SettingsPage
};
