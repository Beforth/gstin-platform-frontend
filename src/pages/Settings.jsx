import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/app-shell";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { consoleApi } from "@/lib/console";
import { ago } from "@/lib/gstin";
import { useTheme } from "@/lib/theme";

function Password() {
  const { changePassword } = useAuth();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const mismatch = again && next !== again;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await changePassword(cur, next);
    setBusy(false);
    if (r.ok) {
      setMsg({ ok: true, text: "Password changed. Your other devices were signed out." });
      setCur(""); setNext(""); setAgain("");
    } else setMsg({ ok: false, text: r.error?.message ?? "Could not change the password." });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Password</CardTitle>
        <CardDescription>Changing it signs you out of every other device.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid max-w-md gap-4">
          {msg && <Alert variant={msg.ok ? "success" : "danger"} title={msg.text} />}
          <Field label="Current password" htmlFor="s-cur"><PasswordInput id="s-cur" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} /></Field>
          <Field label="New password" htmlFor="s-new" hint="At least 10 characters."><PasswordInput id="s-new" meter autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
          <Field label="Repeat new password" htmlFor="s-again" error={mismatch ? "The passwords do not match." : undefined}><PasswordInput id="s-again" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} aria-invalid={mismatch || undefined} /></Field>
          <div><Button type="submit" loading={busy} disabled={!cur || next.length < 10 || next !== again}>Change password</Button></div>
        </form>
      </CardContent>
    </Card>
  );
}

function Sessions() {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = () => consoleApi.sessions().then((r) => r.ok && setRows(r.json.data));
  useEffect(() => { load(); }, []);

  const browser = (ua = "") => (/Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser") + (/Mobile|Android|iPhone/.test(ua) ? " on mobile" : "");

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="grid gap-1">
          <CardTitle className="text-base">Where you are signed in</CardTitle>
          <CardDescription>Sessions last 7 days from your last activity.</CardDescription>
        </div>
        {rows && rows.length > 1 && (
          <Button variant="outline" size="sm" loading={busy} onClick={async () => { setBusy(true); await consoleApi.signOutOthers(); await load(); setBusy(false); }}>Sign out other devices</Button>
        )}
      </CardHeader>
      <CardContent className="grid gap-2">
        {(rows ?? []).map((s, i) => (
          <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-[13px]">
            <div className="min-w-0">
              <p className="font-medium">{browser(s.user_agent)} {s.current && <Badge variant="success" className="ml-1.5">this device</Badge>}</p>
              <p className="text-xs text-muted-foreground">{s.ip ?? "unknown address"} · active {ago(s.last_seen_at)}</p>
            </div>
          </div>
        ))}
        {rows && rows.length === 0 && <p className="text-[13px] text-muted-foreground">No sessions to show.</p>}
      </CardContent>
    </Card>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [dark, setDark] = useTheme();
  return (
    <>
      <PageHeader title="Settings" description="Your profile, password and sessions." />
      <div className="grid gap-5">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-4 p-5">
            <Avatar name={user.name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold">{user.name}</p>
              <p className="truncate text-[13px] text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant={user.role === "admin" ? "primary" : "default"}>{user.role}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="grid gap-0.5">
              <p className="text-sm font-medium">Dark mode</p>
              <p className="text-[13px] text-muted-foreground">Remembered on this browser.</p>
            </div>
            <Switch checked={dark} onCheckedChange={setDark} aria-label="Dark mode" />
          </CardContent>
        </Card>
        <Password />
        <Sessions />
      </div>
    </>
  );
}
