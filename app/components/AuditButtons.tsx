"use client";

import { sendGAEvent } from "../lib/gtag";

const auditLink = "https://audit.theblackspotgroup.com/";

export function HomepageHero() {
  return (
    <a
      className="primaryCta"
      href={auditLink}
      target="_blank"
      referrerPolicy="no-referrer"
      onClick={() =>
        sendGAEvent("audit_cta_click", { placement: "homepage_hero" })
      }
    >
      Start with a free audit <span>↗</span>
    </a>
  );
}

export function HomepageAuditSection() {
  return (
    <a
      className="darkCta"
      href={auditLink}
      target="_blank"
      referrerPolicy="no-referrer"
      onClick={() =>
        sendGAEvent("audit_cta_click", { placement: "homepage_audit_section" })
      }
    >
      Audit my brand <span>↗</span>
    </a>
  );
}

export function FooterBtn() {
  return (
    <a
      href={auditLink}
      target="_blank"
      referrerPolicy="no-referrer"
      onClick={() => sendGAEvent("audit_cta_click", { placement: "footer" })}
    >
      Free brand audit
    </a>
  );
}

export function ServicesPage() {
  return (
    <a
      className="darkCta"
      href={auditLink}
      target="_blank"
      referrerPolicy="no-referrer"
      onClick={() =>
        sendGAEvent("audit_cta_click", { placement: "services_page" })
      }
    >
      Get your free audit ↗
    </a>
  );
}

export function ContactPage() {
  return (
    <a
      className="darkCta"
      href={auditLink}
      target="_blank"
      referrerPolicy="no-referrer"
      onClick={() =>
        sendGAEvent("audit_cta_click", { placement: "contact_page" })
      }
    >
      Audit my brand ↗
    </a>
  );
}
