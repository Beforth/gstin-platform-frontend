import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronUpIcon, LogOutIcon, SettingsIcon } from "@/components/ui/icons";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";

/** Account card at the bottom of the sidebar: who you are, settings, sign out. */
export function UserMenu() {
  const { user, logout } = useAuth();
  const { collapsed, setMobileOpen } = useSidebar();
  const nav = useNavigate();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/40 data-[state=open]:bg-secondary"
          aria-label="Account menu"
        >
          <Avatar name={user.name} size="sm" />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium leading-tight">{user.name}</span>
                <span className="block truncate text-[11px] leading-tight text-muted-foreground">{user.email ?? "Admin token"}</span>
              </span>
              <ChevronUpIcon className="size-3.5 text-muted-foreground" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <span className="truncate text-[13px] font-medium">{user.name}</span>
          <Badge variant={user.role === "admin" ? "primary" : "default"}>{user.role}</Badge>
        </div>
        <DropdownMenuLabel className="-mt-1 normal-case tracking-normal">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            setMobileOpen(false);
            nav("/settings");
          }}
        >
          <SettingsIcon /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem destructive onSelect={logout}>
          <LogOutIcon /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
