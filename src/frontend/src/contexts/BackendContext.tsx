/**
 * BackendContext — provides a stable, always-current actor reference.
 * Exposes both a synchronous isBackendReady flag and an async waitForActor()
 * that resolves once the actor is available (up to 10s), preventing the
 * "Backend not available" error caused by mutations firing before useActor()
 * async initialization completes.
 */
import { createActor } from "@/backend";
import type { backendInterface } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { createContext, useContext, useRef } from "react";

type ActorType = backendInterface;

interface BackendContextValue {
  /** Current actor — may be null if backend not yet connected */
  actorRef: React.MutableRefObject<backendInterface | null>;
  /** True once the actor is available. Use to disable action buttons before ready. */
  isBackendReady: boolean;
  /**
   * Returns a Promise<actor> that waits up to 10 seconds for the actor to
   * become available, polling every 100ms. Rejects only after the timeout.
   * Use this inside ALL mutationFn bodies instead of getActor().
   */
  waitForActor: () => Promise<ActorType>;
  /**
   * @deprecated Use waitForActor() instead. Kept for backward compatibility.
   * Throws synchronously if actor is not yet available.
   */
  getActor: () => ActorType;
}

const BackendContext = createContext<BackendContextValue | null>(null);

export function BackendProvider({ children }: { children: React.ReactNode }) {
  const { actor } = useActor(createActor);
  const actorRef = useRef<backendInterface | null>(null);

  // Always keep ref current — runs synchronously on every render.
  actorRef.current = actor ?? null;

  const isBackendReady = actorRef.current !== null;

  function getActor(): ActorType {
    if (!actorRef.current) {
      throw new Error("Backend not available — please reload and try again.");
    }
    return actorRef.current;
  }

  function waitForActor(): Promise<ActorType> {
    // If already ready, resolve immediately
    if (actorRef.current) {
      return Promise.resolve(actorRef.current);
    }

    return new Promise<backendInterface>((resolve, reject) => {
      const MAX_WAIT_MS = 10_000;
      const POLL_INTERVAL_MS = 100;
      let elapsed = 0;

      const interval = setInterval(() => {
        if (actorRef.current) {
          clearInterval(interval);
          resolve(actorRef.current);
          return;
        }

        elapsed += POLL_INTERVAL_MS;
        if (elapsed >= MAX_WAIT_MS) {
          clearInterval(interval);
          reject(
            new Error(
              "Backend connection timed out. Please refresh and try again.",
            ),
          );
        }
      }, POLL_INTERVAL_MS);
    });
  }

  return (
    <BackendContext.Provider
      value={{ actorRef, isBackendReady, waitForActor, getActor }}
    >
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
