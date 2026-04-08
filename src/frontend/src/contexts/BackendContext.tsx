/**
 * BackendContext — provides a stable, always-current actor reference
 * across the entire app and exposes waitForActor() so mutations can
 * safely await a ready connection instead of failing on transient null.
 */
import { createActor } from "@/backend";
import type { backendInterface } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface BackendContextValue {
  /** Current actor — may be null during initialization */
  actorRef: React.MutableRefObject<backendInterface | null>;
  /** True once the actor has been non-null at least once */
  isReady: boolean;
  /**
   * Resolves with a live actor, retrying every 200 ms for up to 5 s.
   * Throws "Backend not ready after timeout" if the actor never arrives.
   */
  waitForActor: () => Promise<backendInterface>;
}

const BackendContext = createContext<BackendContextValue | null>(null);

export function BackendProvider({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor(createActor);
  const actorRef = useRef<backendInterface | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Keep actorRef always current — this is the core invariant.
  // Because this runs synchronously on every render, any render that
  // receives a non-null actor will flush the ref before any event handler
  // that was also scheduled for that frame can read it.
  actorRef.current = actor ?? null;

  useEffect(() => {
    if (actor && !isFetching && !isReady) {
      setIsReady(true);
    }
  }, [actor, isFetching, isReady]);

  /**
   * Poll actorRef.current every 200 ms until it is non-null.
   * Maximum wait: 5 000 ms (25 attempts × 200 ms).
   * This solves the race where a mutation fires during initialization.
   */
  const waitForActor = useCallback((): Promise<backendInterface> => {
    return new Promise<backendInterface>((resolve, reject) => {
      // Fast path — actor already available
      if (actorRef.current) {
        resolve(actorRef.current);
        return;
      }

      const MAX_ATTEMPTS = 25; // 25 × 200 ms = 5 s
      let attempts = 0;

      const poll = () => {
        attempts++;
        if (actorRef.current) {
          resolve(actorRef.current);
          return;
        }
        if (attempts >= MAX_ATTEMPTS) {
          reject(
            new Error(
              "Backend not ready — please wait a moment and try again.",
            ),
          );
          return;
        }
        setTimeout(poll, 200);
      };

      setTimeout(poll, 200);
    });
  }, []); // actorRef is a stable ref — no dependency needed

  return (
    <BackendContext.Provider value={{ actorRef, isReady, waitForActor }}>
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

/** Convenience hook — returns true once the backend actor is confirmed ready */
export function useBackendReady(): boolean {
  return useBackendContext().isReady;
}
