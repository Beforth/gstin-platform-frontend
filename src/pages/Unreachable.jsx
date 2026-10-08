import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshIcon } from "@/components/ui/icons";
import { useAuth } from "@/lib/auth";
import { AuthLayout } from "@/layout/AuthLayout";

/** Shown when the API cannot be reached or answers with something that is not our API. Never shows a login form. */
export default function Unreachable() {
  const { problem, refresh } = useAuth();
  const [busy, setBusy] = useState(false);

  return (
    <AuthLayout>
      <Card className="p-6">
        <div className="mb-4 grid gap-1">
          <h1 className="text-lg font-semibold tracking-tight">Can't reach the server</h1>
          <p className="text-[13px] text-muted-foreground">The dashboard loaded, but its API did not answer the way it should.</p>
        </div>
        <p className="mb-4 rounded-md border bg-muted p-3 font-mono text-xs">{problem ?? "No details."}</p>
        <ul className="mb-5 grid gap-2 text-[13px] text-muted-foreground">
          <li>Is the backend running and reachable over HTTPS?</li>
          <li>On Vercel: do the rewrites in <span className="font-mono">vercel.json</span> point at your backend (<span className="font-mono">npm run set-backend</span>)?</li>
          <li>Is this dashboard's address in the backend's <span className="font-mono">ALLOWED_ORIGINS</span>?</li>
        </ul>
        <Button
          className="w-full"
          loading={busy}
          onClick={async () => {
            setBusy(true);
            await refresh();
            setBusy(false);
          }}
        >
          <RefreshIcon /> Try again
        </Button>
      </Card>
    </AuthLayout>
  );
}
