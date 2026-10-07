import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/lib/auth";
import { AuthLayout } from "@/layout/AuthLayout";

/** Forced screen: an administrator gave this person a temporary password. */
export default function ChangePassword() {
  const auth = useAuth();
  const nav = useNavigate();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (auth.status === "authed" && !auth.user.must_change_password) return <Navigate to="/overview" replace />;
  if (auth.status === "anon") return <Navigate to="/login" replace />;
  const mismatch = again && next !== again;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const r = await auth.changePassword(cur, next);
    setBusy(false);
    if (r.ok) nav("/overview", { replace: true });
    else setError(r.error?.message ?? "Could not change the password.");
  }

  return (
    <AuthLayout>
      <Card className="p-6">
        <div className="mb-6 grid gap-1">
          <h1 className="text-lg font-semibold tracking-tight">Choose a new password</h1>
          <p className="text-[13px] text-muted-foreground">You signed in with a temporary password. Pick your own to continue.</p>
        </div>
        <form onSubmit={submit} className="grid gap-4">
          {error && <Alert variant="danger" title={error} />}
          <Field label="Temporary password" htmlFor="cp-cur">
            <PasswordInput id="cp-cur" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} />
          </Field>
          <Field label="New password" htmlFor="cp-new" hint="At least 10 characters.">
            <PasswordInput id="cp-new" meter autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
          </Field>
          <Field label="Repeat new password" htmlFor="cp-again" error={mismatch ? "The passwords do not match." : undefined}>
            <PasswordInput id="cp-again" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} aria-invalid={mismatch || undefined} />
          </Field>
          <div className="flex gap-2">
            <Button type="submit" loading={busy} disabled={!cur || next.length < 10 || next !== again} className="flex-1">
              Save and continue
            </Button>
            <Button type="button" variant="outline" onClick={auth.logout}>
              Sign out
            </Button>
          </div>
        </form>
      </Card>
    </AuthLayout>
  );
}
