import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import Shell from "@/layout/Shell";
import ChangePassword from "@/pages/ChangePassword";
import Docs from "@/pages/Docs";
import Keys from "@/pages/Keys";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Overview from "@/pages/Overview";
import Settings from "@/pages/Settings";
import Setup from "@/pages/Setup";
import Team from "@/pages/Team";
import Usage from "@/pages/Usage";
import Verify from "@/pages/Verify";

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="grid w-64 gap-3" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
    </div>
  );
}

/** Everything inside the dashboard needs a session; temporary passwords must be replaced first. */
function Protected() {
  const { status, user } = useAuth();
  const loc = useLocation();
  if (status === "loading") return <Splash />;
  if (status === "setup") return <Navigate to="/setup" replace />;
  if (status === "anon") return <Navigate to="/login" replace state={{ from: loc.pathname + loc.search }} />;
  if (user.must_change_password) return <Navigate to="/change-password" replace />;
  return <Shell />;
}

function AdminOnly({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <NotFound forbidden />;
}

export default function App() {
  const { status } = useAuth();
  if (status === "loading") return <Splash />;
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Setup />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route element={<Protected />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="verify" element={<Verify />} />
        <Route path="keys" element={<Keys />} />
        <Route path="usage" element={<Usage />} />
        <Route path="docs" element={<Docs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="team" element={<AdminOnly><Team /></AdminOnly>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
