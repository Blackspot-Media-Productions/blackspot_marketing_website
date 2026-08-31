"use client";

import { ReactLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import "lenis/dist/lenis.css";

function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    let io: IntersectionObserver | undefined;
    let cancelled = false;

    const run = () => {
      if (cancelled) return;

      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const reveal = (el: HTMLElement) => el.classList.add("is-inview");

      if (reduced) {
        nodes.forEach(reveal);
        return;
      }

      const alreadyInView = (el: HTMLElement) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.92 && rect.bottom > 40;
      };

      nodes.forEach((el) => {
        if (alreadyInView(el)) reveal(el);
      });
      document.documentElement.classList.add("js-reveal");

      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            reveal(entry.target as HTMLElement);
            io?.unobserve(entry.target);
          }
        },
        { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
      );

      nodes.forEach((el) => {
        if (!el.classList.contains("is-inview")) io?.observe(el);
      });
    };

    if (document.documentElement.classList.contains("page-loading")) {
      window.addEventListener("pageloader:done", run, { once: true });
    } else {
      run();
    }

    return () => {
      cancelled = true;
      window.removeEventListener("pageloader:done", run);
      io?.disconnect();
    };
  }, [pathname]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [smooth, setSmooth] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSmooth(!isAdmin && !reduced);
  }, [isAdmin]);

  if (isAdmin) return children;

  const tree = (
    <>
      {children}
      <RevealObserver />
    </>
  );

  if (!smooth) return tree;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        duration: 1.15,
        smoothWheel: true,
        anchors: true,
        autoRaf: true,
      }}
    >
      {tree}
    </ReactLenis>
  );
}
