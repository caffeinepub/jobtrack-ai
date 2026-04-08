import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { motion } from "motion/react";

export function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoading = loginStatus === "logging-in";

  return (
    <div
      className="full-bleed-section"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1920&q=80)",
      }}
    >
      {/* Dark overlay */}
      <div className="image-overlay" />

      {/* Scene content */}
      <div className="scene-content">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          style={{ maxWidth: "640px" }}
        >
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              color: "rgba(240,240,250,0.55)",
              marginBottom: "1rem",
            }}
          >
            INTELLIGENT JOB SEARCH
          </motion.p>

          {/* Hero title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="display-text"
            style={{ marginBottom: "1.5rem", lineHeight: 1.0 }}
          >
            JOBTRACK AI
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{
              fontSize: "16px",
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "1.17px",
              color: "rgba(240,240,250,0.65)",
              marginBottom: "2.5rem",
              lineHeight: 1.6,
              maxWidth: "480px",
            }}
          >
            Track, analyze, and optimize every application. Powered by AI.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              data-ocid="login-btn"
              onClick={() => login()}
              disabled={isLoading}
              className="ghost-button"
              style={{ minWidth: "240px", height: "52px", fontSize: "13px" }}
            >
              {isLoading ? (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "1.5px solid rgba(240,240,250,0.3)",
                      borderTopColor: "#f0f0fa",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  CONNECTING…
                </span>
              ) : (
                "SIGN IN WITH INTERNET IDENTITY"
              )}
            </button>

            <p
              style={{
                fontSize: "11px",
                color: "rgba(240,240,250,0.35)",
                textTransform: "uppercase",
                letterSpacing: "1.17px",
              }}
            >
              SECURED BY INTERNET COMPUTER · NO PASSWORDS
            </p>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          style={{
            position: "absolute",
            bottom: "2rem",
            right: "5vw",
            fontSize: "10px",
            color: "rgba(240,240,250,0.25)",
            textTransform: "uppercase",
            letterSpacing: "1.17px",
          }}
        >
          © {new Date().getFullYear()}. BUILT WITH{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "rgba(240,240,250,0.45)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(240,240,250,0.25)",
            }}
          >
            CAFFEINE.AI
          </a>
        </motion.p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
