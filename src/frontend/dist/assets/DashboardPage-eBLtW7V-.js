import { c as createLucideIcon, j as jsxRuntimeExports, a as cn, d as daysSince, L as Link, f as formatDate, r as reactExports, P as Primitive, S as Sparkles, m as motion, b as Skeleton, B as Button, u as ue } from "./index-aguMEkBW.js";
import { B as Building2, A as AnimatePresence, I as Input, C as Check, a as ChevronDown, E as ExternalLink, T as Tag, L as LoaderCircle, X } from "./input-BErHDkjC.js";
import { M as MapPin, B as Badge } from "./badge-DOkWh036.js";
import { u as useParseJobUrl, a as useAddApplication, b as useApplications } from "./useApplications-DXCdwNMb.js";
import { A as ArrowRight } from "./arrow-right-Dj34t0Hi.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["path", { d: "M12 8V4H8", key: "hb8ula" }],
  ["rect", { width: "16", height: "12", x: "4", y: "8", rx: "2", key: "enze0r" }],
  ["path", { d: "M2 14h2", key: "vft8re" }],
  ["path", { d: "M20 14h2", key: "4cs60a" }],
  ["path", { d: "M15 13v2", key: "1xurst" }],
  ["path", { d: "M9 13v2", key: "rq6x2g" }]
];
const Bot = createLucideIcon("bot", __iconNode$5);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
];
const CircleAlert = createLucideIcon("circle-alert", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M9 17H7A5 5 0 0 1 7 7h2", key: "8i5ue5" }],
  ["path", { d: "M15 7h2a5 5 0 1 1 0 10h-2", key: "1b9ql8" }],
  ["line", { x1: "8", x2: "16", y1: "12", y2: "12", key: "1jonct" }]
];
const Link2 = createLucideIcon("link-2", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$1);
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
function getScoreColor(score) {
  if (score >= 75)
    return {
      ring: "var(--color-chart-3)",
      text: "var(--color-chart-3)",
      bg: "color-mix(in oklch, var(--color-chart-3) 12%, transparent)"
    };
  if (score >= 50)
    return {
      ring: "var(--color-chart-2)",
      text: "var(--color-chart-2)",
      bg: "color-mix(in oklch, var(--color-chart-2) 12%, transparent)"
    };
  return {
    ring: "var(--color-muted-foreground)",
    text: "var(--color-muted-foreground)",
    bg: "color-mix(in oklch, var(--color-muted-foreground) 10%, transparent)"
  };
}
function JobFitBadge({
  score,
  confidence,
  size = "md",
  showLabel = false,
  className
}) {
  const { ring, text, bg } = getScoreColor(score);
  const sizes = {
    sm: { outer: 36, stroke: 3, r: 14, font: "9px", offset: 88 },
    md: { outer: 48, stroke: 3.5, r: 19, font: "11px", offset: 119 },
    lg: { outer: 72, stroke: 4, r: 29, font: "15px", offset: 182 }
  };
  const s = sizes[size];
  const circumference = 2 * Math.PI * s.r;
  const dashOffset = circumference - score / 100 * circumference;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-1.5", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative flex items-center justify-center",
        style: { width: s.outer, height: s.outer },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "svg",
            {
              width: s.outer,
              height: s.outer,
              viewBox: `0 0 ${s.outer} ${s.outer}`,
              style: { transform: "rotate(-90deg)" },
              "aria-label": `Job fit score: ${score}%`,
              role: "img",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("title", { children: [
                  "Job fit score: ",
                  score,
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "circle",
                  {
                    cx: s.outer / 2,
                    cy: s.outer / 2,
                    r: s.r,
                    fill: bg,
                    stroke: "var(--color-border)",
                    strokeWidth: s.stroke
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "circle",
                  {
                    cx: s.outer / 2,
                    cy: s.outer / 2,
                    r: s.r,
                    fill: "none",
                    stroke: ring,
                    strokeWidth: s.stroke,
                    strokeLinecap: "round",
                    strokeDasharray: circumference,
                    strokeDashoffset: dashOffset,
                    style: {
                      transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                    }
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "absolute font-semibold font-display leading-none",
              style: { fontSize: s.font, color: text },
              children: score
            }
          )
        ]
      }
    ),
    showLabel && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold", style: { color: text }, children: [
        score,
        "% fit"
      ] }),
      confidence !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
        Math.round(confidence * 100),
        "% confidence"
      ] })
    ] })
  ] });
}
function StatusPill({ status }) {
  const classes = {
    Applied: "stage-applied",
    Interviewing: "stage-interview",
    Offer: "stage-offer",
    Rejected: "stage-rejected",
    Archived: "bg-muted text-muted-foreground border border-border"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "fit-badge text-[10px]",
        classes[status] ?? classes.Applied
      ),
      children: status
    }
  );
}
function ApplicationCard({
  application,
  className
}) {
  const days = daysSince(application.updatedAt);
  const isStalled = days > 14 && application.status !== "Offer" && application.status !== "Rejected";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Link,
    {
      to: "/applications",
      "data-ocid": `app-card-${application.id}`,
      className: cn(
        "group flex items-center gap-4 px-4 py-3 rounded-lg bg-card border border-border",
        "hover:border-primary/40 hover:shadow-sm transition-smooth cursor-pointer",
        "relative overflow-hidden",
        className
      ),
      children: [
        isStalled && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stalled-indicator opacity-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-4 h-4 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground truncate", children: application.company }),
            isStalled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-medium px-1.5 py-0.5 rounded-sm bg-accent/15 text-accent border border-accent/30", children: "Stalled" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: application.jobTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-0.5 text-[10px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-2.5 h-2.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[100px]", children: application.location })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "·" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: formatDate(application.appliedAt) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 flex flex-col items-end gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { status: application.status }),
          application.fitScore !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(JobFitBadge, { score: application.fitScore, size: "sm" })
        ] })
      ]
    }
  );
}
var NAME = "Label";
var Label$1 = reactExports.forwardRef((props, forwardedRef) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.label,
    {
      ...props,
      ref: forwardedRef,
      onMouseDown: (event) => {
        var _a;
        const target = event.target;
        if (target.closest("button, input, select, textarea")) return;
        (_a = props.onMouseDown) == null ? void 0 : _a.call(props, event);
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
      }
    }
  );
});
Label$1.displayName = NAME;
var Root = Label$1;
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ...props
    }
  );
}
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
  salary: "",
  url: "",
  notes: "",
  tags: "",
  remote: false
};
function ConfidenceBar({ label, value }) {
  const pct = Math.round(value * 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
        pct,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "h-full rounded-full",
        style: {
          background: pct >= 75 ? "var(--color-chart-3)" : pct >= 50 ? "var(--color-chart-2)" : "var(--color-muted-foreground)"
        },
        initial: { width: 0 },
        animate: { width: `${pct}%` },
        transition: { duration: 0.7, ease: "easeOut" }
      }
    ) })
  ] });
}
function EditableField({
  label,
  value,
  onChange,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Input,
      {
        value,
        onChange: (e) => onChange(e.target.value),
        placeholder,
        className: "h-8 text-sm bg-background/60 border-border/60 focus:border-primary/60"
      }
    )
  ] });
}
function UrlInputView({
  onParse,
  onManual
}) {
  const [url, setUrl] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.25 },
      className: "space-y-3",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "url-input",
                value: url,
                onChange: (e) => setUrl(e.target.value),
                onKeyDown: (e) => e.key === "Enter" && url.trim() && onParse(url.trim()),
                placeholder: "Paste job posting URL here…",
                className: "pl-10 h-12 text-base bg-background border-border/60 focus:border-primary/50 transition-smooth placeholder:text-muted-foreground/50"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              "data-ocid": "parse-btn",
              onClick: () => url.trim() && onParse(url.trim()),
              disabled: !url.trim(),
              className: "h-12 px-6 gap-2 font-semibold",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4" }),
                "Parse with AI"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            "data-ocid": "manual-add-btn",
            onClick: onManual,
            className: "text-xs text-muted-foreground hover:text-primary transition-smooth flex items-center gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3 h-3" }),
              "Add manually instead"
            ]
          }
        )
      ]
    }
  );
}
function ParsingView() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.97 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0 },
      className: "flex flex-col items-center justify-center py-12 gap-4",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-16 h-16 flex items-center justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-2 border-primary/20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent",
              animate: { rotate: 360 },
              transition: {
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "w-6 h-6 text-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "AI is reading the job posting…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Extracting details and calculating your fit score" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5", children: [0, 0.2, 0.4].map((delay) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: "w-1.5 h-1.5 rounded-full bg-primary/50",
            animate: { opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] },
            transition: {
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              delay
            }
          },
          delay
        )) })
      ]
    }
  );
}
function ConfirmationPanel({
  parsed,
  url,
  onSave,
  onReset,
  isSaving
}) {
  var _a;
  const [company, setCompany] = reactExports.useState(parsed.companyName ?? "");
  const [jobTitle, setJobTitle] = reactExports.useState(parsed.position ?? "");
  const [location, setLocation] = reactExports.useState(parsed.location ?? "");
  const [jobType, setJobType] = reactExports.useState(parsed.jobType ?? "remote");
  const [salary, setSalary] = reactExports.useState(parsed.salary ?? "");
  const [activeTags, setActiveTags] = reactExports.useState(parsed.tags ?? []);
  const confidence = parsed.fitScoreConfidence !== void 0 ? parsed.fitScoreConfidence / 100 : 0.85;
  const toggleTag = (tag) => {
    setActiveTags(
      (prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };
  const handleSave = () => {
    if (!company || !jobTitle) {
      ue.error("Company and job title are required");
      return;
    }
    onSave({
      companyName: company,
      position: jobTitle,
      location,
      jobType,
      source: "direct",
      status: "Applied",
      jobUrl: url,
      notes: "",
      tags: activeTags,
      isHighPotential: (parsed.fitScore ?? 0) >= 80,
      appliedDate: BigInt(Date.now()) * BigInt(1e6),
      fitScore: parsed.fitScore !== void 0 ? BigInt(parsed.fitScore) : void 0,
      fitScoreConfidence: parsed.fitScoreConfidence !== void 0 ? BigInt(parsed.fitScoreConfidence) : void 0,
      salaryMin: parsed.salaryMin,
      salaryMax: parsed.salaryMax
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 8 },
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
      className: "space-y-4",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5 text-green-500" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-foreground", children: "Extracted successfully" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "· Review & save" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: onReset,
              className: "text-xs text-muted-foreground hover:text-foreground transition-smooth flex items-center gap-1",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3 h-3" }),
                "Try another"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-border bg-primary/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-foreground text-lg leading-tight", children: company || "Company" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: jobTitle || "Position" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                JobFitBadge,
                {
                  score: parsed.fitScore ?? 0,
                  confidence,
                  size: "lg"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-medium", children: "Fit Score" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              EditableField,
              {
                label: "Company",
                value: company,
                onChange: setCompany,
                placeholder: "Company name"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              EditableField,
              {
                label: "Job Title",
                value: jobTitle,
                onChange: setJobTitle,
                placeholder: "Position title"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              EditableField,
              {
                label: "Location",
                value: location,
                onChange: setLocation,
                placeholder: "City, State"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Job Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "select",
                  {
                    value: jobType,
                    onChange: (e) => setJobType(e.target.value),
                    className: "w-full h-8 text-sm rounded-md border border-border/60 bg-background/60 px-2 pr-7 appearance-none focus:outline-none focus:border-primary/60 transition-smooth",
                    children: JOB_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t))
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              EditableField,
              {
                label: "Salary Range",
                value: salary,
                onChange: setSalary,
                placeholder: "e.g. $160k–$200k"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Job URL" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: url,
                  target: "_blank",
                  rel: "noreferrer",
                  className: "flex items-center gap-1 text-xs text-primary hover:underline transition-smooth truncate",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3 flex-shrink-0" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: url })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-3 border-t border-border bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-muted-foreground mb-2.5 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3 h-3" }),
              "AI Confidence"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ConfidenceBar,
                {
                  label: "Company",
                  value: Math.min(1, confidence * 1.05)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ConfidenceBar, { label: "Job Title", value: Math.min(1, confidence) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ConfidenceBar,
                {
                  label: "Salary",
                  value: Math.max(0.4, confidence * 0.85)
                }
              )
            ] })
          ] }),
          (((_a = parsed.tags) == null ? void 0 : _a.length) ?? 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-3 border-t border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-3 h-3 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "Suggested Tags" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/60", children: "(click to toggle)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: (parsed.tags ?? []).map((tag, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              motion.button,
              {
                initial: { opacity: 0, scale: 0.8 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: i * 0.05 },
                onClick: () => toggleTag(tag),
                "data-ocid": `tag-toggle-${tag}`,
                className: cn(
                  "fit-badge text-[11px] transition-smooth",
                  activeTags.includes(tag) ? "bg-primary/15 text-primary border-primary/40" : "bg-muted text-muted-foreground border-border/60"
                ),
                children: [
                  activeTags.includes(tag) && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-2.5 h-2.5" }),
                  tag
                ]
              },
              tag
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-t border-border flex items-center justify-between bg-card/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              activeTags.length,
              " tag",
              activeTags.length !== 1 ? "s" : "",
              " selected"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                "data-ocid": "save-application-btn",
                onClick: handleSave,
                disabled: isSaving || !company || !jobTitle,
                className: "gap-2 font-semibold",
                children: [
                  isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
                  "Add to Pipeline"
                ]
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function ManualForm({
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
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      isHighPotential: false,
      appliedDate: BigInt(Date.now()) * BigInt(1e6)
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -6 },
      transition: { duration: 0.25 },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit, className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card/60 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-foreground", children: "Add Application Manually" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onCancel,
              className: "text-muted-foreground hover:text-foreground transition-smooth",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Company *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "manual-company",
                value: form.company,
                onChange: (e) => set("company")(e.target.value),
                placeholder: "e.g. Stripe",
                className: "h-8 text-sm",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Job Title *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "manual-title",
                value: form.jobTitle,
                onChange: (e) => set("jobTitle")(e.target.value),
                placeholder: "e.g. Senior Engineer",
                className: "h-8 text-sm",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "manual-location",
                value: form.location,
                onChange: (e) => set("location")(e.target.value),
                placeholder: "City, State or Remote",
                className: "h-8 text-sm"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Job Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  "data-ocid": "manual-jobtype",
                  value: form.jobType,
                  onChange: (e) => set("jobType")(e.target.value),
                  className: "w-full h-8 text-sm rounded-md border border-border bg-background px-2 pr-7 appearance-none focus:outline-none focus:border-primary/60",
                  children: JOB_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t, children: t }, t))
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Salary Range" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "manual-salary",
                value: form.salary,
                onChange: (e) => set("salary")(e.target.value),
                placeholder: "$100k–$130k",
                className: "h-8 text-sm"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Source" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  "data-ocid": "manual-source",
                  value: form.source,
                  onChange: (e) => set("source")(e.target.value),
                  className: "w-full h-8 text-sm rounded-md border border-border bg-background px-2 pr-7 appearance-none focus:outline-none focus:border-primary/60",
                  children: SOURCES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s))
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "select",
                {
                  "data-ocid": "manual-status",
                  value: form.status,
                  onChange: (e) => set("status")(e.target.value),
                  className: "w-full h-8 text-sm rounded-md border border-border bg-background px-2 pr-7 appearance-none focus:outline-none focus:border-primary/60",
                  children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s))
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Job URL" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "manual-url",
                value: form.url,
                onChange: (e) => set("url")(e.target.value),
                placeholder: "https://...",
                className: "h-8 text-sm",
                type: "url"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Tags (comma-separated)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                "data-ocid": "manual-tags",
                value: form.tags,
                onChange: (e) => set("tags")(e.target.value),
                placeholder: "react, typescript, remote",
                className: "h-8 text-sm"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                "data-ocid": "manual-notes",
                value: form.notes,
                onChange: (e) => set("notes")(e.target.value),
                placeholder: "Any notes about this role…",
                className: "text-sm min-h-[72px] resize-none"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 border-t border-border flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: onCancel,
              className: "gap-1",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              "data-ocid": "manual-submit-btn",
              type: "submit",
              disabled: isSaving,
              className: "gap-2 font-semibold",
              children: [
                isSaving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
                "Add to Pipeline"
              ]
            }
          )
        ] })
      ] }) })
    }
  );
}
function DashboardPage() {
  const [view, setView] = reactExports.useState("url-input");
  const [parsedUrl, setParsedUrl] = reactExports.useState("");
  const [parsedResult, setParsedResult] = reactExports.useState(
    null
  );
  const [parseError, setParseError] = reactExports.useState(null);
  const parseJobUrl = useParseJobUrl();
  const addApplication = useAddApplication();
  const { data: appsData, isLoading: appsLoading } = useApplications({
    pageSize: BigInt(5)
  });
  const recentApps = ((appsData == null ? void 0 : appsData.applications) ?? []).slice(0, 5);
  const handleParse = (url) => {
    setParseError(null);
    setParsedUrl(url);
    setView("parsing");
    parseJobUrl.mutate(url, {
      onSuccess: (result) => {
        setParsedResult(result);
        setView("confirmation");
      },
      onError: () => {
        setParseError("Couldn't parse that URL. Try adding manually instead.");
        setView("url-input");
      }
    });
  };
  const handleSave = (args) => {
    addApplication.mutate(args, {
      onSuccess: (app) => {
        ue.success("Application added!", {
          description: `${app.company} · ${app.jobTitle}`,
          action: { label: "View all", onClick: () => {
          } }
        });
        setView("url-input");
        setParsedResult(null);
        setParsedUrl("");
      }
    });
  };
  const handleReset = () => {
    setView("url-input");
    setParsedResult(null);
    setParsedUrl("");
    setParseError(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-full bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border bg-card px-6 py-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground leading-tight", children: "Add Application" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Paste a job URL and let AI extract the details instantly." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-6 max-w-3xl space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card shadow-sm overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 px-6 py-4 border-b border-border bg-gradient-to-r from-primary/8 to-transparent", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold text-sm text-foreground", children: "AI-Powered Job Parser" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Paste a URL and we'll extract everything automatically" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-5", children: [
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
              ConfirmationPanel,
              {
                parsed: parsedResult,
                url: parsedUrl,
                onSave: handleSave,
                onReset: handleReset,
                isSaving: addApplication.isPending
              },
              "confirmation"
            ),
            view === "manual" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              ManualForm,
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
              initial: { opacity: 0, y: 4 },
              animate: { opacity: 1, y: 0 },
              className: "mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-destructive flex-shrink-0 mt-0.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive", children: parseError })
              ]
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold text-foreground flex items-center gap-2", children: [
            "Recent Applications",
            appsData && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[10px] px-1.5 py-0", children: appsData.total })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/applications",
              "data-ocid": "view-all-apps-link",
              className: "text-xs text-primary hover:text-primary/80 transition-smooth flex items-center gap-1",
              children: [
                "View all",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3" })
              ]
            }
          )
        ] }),
        appsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full rounded-lg" }, i)) }) : recentApps.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "empty-recent-apps",
            className: "flex flex-col items-center justify-center py-10 gap-3 rounded-xl border border-dashed border-border bg-muted/20",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-5 h-5 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: "No applications yet" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Paste a job URL above to get started" })
              ] })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: recentApps.map((app, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, x: -8 },
            animate: { opacity: 1, x: 0 },
            transition: { delay: i * 0.07 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ApplicationCard, { application: app })
          },
          app.id
        )) })
      ] })
    ] })
  ] });
}
export {
  DashboardPage
};
