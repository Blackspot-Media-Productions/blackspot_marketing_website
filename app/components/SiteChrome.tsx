import React from "react";
import { getDomain } from "../utils";

export const auditLink = (placement: string) => `https://audit.theblackspotgroup.com/?utm_source=website&utm_medium=referral&utm_campaign=brand_audit&utm_content=${placement}`;

export function Header() {
  return <nav className="nav shell" aria-label="Main navigation">
    <a className="brand logoBrand" href="/" aria-label="Blackspot home"><img src="/blackspot-logo.png" alt="Blackspot Media Production & Events"/></a>
    <div className="navLinks"><a href="/services">Services</a><a href="/work">Work</a><a href="/blog">Ideas</a><a href="/about">About</a><a href="/contact">Contact</a></div>
    <a className="navCta" href={auditLink("header")}>Get your free audit <span>↗</span></a>
  </nav>;
}

export async function Footer() {
  const { host } = await getDomain();

  function bookingLink() {
    if (host?.includes('.co.uk')) {
      return "https://booking.blackspotmedia.co.uk";
    }

    return "https://booking.theblackspotgroup.com/";
  }

  return <footer className="footer shell">
    <div className="footerLead"><p>Have a problem worth solving?</p><a href={bookingLink()}>Let’s talk<span>.</span> ↗</a></div>
    <div className="footerGrid"><div className="footerLogo"><img src="/blackspot-logo.png" alt="Blackspot Media Production & Events"/></div><p>Brand, media and technology<br />for ambitious businesses.</p><div><a href="/services">Services</a><a href="/work">Work</a><a href="/blog">Ideas</a><a href="/about">About</a></div><div><a href="mailto:info@theblackspotgroup.com">Email</a><a href="/contact">Contact</a><a href={auditLink("footer")}>Free brand audit</a></div></div>
    <div className="footerBase"><span>Working across borders</span><span>© 2026 Blackspot Group</span><a href="#top">Back to top ↑</a></div>
  </footer>;
}

export function PageHero({ title, accent, intro }: { title: string; accent: string; intro: string }) {
  return (
    <section className="pageHero shell" id="top">
      <h1 data-reveal>{title}<br/><em>{accent}</em></h1>
      <p className="pageIntro" data-reveal style={{ "--reveal-delay": "80ms" } as React.CSSProperties}>{intro}</p>
    </section>
  );
}

export const sharedSocial = {
  openGraph: { images: [] as never[] },
  twitter: { images: [] as never[] },
};
