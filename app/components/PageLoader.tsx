"use client";

import { useLenis } from "lenis/react";
import { useEffect, useState, type CSSProperties } from "react";

const LOUVER_COUNT = 8;
const LOGO_MS = 2200;
const SETTLE_HOLD_MS = 280;
const OPEN_MS = 1550;

function shouldSkip() {
  return (
    document.documentElement.classList.contains("loader-skip") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function markDone() {
  document.documentElement.classList.remove("page-loading");
  document.documentElement.classList.add("loader-skip");
  window.dispatchEvent(new Event("pageloader:done"));
}

export function PageLoader() {
  const [mode, setMode] = useState<"show" | "opening" | "gone">("show");
  const lenis = useLenis();

  useEffect(() => {
    if (shouldSkip()) {
      markDone();
      setMode("gone");
      return;
    }

    document.documentElement.classList.add("page-loading");
    const hold = window.setTimeout(() => setMode("opening"), LOGO_MS + SETTLE_HOLD_MS);

    return () => {
      window.clearTimeout(hold);
      document.documentElement.classList.remove("page-loading");
    };
  }, []);

  useEffect(() => {
    if (mode === "gone") {
      lenis?.start();
      return;
    }
    lenis?.stop();
  }, [lenis, mode]);

  useEffect(() => {
    if (mode !== "opening") return;

    const timeout = window.setTimeout(() => {
      markDone();
      setMode("gone");
    }, OPEN_MS);

    return () => window.clearTimeout(timeout);
  }, [mode]);

  if (mode === "gone") return null;

  return (
    <div
      className={`pageLoader${mode === "opening" ? " is-opening" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="pageLoaderLouvers" aria-hidden="true">
        {Array.from({ length: LOUVER_COUNT }, (_, i) => (
          <div className="pageLoaderSlot" key={i}>
            <div className="pageLoaderLouver" style={{ "--i": i } as CSSProperties} />
          </div>
        ))}
      </div>
      <div className="pageLoaderMark">
        <img
          className="pageLoaderLogo"
          src="/blackspot-logo.png"
          alt=""
          style={{ "--logo-ms": `${LOGO_MS}ms` } as CSSProperties}
        />
      </div>
    </div>
  );
}
