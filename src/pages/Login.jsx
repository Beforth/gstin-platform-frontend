import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MailIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/lib/auth";
import { AuthLayout } from "@/layout/AuthLayout";

export default function Login() {
  const auth = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (auth.status === "setup") return <Navigate to="/setup" replace />;
  if (auth.status === "authed") return <Navigate to={loc.state?.from ?? "/overview"} replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const r = await auth.login(email.trim(), password);
    setBusy(false);
    if (r.ok) nav(loc.state?.from ?? "/overview", { replace: true });
    else {
      setPassword("");
      setError(r.error?.message ?? "Could not sign in.");
    }
  }

  return (
    <AuthLayout>
      <Card className="p-6">
        <div className="mb-6 grid gap-1">
          <h1 className="text-lg font-semibold tracking-tight">Sign in</h1>
          <p className="text-[13px] text-muted-foreground">Use the account an administrator created for you.</p>
        </div>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          {error && <Alert variant="danger" title={error} />}
          <Field label="Email" htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<MailIcon />}
              placeholder="you@company.com"
              aria-invalid={error ? true : undefined}
            />
          </Field>
          <Field label="Password" htmlFor="login-password">
            <PasswordInput id="login-password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" aria-invalid={error ? true : undefined} />
          </Field>
          <Button type="submit" loading={busy} disabled={!email.trim() || !password} className="w-full">
            Sign in
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-xs text-muted-foreground">No account? Ask an administrator to create one for you.</p>
    </AuthLayout>
  );
}
