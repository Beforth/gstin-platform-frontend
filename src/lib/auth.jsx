import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { get, onSessionExpired, post } from "./http";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

/** status: loading | anon | setup | authed */
export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: "loading", user: null });

  const refresh = useCallback(async () => {
    const me = await get("/auth/me");
    if (me.ok) return setState({ status: "authed", user: me.json.data.user });
    const s = await get("/auth/status");
    setState({ status: s.json?.data?.setup_required ? "setup" : "anon", user: null });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);
  useEffect(() => onSessionExpired(() => setState((s) => (s.status === "authed" ? { status: "anon", user: null } : s))), []);

  const value = useMemo(
    () => ({
      ...state,
      isAdmin: state.user?.role === "admin",
      refresh,
      async login(email, password) {
        const r = await post("/auth/login", { email, password });
        if (r.ok) setState({ status: "authed", user: r.json.data.user });
        return r;
      },
      async setup(body) {
        const r = await post("/auth/setup", body);
        if (r.ok) setState({ status: "authed", user: r.json.data.user });
        return r;
      },
      async logout() {
        await post("/auth/logout");
        setState({ status: "anon", user: null });
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
