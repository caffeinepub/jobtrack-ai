/**
 * BackendContext — provides a stable, always-current actor reference.
 * LAZY design: no polling, no blocking, no isReady gate.
 * The actor ref is updated on every render. Mutations read it at call time.
 */
import { createActor } from "@/backend";
import type { backendInterface } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { createContext, useContext, useRef } from "react";

interface BackendContextValue {
  /** Current actor — may be null if backend not yet connected */
  actorRef: React.MutableRefObject<backendInterface | null>;
  /**
   * Read actorRef.current right now. If null, throw a clear error.
   * Call this at action time (inside mutation fns) — never during render.
   */
  getActor: () => backendInterface;
}

const BackendContext = createContext<BackendContextValue | null>(null);

export function BackendProvider({ children }: { children: React.ReactNode }) {
  const { actor } = useActor(createActor);
  const actorRef = useRef<backendInterface | null>(null);

  // Always keep ref current — runs synchronously on every render.
  // Any event handler scheduled for the same frame reads the latest value.
  actorRef.current = actor ?? null;

  function getActor(): backendInterface {
    if (!actorRef.current) {
      throw new Error("Backend not available — please reload and try again.");
    }
    return actorRef.current;
  }

  return (
    <BackendContext.Provider value={{ actorRef, getActor }}>
      {children}
    </BackendContext.Provider>
  );
}

export function useBackendContext(): BackendContextValue {
  const ctx = useContext(BackendContext);
  if (!ctx) {
    throw new Error("useBackendContext must be used inside <BackendProvider>");
  }
  return ctx;
}
