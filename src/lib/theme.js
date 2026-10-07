import { useEffect, useState } from "react";

/** Dark mode = `dark` class on <html> (set before first paint by index.html), remembered per browser. */
export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("befui-theme", dark ? "dark" : "light");
    } catch {
      /* storage unavailable */
    }
  }, [dark]);
  return [dark, setDark];
}
