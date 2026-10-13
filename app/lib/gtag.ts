type EventNames =
  | "audit_cta_click"
  | "audit_submit_success"
  | "booking_cta_click"
  | "booking_start"
  | "booking_complete"
  | "contact_click"
  | "service_click"
  | "project_click";

const cleanParams = (params: Record<string, any>) => {
  const forbiddenKeys = [
    "email",
    "phone",
    "company",
    "url",
    "website",
    "social",
  ];
  const cleaned = { ...params };

  Object.keys(cleaned).forEach((key) => {
    if (
      forbiddenKeys.some((forbidden) => key.toLowerCase().includes(forbidden))
    ) {
      delete cleaned[key];
    }
  });
  return cleaned;
};

export const sendGAEvent = (
  eventName: EventNames,
  params?: Record<string, any>,
) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    const safeParams = params ? cleanParams(params) : {};
    (window as any).gtag("event", eventName, {
      ...safeParams,
      debug_mode: process.env.NEXT_PUBLIC_GA_DEBUG_MODE || false,
    });
  }
};
