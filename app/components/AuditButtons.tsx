"use client";

import { sendGAEvent } from "../lib/gtag";

const auditLink = "https://audit.theblackspotgroup.com/";

export function HomepageHero(props: { domain: string; }) {
  return (
    <a
      className="primaryCta"
      href={auditLink}
      target="_blank"
      referrerPolicy="no-referrer"
      onClick={() =>
        sendGAEvent("audit_cta_click", props.domain, { placement: "homepage_hero" })
      }
    >
      Start with a free audit <span>↗</span>
    </a>
  );
}

export function HomepageAuditSection(props: { domain: string; }) {
  return (
    <a
      className="darkCta"
      href={auditLink}
      target="_blank"
      referrerPolicy="no-referrer"
      onClick={() =>
        sendGAEvent("audit_cta_click", props.domain, { placement: "homepage_audit_section" })
      }
    >
      Audit my brand <span>↗</span>
    </a>
  );
}

export function FooterBtn(props: { domain: string; }) {
  return (
    <a
      href={auditLink}
      target="_blank"
      referrerPolicy="no-referrer"
      onClick={() => sendGAEvent("audit_cta_click", props.domain, { placement: "footer" })}
    >
      Free brand audit
    </a>
  );
}

export function ServicesPage(props: { domain: string; }) {
  return (
    <a
      className="darkCta"
      href={auditLink}
      target="_blank"
      referrerPolicy="no-referrer"
      onClick={() =>
        sendGAEvent("audit_cta_click", props.domain, { placement: "services_page" })
      }
    >
      Get your free audit ↗
    </a>
  );
}

export function ContactPage(props: { domain: string; }) {
  return (
    <a
      className="darkCta"
      href={auditLink}
      target="_blank"
      referrerPolicy="no-referrer"
      onClick={() =>
        sendGAEvent("audit_cta_click", props.domain, { placement: "contact_page" })
      }
    >
      Audit my brand ↗
    </a>
  );
}
