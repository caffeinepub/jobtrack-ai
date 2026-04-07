import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Shield, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";

const FEATURES = [
  {
    icon: Zap,
    title: "AI-Powered Parsing",
    description:
      "Paste any job URL and watch AI extract all details instantly.",
  },
  {
    icon: Sparkles,
    title: "Smart Insights",
    description: "Personalized recommendations to accelerate your job search.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your data lives on-chain, owned only by you.",
  },
];

export function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoading = loginStatus === "logging-in";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-elevated mb-6 animate-float-subtle"
        >
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-display text-4xl font-bold tracking-tight text-foreground mb-2"
        >
          JobTrack AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-muted-foreground text-base mb-10 leading-relaxed"
        >
          Your intelligent job search command center.
          <br />
          Track, analyze, and optimize every application.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full grid gap-3 mb-10"
        >
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border text-left"
            >
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Login CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="w-full"
        >
          <Button
            data-ocid="login-btn"
            onClick={() => login()}
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold transition-smooth shadow-elevated"
            size="lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Connecting…
              </span>
            ) : (
              "Sign in with Internet Identity"
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Secured by the Internet Computer · No passwords, no tracking
          </p>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 text-xs text-muted-foreground/50"
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
            typeof window !== "undefined" ? window.location.hostname : "",
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-muted-foreground transition-smooth"
        >
          caffeine.ai
        </a>
      </motion.p>
    </div>
  );
}
