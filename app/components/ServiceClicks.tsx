"use client";

import Link from "next/link";
import { sendGAEvent } from "../lib/gtag";

export function HomepageServiceClicks(props: { sId: string; sName: string }) {
  return (
    <Link
      href={`/services#${props.sId}`}
      onClick={() =>
        sendGAEvent("service_click", {
          service_type: props.sName,
        })
      }
    >
      <span className="serviceArrow">↗</span>
    </Link>
  );
}
