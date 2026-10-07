import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/app-shell";
import { Alert } from "@/components/ui/alert";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { LockIcon, PlusIcon, ShieldIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Segmented } from "@/components/ui/segmented";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { consoleApi } from "@/lib/console";
import { ago } from "@/lib/gstin";

const EXPIRY = [
  { value: "never", label: "Never" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "1 year" },
];
const MEMBER_MAX = { rate: 60, quota: 1000 }; // mirrors the server's allowance; the server enforces it
const statusBadge = (s) => (s === "active" ? "success" : s === "revoked" ? "danger" : "warning");

function NewKeyReveal({ created, onDone }) {
  return (
    <Card className="mb-5 border-success/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldIcon className="size-4 text-success" /> Key “{created.name}” created
        </CardTitle>
        <CardDescription>Copy it now. For your safety only a hash is stored, so it cannot be shown again.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex items-center gap-2 rounded-lg border bg-muted p-2.5">
          <code className="min-w-0 flex-1 break-all font-mono text-sm">{created.key}</code>
          <CopyButton value={created.key} />
        </div>
        <pre className="overflow-x-auto rounded-md border bg-muted p-3 font-mono text-xs">{`curl ${location.origin}/v1/gstin/27AANFN6948F1ZR \\\n  -H "Authorization: Bearer ${created.key}"`}</pre>
        <div>
          <Button variant="outline" size="sm" onClick={onDone}>I have saved it</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateKey({ isAdmin, team, onCreate, onCancel, busy, error }) {
  const [name, setName] = useState("");
  const [rate, setRate] = useState("60");
  const [quota, setQuota] = useState("1000");
  const [expiry, setExpiry] = useState("never");
  const [owner, setOwner] = useState("me");

  const submit = (e) => {
    e.preventDefault();
    const body = { name: name.trim(), rate_limit_per_min: Number(rate), monthly_quota: quota.trim() === "" ? null : Number(quota) };
    if (expiry !== "never") body.expires_at = Date.now() + Number(expiry) * 86_400_000;
    if (owner !== "me") body.owner_id = owner === "none" ? null : owner;
    onCreate(body);
  };

  return (
    <Card className="mb-5">
      <CardHeader>
        <CardTitle className="text-base">New API key</CardTitle>
        <CardDescription>
          {isAdmin ? "One key per app or customer keeps usage readable and revoking safe." : `Members can create keys up to ${MEMBER_MAX.rate} requests a minute and ${MEMBER_MAX.quota} lookups a month. Ask an admin for more.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4">
          {error && <Alert variant="danger" title={error} />}
          <Field label="Name" htmlFor="key-name" hint="For example: billing-service, acme-corp" required>
            <Input id="key-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Requests per minute" htmlFor="key-rate" hint="Sliding window, per key">
              <Input id="key-rate" type="number" inputMode="numeric" min={1} max={isAdmin ? 6000 : MEMBER_MAX.rate} value={rate} onChange={(e) => setRate(e.target.value)} />
            </Field>
            <Field label="Monthly quota" htmlFor="key-quota" hint={isAdmin ? "Successful lookups per UTC month. Empty = unlimited" : "Successful lookups per UTC month"}>
              <Input id="key-quota" type="number" inputMode="numeric" min={1} max={isAdmin ? undefined : MEMBER_MAX.quota} value={quota} onChange={(e) => setQuota(e.target.value)} placeholder={isAdmin ? "Unlimited" : ""} />
            </Field>
          </div>
          <Field label="Expires">
            <Segmented value={expiry} onValueChange={setExpiry} options={EXPIRY} className="flex-wrap" />
          </Field>
          {isAdmin && team.length > 0 && (
            <Field label="Owner" hint="Members only ever see the keys they own.">
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="me">Me</SelectItem>
                  {team.filter((u) => !u.disabled).map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                  ))}
                  <SelectItem value="none">No owner (shared)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
          <div className="flex gap-2">
            <Button type="submit" loading={busy} disabled={!name.trim()}>Create key</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Usage({ k }) {
  const pct = k.monthly_quota ? Math.min(100, Math.round((k.used_this_month / k.monthly_quota) * 100)) : 0;
  return (
    <div className="grid gap-1">
      <span className="text-xs tabular-nums">
        {k.used_this_month}
        {k.monthly_quota != null && ` / ${k.monthly_quota}`}
      </span>
      {k.monthly_quota != null && <Progress value={pct} tone={pct >= 90 ? "danger" : pct >= 70 ? "warning" : "primary"} />}
    </div>
  );
}

export default function Keys() {
  const { isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const [keys, setKeys] = useState(null);
  const [team, setTeam] = useState([]);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(params.get("new") === "1");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [created, setCreated] = useState(null);
  const [toRevoke, setToRevoke] = useState(null);

  const load = useCallback(async () => {
    const r = await consoleApi.keys();
    if (!r.ok) return setError(r.error?.message ?? "Could not load keys.");
    setError("");
    setKeys(r.json.data);
  }, []);
  useEffect(() => {
    load();
    if (isAdmin) consoleApi.users().then((r) => r.ok && setTeam(r.json.data));
  }, [load, isAdmin]);

  const closeCreate = () => {
    setShowCreate(false);
    if (params.has("new")) setParams({}, { replace: true });
  };

  async function create(body) {
    setCreating(true);
    setCreateError("");
    const r = await consoleApi.createKey(body);
    setCreating(false);
    if (!r.ok) return setCreateError(r.error?.message ?? "Could not create the key.");
    setCreated(r.json.data);
    closeCreate();
    load();
  }

  async function revoke(k) {
    const r = await consoleApi.revokeKey(k.id);
    if (!r.ok) setError(r.error?.message ?? "Could not revoke the key.");
    load();
  }

  return (
    <>
      <PageHeader
        title="API keys"
        description={isAdmin ? "Every key in the workspace. The full key is shown once, when it is created." : "Your keys. The full key is shown once, when it is created."}
        actions={
          <Button onClick={() => { setCreated(null); setShowCreate(true); }}>
            <PlusIcon /> New key
          </Button>
        }
      />
      {error && <Alert variant="danger" title={error} className="mb-5" />}
      {created && <NewKeyReveal created={created} onDone={() => setCreated(null)} />}
      {showCreate && <CreateKey isAdmin={isAdmin} team={team} onCreate={create} onCancel={closeCreate} busy={creating} error={createError} />}

      {!keys ? (
        <Skeleton className="h-40" />
      ) : keys.length === 0 ? (
        <EmptyState icon={<LockIcon />} title="No keys yet" description="Create a key to start calling the API from your own code." action={<Button onClick={() => setShowCreate(true)}><PlusIcon /> Create your first key</Button>} />
      ) : (
        <>
          {/* phones: one card per key */}
          <div className="grid gap-3 md:hidden">
            {keys.map((k) => (
              <Card key={k.id} className="grid gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{k.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{k.key_preview}</p>
                  </div>
                  <Badge variant={statusBadge(k.status)} dot>{k.status}</Badge>
                </div>
                <Usage k={k} />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{k.rate_limit_per_min}/min · {k.monthly_quota == null ? "unlimited" : `${k.monthly_quota}/mo`}</span>
                  <span>{k.last_used_at ? `used ${ago(k.last_used_at)}` : "never used"}</span>
                </div>
                {isAdmin && <p className="text-xs text-muted-foreground">Owner: {k.owner_name ?? "shared"}</p>}
                {k.status === "active" && (
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => setToRevoke(k)}>Revoke</Button>
                )}
              </Card>
            ))}
          </div>

          {/* tablets and up: a table */}
          <Card className="hidden md:block">
            <CardContent className="px-0 py-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    {isAdmin && <TableHead>Owner</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead>Limits</TableHead>
                    <TableHead className="min-w-36">This month</TableHead>
                    <TableHead>Last used</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{k.key_preview}</TableCell>
                      {isAdmin && <TableCell className="max-w-36 truncate text-muted-foreground">{k.owner_name ?? "shared"}</TableCell>}
                      <TableCell><Badge variant={statusBadge(k.status)} dot>{k.status}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{k.rate_limit_per_min}/min · {k.monthly_quota == null ? "unlimited" : `${k.monthly_quota}/mo`}</TableCell>
                      <TableCell><Usage k={k} /></TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{k.last_used_at ? ago(k.last_used_at) : "never"}</TableCell>
                      <TableCell className="text-right">
                        {k.status === "active" && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setToRevoke(k)}>Revoke</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <AlertDialog
        open={!!toRevoke}
        onOpenChange={(o) => !o && setToRevoke(null)}
        title={`Revoke “${toRevoke?.name}”?`}
        description="Anything using this key stops working immediately. This cannot be undone."
        confirmLabel="Revoke key"
        destructive
        onConfirm={() => revoke(toRevoke)}
      />
    </>
  );
}
