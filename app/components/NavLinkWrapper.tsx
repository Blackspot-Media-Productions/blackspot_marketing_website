"use client";

import { useRef } from "react";
import { Fragment } from "react/jsx-runtime";
import { sendGAEvent } from "../lib/gtag";

const auditLink = (placement: string) =>
  // `https://audit.theblackspotgroup.com/?utm_source=website&utm_medium=referral&utm_campaign=brand_audit&utm_content=${placement}`;
  "https://audit.theblackspotgroup.com/";

export default function NavLinkWrapper(props: { mediaLink: string; domain: string }) {
  const navWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <Fragment>
      <button
        onClick={() => navWrapperRef.current?.classList.add("active")}
        className="menu-mobile"
      >
        <span>menu</span>
      </button>

      <div ref={navWrapperRef} className={`nav-links-wrapper`}>
        <button
          onClick={() => navWrapperRef.current?.classList.remove("active")}
        >
          close
        </button>
        <div className="navLinks">
          <a href="/services">Services</a>
          <div className="nav-dropdown">
            <span style={{ cursor: "pointer" }}>Products</span>
            <div>
              <a href={props.mediaLink} referrerPolicy="no-referrer">
                Media Production
              </a>
              <a
                href="https://usefirstday.com"
                target="_blank"
                referrerPolicy="no-referrer"
              >
                First Day
              </a>
            </div>
          </div>
          <a href="/work">Work</a>
          <a href="/blog">Ideas</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
        <a
          className="navCta"
          href={auditLink("header")}
          target="_blank"
          referrerPolicy="no-referrer"
          onClick={() =>
            sendGAEvent("audit_cta_click", props.domain, { placement: "header" })
          }
        >
          Get your free audit <span>↗</span>
        </a>
      </div>
    </Fragment>
  );
}
