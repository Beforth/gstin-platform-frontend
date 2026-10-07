// One fetch wrapper for everything. Cookies travel automatically (same origin); writes carry the header our
// server requires from cookie-authenticated pages (CSRF defence). A 401 "login_required" tells the app the
// session ended so it can show the login page.
const listeners = new Set();
export const onSessionExpired = (fn) => (listeners.add(fn), () => listeners.delete(fn));

export async function request(method, path, body) {
  try {
    const res = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: { ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(method !== "GET" ? { "X-Requested-With": "gst-web" } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => null);
    const error = res.ok ? null : (json?.error ?? { code: "http_error", message: json?.message ?? `HTTP ${res.status}` });
    if (res.status === 401 && error?.code === "login_required") listeners.forEach((fn) => fn());
    return { ok: res.ok, status: res.status, json, error };
  } catch {
    return { ok: false, status: 0, json: null, error: { code: "network", message: "Could not reach the server. Is it running?" } };
  }
}

export const get = (p) => request("GET", p);
export const post = (p, b = {}) => request("POST", p, b);
export const patch = (p, b = {}) => request("PATCH", p, b);
export const del = (p) => request("DELETE", p);
