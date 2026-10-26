"use client";

import { sendGAEvent } from "../lib/gtag";

export function FooterBooking(props: { link: string; domain: string }) {
  return (
    <a href={props.link} onClick={() => sendGAEvent("booking_cta_click", props.domain)}>
      Let’s talk<span>.</span> ↗
    </a>
  );
}
