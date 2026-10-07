import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LockIcon, MailIcon, UserIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuth } from "@/lib/auth";
import { AuthLayout } from "@/layout/AuthLayout";

/** Shown once, while the system has no accounts. Claiming it needs the server's setup (admin) token. */
export default function Setup() {
  const auth = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ setup_token: "", name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [field, setField] = useState("");

  if (auth.status === "anon") return <Navigate to="/login" replace />;
  if (auth.status === "authed") return <Navigate to="/overview" replace />;
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setField("");
    setBusy(true);
    const r = await auth.setup({ ...f, email: f.email.trim(), name: f.name.trim() });
    setBusy(false);
    if (r.ok) nav("/overview", { replace: true });
    else {
      setError(r.error?.message ?? "Could not create the account.");
      setField(r.error?.details?.field ?? (r.error?.code === "invalid_setup_token" ? "setup_token" : ""));
    }
  }

  return (
    <AuthLayout>
      <Card className="p-6">
        <div className="mb-6 grid gap-1">
          <h1 className="text-lg font-semibold tracking-tight">Welcome. Let's set up your workspace.</h1>
          <p className="text-[13px] text-muted-foreground">Create the first administrator. This screen disappears once an account exists.</p>
        </div>
        <form onSubmit={submit} className="grid gap-4" noValidate>
          {error && <Alert variant="danger" title={error} />}
          <Field
            label="Setup token"
            htmlFor="setup-token"
            hint="Printed when the server first started, and saved in server/data/admin-token (or your ADMIN_TOKEN)."
          >
            <PasswordInput id="setup-token" autoComplete="off" value={f.setup_token} onChange={set("setup_token")} aria-invalid={field === "setup_token" || undefined} className="font-mono" />
          </Field>
          <Field label="Your name" htmlFor="setup-name">
            <Input id="setup-name" autoComplete="name" value={f.name} onChange={set("name")} leftIcon={<UserIcon />} aria-invalid={field === "name" || undefined} />
          </Field>
          <Field label="Email" htmlFor="setup-email">
            <Input id="setup-email" type="email" autoComplete="username" value={f.email} onChange={set("email")} leftIcon={<MailIcon />} aria-invalid={field === "email" || undefined} />
          </Field>
          <Field label="Password" htmlFor="setup-password" hint="At least 10 characters.">
            <PasswordInput id="setup-password" meter autoComplete="new-password" value={f.password} onChange={set("password")} aria-invalid={field === "password" || undefined} />
          </Field>
          <Button type="submit" loading={busy} disabled={!f.setup_token || !f.name.trim() || !f.email.trim() || f.password.length < 10} className="w-full">
            <LockIcon /> Create administrator
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
