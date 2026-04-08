import typography from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        /* SpaceX Cinematic — pure hex values only, no OKLCH */
        border: "rgba(240, 240, 250, 0.15)",
        input: "rgba(240, 240, 250, 0.15)",
        ring: "#f0f0fa",
        background: "#000000",
        foreground: "#f0f0fa",
        primary: {
          DEFAULT: "#f0f0fa",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#000000",
          foreground: "#f0f0fa",
        },
        destructive: {
          DEFAULT: "#c0392b",
          foreground: "#f0f0fa",
        },
        muted: {
          DEFAULT: "#111116",
          foreground: "#9898b0",
        },
        accent: {
          DEFAULT: "#f0f0fa",
          foreground: "#000000",
        },
        popover: {
          DEFAULT: "#000000",
          foreground: "#f0f0fa",
        },
        card: {
          DEFAULT: "#000000",
          foreground: "#f0f0fa",
        },
        chart: {
          1: "#f0f0fa",
          2: "#c8c8e0",
          3: "#a0a0c8",
          4: "#7878b0",
          5: "#505098",
        },
        sidebar: {
          DEFAULT: "#000000",
          foreground: "#f0f0fa",
          primary: "#f0f0fa",
          "primary-foreground": "#000000",
          accent: "#111116",
          "accent-foreground": "#f0f0fa",
          border: "rgba(240, 240, 250, 0.15)",
          ring: "#f0f0fa",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        body: ['"Space Grotesk"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      letterSpacing: {
        hero: "0.96px",
        nav: "1.17px",
      },
      borderRadius: {
        /* Only ghost button radius matters — 32px */
        "2xl": "32px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        /* No shadows in SpaceX design system */
        none: "none",
        subtle: "none",
        DEFAULT: "none",
        sm: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(12px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "cinematic-reveal": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-up": "slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "cinematic-reveal": "cinematic-reveal 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
