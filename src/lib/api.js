// Lookup + CAPTCHA-source calls used by the Verify page. Everything goes through the shared http wrapper.
import { get, post } from "./http";

const flat = (r) => r.json ?? { outcome: "provider_error", message: r.error?.message ?? "Request failed." };

export const verify = async (gstin, provider, refresh = false) => flat(await post("/api/gst/verify", { gstin, provider, refresh }));
export const getHistory = async (limit = 8) => (await get(`/api/gst/history?limit=${limit}`)).json;
export const getStats = async () => (await get("/api/gst/stats")).json;

// Sources that need a human-typed CAPTCHA (GST portal, e-way bill)
const ROUTE = { gst_portal: "portal", ewaybill: "ewb" };
export const captchaChallenge = async (source, gstin) => flat(await post(`/api/gst/${ROUTE[source]}/challenge`, { gstin }));
export const captchaSolve = async (source, challenge_id, captcha) => flat(await post(`/api/gst/${ROUTE[source]}/solve`, { challenge_id, captcha }));
export const captchaCancel = async (source, challenge_id) => flat(await post(`/api/gst/${ROUTE[source]}/cancel`, { challenge_id }));
