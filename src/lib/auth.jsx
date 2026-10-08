import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { get, onSessionExpired, post } from "./http";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

/** What went wrong, in words a person can act on. */
function describe(method, path, r) {
  const what = r.status === 0 ? "no response (network error or blocked)" : r.json === null ? `HTTP ${r.status} with a page instead of JSON` : `HTTP ${r.status}`;
  return `${method} ${path} gave ${what}`;
}

/** status: loading | anon | setup | authed | unreachable */
export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: "loading", user: null, problem: null });

  const refresh = useCallback(async () => {
    // Only believe an answer that has the shape our API gives. A 404, an HTML page (a hosting rewrite that did not
    // reach the backend) or a network failure must NOT be read as "not signed in": that silently shows the login page.
    const me = await get("/auth/me");
    if (me.ok && me.json?.data?.user) return setState({ status: "authed", user: me.json.data.user, problem: null });
    if (me.status === 401 && me.json?.error?.code === "login_required") {
      const s = await get("/auth/status");
      const flag = s.json?.data?.setup_required;
      if (s.ok && typeof flag === "boolean") return setState({ status: flag ? "setup" : "anon", user: null, problem: null });
      return setState({ status: "unreachable", user: null, problem: describe("GET", "/auth/status", s) });
    }
    setState({ status: "unreachable", user: null, problem: describe("GET", "/auth/me", me) });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);
  useEffect(() => onSessionExpired(() => setState((s) => (s.status === "authed" ? { status: "anon", user: null, problem: null } : s))), []);

  const value = useMemo(
    () => ({
      ...state,
      isAdmin: state.user?.role === "admin",
      refresh,
      async login(email, password) {
        const r = await post("/auth/login", { email, password });
        if (r.ok) setState({ status: "authed", user: r.json.data.user, problem: null });
        return r;
      },
      async setup(body) {
        const r = await post("/auth/setup", body);
        if (r.ok) setState({ status: "authed", user: r.json.data.user, problem: null });
        return r;
      },
      async logout() {
        await post("/auth/logout");
        setState({ status: "anon", user: null, problem: null });
      },
      async changePassword(current_password, new_password) {
        const r = await post("/auth/password", { current_password, new_password });
        if (r.ok) await refresh();
        return r;
      },
    }),
    [state, refresh],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
