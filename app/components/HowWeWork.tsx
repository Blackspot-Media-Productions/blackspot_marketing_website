"use client";

import { useLenis } from "lenis/react";
import { useCallback, useEffect, useRef, type CSSProperties } from "react";

const steps = [
  { n: "01", motif: "binoculars", mark: "● ●", title: "Diagnose", copy: "We look beyond the brief to find the issue that is really holding the business back." },
  { n: "02", motif: "summit", mark: "▲", title: "Define", copy: "We set the direction, priorities and measures of success before the making begins." },
  { n: "03", motif: "signal", mark: "⌁", title: "Build", copy: "Our specialists work as one team to create, launch and improve the right solution." },
];

function clamp(n: number) {
  return Math.min(1, Math.max(0, n));
}

export function HowWeWork() {
  const wrapRef = useRef<HTMLDivElement>(null);

  const update = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wrap.style.setProperty("--h", "1");
      wrap.style.setProperty("--v1", "1");
      wrap.style.setProperty("--v2", "1");
      wrap.style.setProperty("--s1", "1");
      wrap.style.setProperty("--s2", "1");
      wrap.style.setProperty("--s3", "1");
      return;
    }

    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.88;
    const travel = rect.height + vh * 0.35;
    const progress = clamp((start - rect.top) / travel);

    wrap.style.setProperty("--h", String(clamp(progress / 0.34)));
    wrap.style.setProperty("--v1", String(clamp((progress - 0.2) / 0.52)));
    wrap.style.setProperty("--v2", String(clamp((progress - 0.38) / 0.52)));
    wrap.style.setProperty("--s1", String(clamp((progress - 0.04) / 0.28)));
    wrap.style.setProperty("--s2", String(clamp((progress - 0.3) / 0.28)));
    wrap.style.setProperty("--s3", String(clamp((progress - 0.56) / 0.28)));
  }, []);

  useLenis(update);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  return (
    <section className="approach lightSection" id="approach">
      <div className="shell">
        <p className="sectionLabel" data-reveal>How we work</p>
        <div className="approachTitle" data-reveal style={{ "--reveal-delay": "80ms" } as CSSProperties}>
          <h2>Look closer.<br /><span>Move smarter.</span></h2>
          <p>Good solutions start with better questions. Our process brings focus before execution.</p>
        </div>
        <div className="stepsWrap" ref={wrapRef}>
          <div className="stepsFrame" aria-hidden="true">
            <i className="stepsLine stepsLineH" />
            <i className="stepsLine stepsLineV stepsLineV1" />
            <i className="stepsLine stepsLineV stepsLineV2" />
          </div>
          <div className="steps">
            {steps.map((s, i) => (
              <article data-reveal key={s.n} style={{ "--reveal-delay": `${120 + i * 90}ms` } as CSSProperties}>
                <span>{s.n}</span>
                <div className={`motif ${s.motif}`}>{s.mark}</div>
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
