import { d as daysSince, j as jsxRuntimeExports, L as Link, f as formatDate, c as cn, r as reactExports, m as motion, u as ue } from "./index-tjqNjV9p.js";
import { u as useParseAndAdd, a as useAddApplication, b as useApplications } from "./useApplications-CM33ZgoU.js";
import { A as AnimatePresence, L as LoaderCircle, C as ChevronDown } from "./loader-circle-0TV1GxW9.js";
import { c as createLucideIcon } from "./createLucideIcon-IZNbSNbp.js";
function StatusText({ status }) {
  const opacity = status === "Rejected" ? 0.3 : status === "Archived" ? 0.25 : status === "Offer" ? 0.9 : 0.6;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      style: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "1.17px",
        textTransform: "uppercase",
        color: `rgba(240,240,250,${opacity})`
      },
      children: status
    }
  );
}
function ApplicationCard({
  application,
  className
}) {
  const days = daysSince(application.updatedAt);
  const isStalled = days > 14 && application.status !== "Offer" && application.status !== "Rejected" && application.status !== "Archived";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Link,
    {
      to: "/applications",
      "data-ocid": `app-card-${application.id}`,
      className: cn("group block", className),
      style: {
        padding: "1.5rem 0",
        borderBottom: "1px solid rgba(240,240,250,0.06)",
        textDecoration: "none",
        display: "block"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "2rem"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { minWidth: 0, flex: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  style: { display: "flex", alignItems: "baseline", gap: "1.5rem" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        style: {
                          fontSize: "clamp(1rem, 2vw, 1.25rem)",
                          fontWeight: 700,
                          letterSpacing: "0.96px",
                          color: "#f0f0fa",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          transition: "opacity 0.3s"
                        },
                        className: "group-hover:opacity-70",
                        children: application.company
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "p",
                      {
                        style: {
                          fontSize: 13,
                          fontWeight: 400,
                          letterSpacing: "1.17px",
                          color: "rgba(240,240,250,0.5)",
                          textTransform: "uppercase",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        },
                        children: application.jobTitle
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5rem",
                    marginTop: "0.4rem"
                  },
                  children: [
                    application.location && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        style: {
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "1.17px",
                          color: "rgba(240,240,250,0.25)",
                          textTransform: "uppercase"
                        },
                        children: application.location
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        style: {
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "1.17px",
                          color: "rgba(240,240,250,0.2)",
                          textTransform: "uppercase"
                        },
                        children: formatDate(application.appliedAt)
                      }
                    ),
                    isStalled && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "span",
                      {
                        style: {
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "1.17px",
                          color: "rgba(240,240,250,0.35)",
                          textTransform: "uppercase",
                          borderBottom: "1px solid rgba(240,240,250,0.2)"
                        },
                        children: [
                          "Stalled — ",
                          days,
                          "d"
                        ]
                      }
                    )
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flexShrink: 0, textAlign: "right" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusText, { status: application.status }),
              application.fitScore !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  style: {
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "1.17px",
                    color: "rgba(240,240,250,0.3)",
                    marginTop: "0.3rem"
                  },
                  children: [
                    application.fitScore,
                    "% Fit"
                  ]
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
];
const RotateCcw = createLucideIcon("rotate-ccw", __iconNode);
const JOB_TYPES = ["remote", "hybrid", "onsite"];
const SOURCES = [
  "job_board",
  "referral",
  "recruiter",
  "direct",
  "network"
];
const STATUSES = [
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
  "Archived"
];
const DEFAULT_MANUAL = {
  company: "",
  jobTitle: "",
  location: "",
  jobType: "remote",
  source: "job_board",
  status: "Applied",
  url: "",
  notes: ""
};
function GhostSelect({
  value,
  onChange,
  options,
  id
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "select",
      {
        id,
        value,
        onChange: (e) => onChange(e.target.value),
        style: {
          width: "100%",
          padding: "10px 36px 10px 0",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid rgba(240,240,250,0.2)",
          color: "#f0f0fa",
          fontSize: "13px",
          fontWeight: 700,
          appearance: "none",
          cursor: "pointer",
          outline: "none"
        },
        children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "option",
          {
            value: o,
            style: { background: "#000", color: "#f0f0fa" },
            children: o.replace(/_/g, " ")
          },
          o
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ChevronDown,
      {
        style: {
          position: "absolute",
          right: 4,
          top: "50%",
          transform: "translateY(-50%)",
          width: 14,
          height: 14,
          color: "rgba(240,240,250,0.4)",
          pointerEvents: "none"
        }
      }
    )
  ] });
}
function GhostInput({
  value,
  onChange,
  placeholder,
  type = "text",
  id,
  onKeyDown
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "input",
    {
      id,
      type,
      value,
      onChange: (e) => onChange(e.target.value),
      onKeyDown,
      placeholder,
      style: {
        width: "100%",
        padding: "10px 0",
        background: "transparent",
        border: "none",
        borderBottom: "1px solid rgba(240,240,250,0.2)",
        color: "#f0f0fa",
        fontSize: "13px",
        fontWeight: 400,
        outline: "none",
        fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: "1.17px",
        textTransform: "uppercase"
      }
    }
  );
}
function GhostTextarea({
  value,
  onChange,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "textarea",
    {
      value,
      onChange: (e) => onChange(e.target.value),
      placeholder,
      rows: 3,
      style: {
        width: "100%",
        padding: "10px 0",
        background: "transparent",
        border: "none",
        borderBottom: "1px solid rgba(240,240,250,0.2)",
        color: "#f0f0fa",
        fontSize: "13px",
        fontWeight: 400,
        outline: "none",
        resize: "none",
        fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: "1.17px",
        textTransform: "uppercase"
      }
    }
  );
}
function FieldLabel({
  children,
  htmlFor
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "label",
    {
      htmlFor,
      style: {
        display: "block",
        fontSize: 10,
        fontWeight: 700,
        color: "rgba(240,240,250,0.45)",
        letterSpacing: "1.17px",
        textTransform: "uppercase",
        marginBottom: 2
      },
      children
    }
  );
}
function UrlInputView({
  onParse,
  onManual
}) {
  const [url, setUrl] = reactExports.useState("");
  const canParse = url.trim().length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.3 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "2rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "url-paste", children: "Paste Job URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            GhostInput,
            {
              id: "url-paste",
              value: url,
              onChange: setUrl,
              placeholder: "https://jobs.company.com/role/...",
              onKeyDown: (e) => e.key === "Enter" && canParse && onParse(url.trim())
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "1rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "parse-btn",
              onClick: () => canParse && onParse(url.trim()),
              disabled: !canParse,
              className: "ghost-button",
              style: { opacity: canParse ? 1 : 0.4 },
              children: "Parse with AI"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "manual-add-btn",
              onClick: onManual,
              style: {
                background: "transparent",
                border: "none",
                color: "rgba(240,240,250,0.5)",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "1.17px",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: 0
              },
              children: "Add Manually"
            }
          )
        ] })
      ]
    }
  );
}
function ParsingView() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      style: { padding: "3rem 0", textAlign: "center" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            animate: { rotate: 360 },
            transition: {
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear"
            },
            style: {
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1px solid rgba(240,240,250,0.15)",
              borderTopColor: "#f0f0fa",
              margin: "0 auto 1.5rem"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            style: {
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "1.17px",
              color: "rgba(240,240,250,0.7)"
            },
            children: "AI Reading Job Posting..."
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            style: {
              fontSize: 11,
              color: "rgba(240,240,250,0.35)",
              marginTop: "0.5rem",
              letterSpacing: "1.17px"
            },
            children: "Extracting details and calculating fit score"
          }
        )
      ]
    }
  );
}
function ConfirmationView({ parsed, onReset }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "2.5rem"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    style: {
                      fontSize: 10,
                      color: "rgba(240,240,250,0.45)",
                      letterSpacing: "1.17px",
                      marginBottom: "0.25rem",
                      textTransform: "uppercase"
                    },
                    children: "Job Added to Pipeline"
                  }
                ),
                parsed.fitScore !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "p",
                  {
                    style: {
                      fontSize: 40,
                      fontWeight: 700,
                      letterSpacing: "0.96px",
                      lineHeight: 1,
                      color: "#f0f0fa"
                    },
                    children: [
                      parsed.fitScore,
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 16, opacity: 0.5, marginLeft: 4 }, children: "% Fit" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: onReset,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "transparent",
                    border: "none",
                    color: "rgba(240,240,250,0.4)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "1.17px",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    padding: 0
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { size: 12 }),
                    "Add Another"
                  ]
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 3rem",
              marginBottom: "2rem"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { children: "Company" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    style: {
                      padding: "10px 0",
                      color: "#f0f0fa",
                      fontSize: "13px",
                      letterSpacing: "1.17px",
                      textTransform: "uppercase",
                      borderBottom: "1px solid rgba(240,240,250,0.1)"
                    },
                    children: parsed.companyName || "—"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { children: "Role" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    style: {
                      padding: "10px 0",
                      color: "#f0f0fa",
                      fontSize: "13px",
                      letterSpacing: "1.17px",
                      textTransform: "uppercase",
                      borderBottom: "1px solid rgba(240,240,250,0.1)"
                    },
                    children: parsed.position || "—"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { children: "Location" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    style: {
                      padding: "10px 0",
                      color: "#f0f0fa",
                      fontSize: "13px",
                      letterSpacing: "1.17px",
                      textTransform: "uppercase",
                      borderBottom: "1px solid rgba(240,240,250,0.1)"
                    },
                    children: parsed.location || "—"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { children: "Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    style: {
                      padding: "10px 0",
                      color: "#f0f0fa",
                      fontSize: "13px",
                      letterSpacing: "1.17px",
                      textTransform: "uppercase",
                      borderBottom: "1px solid rgba(240,240,250,0.1)"
                    },
                    children: parsed.jobType || "—"
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            "data-ocid": "auto-add-success",
            style: {
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1.17px",
              color: "rgba(240,240,250,0.6)",
              textTransform: "uppercase"
            },
            children: "✓ Automatically saved to your pipeline"
          }
        )
      ]
    }
  );
}
function ManualFormView({
  onSave,
  onCancel,
  isSaving
}) {
  const [form, setForm] = reactExports.useState(DEFAULT_MANUAL);
  const set = (k) => (v) => setForm((prev) => ({ ...prev, [k]: v }));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company || !form.jobTitle) {
      ue.error("Company and job title are required");
      return;
    }
    onSave({
      companyName: form.company,
      position: form.jobTitle,
      location: form.location,
      jobType: form.jobType,
      source: form.source,
      status: form.status,
      jobUrl: form.url || "",
      notes: form.notes || "",
      tags: [],
      isHighPotential: false,
      appliedDate: BigInt(Date.now()) * BigInt(1e6)
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.3 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 3rem",
              marginBottom: "2rem"
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "m-company", children: "Company *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  GhostInput,
                  {
                    "data-ocid": "manual-company",
                    id: "m-company",
                    value: form.company,
                    onChange: set("company"),
                    placeholder: "e.g. SpaceX"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "m-title", children: "Job Title *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  GhostInput,
                  {
                    "data-ocid": "manual-title",
                    id: "m-title",
                    value: form.jobTitle,
                    onChange: set("jobTitle"),
                    placeholder: "e.g. Senior Engineer"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "m-location", children: "Location" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  GhostInput,
                  {
                    "data-ocid": "manual-location",
                    id: "m-location",
                    value: form.location,
                    onChange: set("location"),
                    placeholder: "Hawthorne, CA or Remote"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "m-type", children: "Job Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  GhostSelect,
                  {
                    id: "m-type",
                    value: form.jobType,
                    onChange: set("jobType"),
                    options: JOB_TYPES
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "m-source", children: "Source" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  GhostSelect,
                  {
                    id: "m-source",
                    value: form.source,
                    onChange: set("source"),
                    options: SOURCES
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "m-status", children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  GhostSelect,
                  {
                    id: "m-status",
                    value: form.status,
                    onChange: set("status"),
                    options: STATUSES
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem", gridColumn: "1 / -1" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { htmlFor: "m-url", children: "Job URL" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  GhostInput,
                  {
                    "data-ocid": "manual-url",
                    id: "m-url",
                    type: "url",
                    value: form.url,
                    onChange: set("url"),
                    placeholder: "https://..."
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem", gridColumn: "1 / -1" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldLabel, { children: "Notes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  GhostTextarea,
                  {
                    value: form.notes,
                    onChange: set("notes"),
                    placeholder: "Any notes about this role..."
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: "1rem", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "submit",
              "data-ocid": "manual-submit-btn",
              disabled: isSaving,
              className: "ghost-button",
              children: [
                isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 14, style: { marginRight: 8 } }) : null,
                "Add to Pipeline"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onCancel,
              style: {
                background: "transparent",
                border: "none",
                color: "rgba(240,240,250,0.4)",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "1.17px",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: 0
              },
              children: "Cancel"
            }
          )
        ] })
      ] })
    }
  );
}
function StatOverlay({
  value,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        style: {
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 700,
          letterSpacing: "0.96px",
          lineHeight: 1,
          color: "#f0f0fa"
        },
        children: value
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        style: {
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "1.17px",
          color: "rgba(240,240,250,0.5)",
          marginTop: "0.4rem",
          textTransform: "uppercase"
        },
        children: label
      }
    )
  ] });
}
function DashboardPage() {
  const [view, setView] = reactExports.useState("url-input");
  const [parsedResult, setParsedResult] = reactExports.useState(
    null
  );
  const [parseError, setParseError] = reactExports.useState(null);
  const parseAndAdd = useParseAndAdd();
  const addApplication = useAddApplication();
  const { data: appsData, isLoading: appsLoading } = useApplications({
    pageSize: BigInt(5)
  });
  const { data: allAppsData } = useApplications({ pageSize: BigInt(1e3) });
  const recentApps = ((appsData == null ? void 0 : appsData.applications) ?? []).slice(0, 5);
  const total = Number((allAppsData == null ? void 0 : allAppsData.total) ?? 0);
  const active = ((allAppsData == null ? void 0 : allAppsData.applications) ?? []).filter(
    (a) => a.status === "Applied" || a.status === "Interviewing"
  ).length;
  const offers = ((allAppsData == null ? void 0 : allAppsData.applications) ?? []).filter(
    (a) => a.status === "Offer"
  ).length;
  const handleParse = (url) => {
    setParseError(null);
    setView("parsing");
    parseAndAdd.mutate(url, {
      onSuccess: ({ parsed, app }) => {
        setParsedResult(parsed);
        ue.success(`${app.company} added to pipeline`);
        setView("confirmation");
      },
      onError: (err) => {
        setParseError(
          err.message ?? "Couldn't parse that URL. Add manually instead."
        );
        setView("url-input");
      }
    });
  };
  const handleSave = (args) => {
    addApplication.mutate(args, {
      onSuccess: (app) => {
        ue.success(`${app.company} added to pipeline`);
        setView("url-input");
        setParsedResult(null);
      }
    });
  };
  const handleReset = () => {
    setView("url-input");
    setParsedResult(null);
    setParseError(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#000", minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "section",
      {
        className: "full-bleed-section",
        style: {
          backgroundImage: "url('https://images.unsplash.com/photo-1541185934-01b600ea069c?w=1920&q=80')"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "image-overlay" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "scene-content", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6, delay: 0.2 },
                style: {
                  display: "flex",
                  gap: "4vw",
                  marginBottom: "3rem"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(StatOverlay, { value: total, label: "Total Applications" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(StatOverlay, { value: active, label: "Active" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(StatOverlay, { value: offers, label: "Offers" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.h1,
              {
                className: "display-text",
                initial: { opacity: 0, y: 24 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.6 },
                style: { marginBottom: "0.5rem" },
                children: "Mission Control"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.p,
              {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { duration: 0.6, delay: 0.15 },
                style: {
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "1.17px",
                  color: "rgba(240,240,250,0.55)",
                  marginBottom: "2.5rem"
                },
                children: "Your Job Application Pipeline"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { duration: 0.5, delay: 0.3 },
                style: { display: "flex", gap: "1rem" },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Link,
                    {
                      to: "/applications",
                      className: "ghost-button",
                      "data-ocid": "view-pipeline-cta",
                      children: "View Pipeline"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Link,
                    {
                      to: "/kanban",
                      className: "ghost-button",
                      "data-ocid": "view-kanban-cta",
                      children: "Kanban Board"
                    }
                  )
                ]
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { style: { padding: "6rem 5vw" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "p",
            {
              style: {
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "1.17px",
                color: "rgba(240,240,250,0.35)",
                marginBottom: "0.5rem"
              },
              children: "AI-Powered"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "h2",
            {
              style: {
                fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                fontWeight: 700,
                letterSpacing: "0.96px",
                color: "#f0f0fa",
                marginBottom: "3rem",
                lineHeight: 1.1
              },
              children: "Add New Application"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 640 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
              view === "url-input" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                UrlInputView,
                {
                  onParse: handleParse,
                  onManual: () => setView("manual")
                },
                "url"
              ),
              view === "parsing" && /* @__PURE__ */ jsxRuntimeExports.jsx(ParsingView, {}, "parsing"),
              view === "confirmation" && parsedResult && /* @__PURE__ */ jsxRuntimeExports.jsx(
                ConfirmationView,
                {
                  parsed: parsedResult,
                  onReset: handleReset
                },
                "confirmation"
              ),
              view === "manual" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                ManualFormView,
                {
                  onSave: handleSave,
                  onCancel: handleReset,
                  isSaving: addApplication.isPending
                },
                "manual"
              )
            ] }),
            parseError && view === "url-input" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.div,
              {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: "1.5rem",
                  color: "rgba(240,240,250,0.6)",
                  fontSize: 12,
                  letterSpacing: "1.17px"
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 14 }),
                  parseError
                ]
              }
            )
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "section",
      {
        style: {
          padding: "6rem 5vw",
          borderTop: "1px solid rgba(240,240,250,0.06)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 16 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true },
            transition: { duration: 0.5 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    marginBottom: "3rem"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        {
                          style: {
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "1.17px",
                            color: "rgba(240,240,250,0.35)",
                            marginBottom: "0.5rem"
                          },
                          children: "Recent Activity"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h2",
                        {
                          style: {
                            fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                            fontWeight: 700,
                            letterSpacing: "0.96px",
                            color: "#f0f0fa",
                            lineHeight: 1.1
                          },
                          children: "Latest Applications"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      Link,
                      {
                        to: "/applications",
                        "data-ocid": "view-all-apps-link",
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: "1.17px",
                          color: "rgba(240,240,250,0.5)",
                          textDecoration: "none",
                          textTransform: "uppercase",
                          transition: "color 0.3s"
                        },
                        children: [
                          "View All",
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 14 })
                        ]
                      }
                    )
                  ]
                }
              ),
              appsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  style: {
                    padding: "1.5rem 0",
                    borderBottom: "1px solid rgba(240,240,250,0.06)",
                    opacity: 0.3
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        style: {
                          width: "40%",
                          height: 14,
                          background: "rgba(240,240,250,0.1)",
                          borderRadius: 2,
                          marginBottom: 8
                        }
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        style: {
                          width: "25%",
                          height: 10,
                          background: "rgba(240,240,250,0.06)",
                          borderRadius: 2
                        }
                      }
                    )
                  ]
                },
                i
              )) }) : recentApps.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "empty-recent-apps", style: { paddingTop: "3rem" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    style: {
                      fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                      fontWeight: 700,
                      letterSpacing: "0.96px",
                      color: "rgba(240,240,250,0.2)",
                      marginBottom: "1rem"
                    },
                    children: "No Applications Yet"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "p",
                  {
                    style: {
                      fontSize: 13,
                      letterSpacing: "1.17px",
                      color: "rgba(240,240,250,0.3)"
                    },
                    children: "Paste a job URL above to get started"
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: recentApps.map((app, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { opacity: 0, x: -12 },
                  whileInView: { opacity: 1, x: 0 },
                  viewport: { once: true },
                  transition: { delay: i * 0.07 },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ApplicationCard, { application: app })
                },
                app.id
              )) })
            ]
          }
        )
      }
    )
  ] });
}
export {
  DashboardPage
};
