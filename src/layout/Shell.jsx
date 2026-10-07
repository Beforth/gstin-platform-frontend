import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppContent, AppShell, Topbar } from "@/components/ui/app-shell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { BefMark, MoonIcon, SettingsIcon, SunIcon } from "@/components/ui/icons";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarItem } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { BottomNav } from "./BottomNav";
import { findNav, isActive, NAV } from "./nav";
import { UserMenu } from "./UserMenu";

function AppSidebar() {
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();
  const nav = useNavigate();
  return (
    <Sidebar>
      <SidebarHeader>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <BefMark className="size-4" />
        </span>
        <span className="min-w-0 truncate text-sm font-semibold tracking-tight">GSTIN Platform</span>
      </SidebarHeader>
      <SidebarContent>
        {NAV.filter((g) => !g.admin || isAdmin).map((g) => (
          <SidebarGroup key={g.group} label={g.group}>
            {g.items.map((i) => (
              <SidebarItem key={i.to} icon={i.icon} label={i.label} active={isActive(pathname, i.to)} onClick={() => nav(i.to)} />
            ))}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="grid gap-1">
        <SidebarItem icon={<SettingsIcon />} label="Settings" active={isActive(pathname, "/settings")} onClick={() => nav("/settings")} />
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}

export default function Shell() {
  const { pathname } = useLocation();
  const [dark, setDark] = useTheme();
  const current = findNav(pathname) ?? (isActive(pathname, "/settings") ? { group: "Account", label: "Settings" } : null);

  // Each page starts at the top, like a normal navigation.
  useEffect(() => {
    document.getElementById("app-content")?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <AppShell sidebar={<AppSidebar />}>
      <Topbar>
        {current && <Breadcrumb items={[{ label: current.group }, { label: current.label }]} className="min-w-0 truncate" />}
        <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={() => setDark(!dark)}>
          {dark ? <SunIcon /> : <MoonIcon />}
        </Button>
      </Topbar>
      <AppContent id="app-content">
        <div className="mx-auto w-full max-w-6xl">
          <Outlet />
        </div>
      </AppContent>
      <BottomNav />
    </AppShell>
  );
}
