"use client";

import { sendGAEvent } from "../lib/gtag";

export function FooterEmail() {
  return (
    <a
      href="mailto:info@theblackspotgroup.com"
      onClick={() =>
        sendGAEvent("contact_click", {
          type: "email",
          email: "info@theblackspotgroup.com",
        })
      }
    >
      Email
    </a>
  );
}

export function ContactPageEmail() {
  return (
    <a
      href="mailto:info@theblackspotgroup.com"
      onClick={() =>
        sendGAEvent("contact_click", {
          type: "email",
          contact_info: "info@theblackspotgroup.com",
        })
      }
    >
      <span>Email</span>
      <h2>info@theblackspotgroup.com</h2>
      <b>↗</b>
    </a>
  );
}

export function ContactPageUKPhone() {
  return (
    <a
      href="tel:+447425068083"
      onClick={() =>
        sendGAEvent("contact_click", {
          type: "phone_number",
          contact_info: "+44 7425 068083",
        })
      }
    >
      <h2>+44 7425 068083</h2>
    </a>
  );
}

export function ContactPageSAPhone(props: { isSaDomain: boolean }) {
  return (
    <a
      href="tel:+27814278898"
      onClick={() =>
        sendGAEvent("contact_click", {
          type: "phone_number",
          contact_info: "+27 81 427 8898",
        })
      }
    >
      <h2 style={{ marginTop: props.isSaDomain ? undefined : 0 }}>
        +27 81 427 8898
      </h2>
    </a>
  );
}
