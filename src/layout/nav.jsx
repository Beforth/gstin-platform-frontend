import { BarChartIcon, BookIcon, HomeIcon, LockIcon, ShieldIcon, UsersIcon } from "@/components/ui/icons";

/** The single source of truth for navigation: sidebar, bottom bar and breadcrumb all read this. */
export const NAV = [
  {
    group: "Workspace",
    items: [
      { to: "/overview", label: "Overview", icon: <HomeIcon /> },
      { to: "/verify", label: "Verify GSTIN", icon: <ShieldIcon /> },
    ],
  },
  {
    group: "Developers",
    items: [
      { to: "/keys", label: "API keys", icon: <LockIcon /> },
      { to: "/usage", label: "Usage", icon: <BarChartIcon /> },
      { to: "/docs", label: "API docs", icon: <BookIcon /> },
    ],
  },
  { group: "Admin", admin: true, items: [{ to: "/team", label: "Team", icon: <UsersIcon /> }] },
];

/** The four destinations on the mobile bottom bar. Everything else lives behind "More". */
export const BOTTOM = ["/overview", "/verify", "/keys", "/docs"];

const FLAT = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })));
export const findNav = (pathname) => FLAT.find((i) => pathname === i.to || pathname.startsWith(i.to + "/"));
export const isActive = (pathname, to) => pathname === to || pathname.startsWith(to + "/");
