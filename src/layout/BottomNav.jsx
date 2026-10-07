import { useLocation, useNavigate } from "react-router-dom";
import { MenuIcon } from "@/components/ui/icons";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { BOTTOM, isActive, NAV } from "./nav";

const ITEMS = NAV.flatMap((g) => g.items).filter((i) => BOTTOM.includes(i.to));

/** Mobile tab bar (below lg). "More" opens the full sidebar as a slide-over. */
export function BottomNav() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { setMobileOpen } = useSidebar();
  const inMore = !BOTTOM.some((to) => isActive(pathname, to));

  const tab = "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium outline-none transition-colors focus-visible:bg-secondary [&_svg]:size-5";

  return (
    <nav aria-label="Primary" className="shrink-0 border-t bg-card/95 backdrop-blur lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex">
        {ITEMS.map((i) => {
          const active = isActive(pathname, i.to);
          return (
            <button key={i.to} type="button" onClick={() => nav(i.to)} aria-current={active ? "page" : undefined} className={cn(tab, active ? "text-primary" : "text-muted-foreground")}>
              <span className={cn("absolute inset-x-5 top-0 h-0.5 rounded-b-full bg-primary transition-opacity", active ? "opacity-100" : "opacity-0")} />
              {i.icon}
              {i.label.replace("Verify GSTIN", "Verify").replace("API keys", "Keys").replace("API docs", "Docs")}
            </button>
          );
        })}
        <button type="button" onClick={() => setMobileOpen(true)} className={cn(tab, inMore ? "text-primary" : "text-muted-foreground")}>
          <span className={cn("absolute inset-x-5 top-0 h-0.5 rounded-b-full bg-primary transition-opacity", inMore ? "opacity-100" : "opacity-0")} />
          <MenuIcon />
          More
        </button>
      </div>
    </nav>
  );
}
