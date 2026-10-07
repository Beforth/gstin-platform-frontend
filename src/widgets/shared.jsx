export const OUTCOMES = {
  active: { variant: "success", title: "Registered and active" },
  inactive: { variant: "warning", title: "Registered, but not active" },
  not_registered: { variant: "danger", title: "GSTIN is not registered" },
  invalid_format: { variant: "danger", title: "Invalid GSTIN format" },
  provider_error: { variant: "warning", title: "Provider error" },
  timeout: { variant: "warning", title: "Provider timed out" },
  rate_limit: { variant: "warning", title: "Rate limit reached" },
  captcha_required: { variant: "info", title: "CAPTCHA needed" },
  captcha_invalid: { variant: "warning", title: "Wrong CAPTCHA" },
  challenge_expired: { variant: "warning", title: "CAPTCHA session expired" },
  portal_message: { variant: "warning", title: "The portal returned a message" },
  unknown: { variant: "warning", title: "Status unknown" },
};

export const outcomeBadge = (outcome) =>
  outcome === "active" ? "success" : outcome === "not_registered" || outcome === "invalid_format" ? "danger" : "warning";

export const PROVIDER_NAMES = { cashfree: "Cashfree", tally: "Tally", gst_portal: "GST portal", ewaybill: "E-way bill" };

export const CAPTCHA_SOURCES = ["gst_portal", "ewaybill"];

export const show = (v) => (v === null || v === undefined || v === "" ? "—" : v);

/** Small label/value pair used across the profile tabs. */
export function Item({ label, children, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm">{children}</dd>
    </div>
  );
}
