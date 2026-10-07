import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/app-shell";
import { Alert } from "@/components/ui/alert";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EyeIcon, LockIcon, MoreIcon, PlusIcon, ShieldIcon, UsersIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { consoleApi } from "@/lib/console";
import { ago } from "@/lib/gstin";

function TempPassword({ info, onClose }) {
  return (
    <Dialog open={!!info} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{info?.title}</DialogTitle>
          <DialogDescription>Share this temporary password securely. It is shown only now, and {info?.name} must replace it at first sign-in.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border bg-muted p-2.5">
          <code className="min-w-0 flex-1 break-all font-mono text-sm">{info?.password}</code>
          <CopyButton value={info?.password ?? ""} />
        </div>
        {info?.email && <p className="text-xs text-muted-foreground">Sign-in: <span className="font-mono">{info.email}</span></p>}
        <DialogFooter><Button onClick={onClose}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateUser({ open, onOpenChange, onCreated }) {
  const [f, setF] = useState({ name: "", email: "", role: "member", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [custom, setCustom] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await consoleApi.createUser({ name: f.name.trim(), email: f.email.trim(), role: f.role, ...(custom && f.password ? { password: f.password } : {}) });
    setBusy(false);
    if (!r.ok) return setError(r.error?.message ?? "Could not create the account.");
    setF({ name: "", email: "", role: "member", password: "" });
    setCustom(false);
    onOpenChange(false);
    onCreated(r.json);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add a team member</DialogTitle>
          <DialogDescription>They sign in with a temporary password and choose their own at first sign-in.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          {error && <Alert variant="danger" title={error} />}
          <Field label="Name" htmlFor="u-name" required><Input id="u-name" value={f.name} onChange={set("name")} autoFocus /></Field>
          <Field label="Email" htmlFor="u-email" required><Input id="u-email" type="email" value={f.email} onChange={set("email")} /></Field>
          <Field label="Role" hint={f.role === "admin" ? "Admins manage the team and see every key." : "Members use Verify and manage their own keys."}>
            <Segmented value={f.role} onValueChange={(v) => setF((s) => ({ ...s, role: v }))} options={[{ value: "member", label: "Member" }, { value: "admin", label: "Admin" }]} />
          </Field>
          {custom ? (
            <Field label="Temporary password" htmlFor="u-pw" hint="At least 10 characters."><Input id="u-pw" className="font-mono" value={f.password} onChange={set("password")} /></Field>
          ) : (
            <button type="button" className="justify-self-start text-[13px] text-primary hover:underline" onClick={() => setCustom(true)}>Set the temporary password myself</button>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" loading={busy} disabled={!f.name.trim() || !f.email.trim() || (custom && f.password.length < 10)}>Create account</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Team() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [temp, setTemp] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind: 'disable'|'reset', user }

  const load = useCallback(async () => {
    const r = await consoleApi.users();
    if (!r.ok) return setError(r.error?.message ?? "Could not load the team.");
    setError("");
    setUsers(r.json.data);
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function patch(u, body) {
    const r = await consoleApi.updateUser(u.id, body);
    if (!r.ok) setError(r.error?.message ?? "Could not update that account.");
    else setError("");
    load();
  }
  async function reset(u) {
    const r = await consoleApi.resetPassword(u.id);
    if (!r.ok) return setError(r.error?.message ?? "Could not reset the password.");
    setTemp({ title: `Password reset for ${u.name}`, name: u.name, email: u.email, password: r.json.temporary_password });
    load();
  }

  const menu = (u) => {
    const self = u.id === me?.id;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${u.name}`}><MoreIcon /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem disabled={self} onSelect={() => patch(u, { role: u.role === "admin" ? "member" : "admin" })}>
            <ShieldIcon /> {u.role === "admin" ? "Make member" : "Make admin"}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setConfirm({ kind: "reset", user: u })}><LockIcon /> Reset password</DropdownMenuItem>
          <DropdownMenuSeparator />
          {u.disabled ? (
            <DropdownMenuItem onSelect={() => patch(u, { disabled: false })}><EyeIcon /> Enable account</DropdownMenuItem>
          ) : (
            <DropdownMenuItem destructive disabled={self} onSelect={() => setConfirm({ kind: "disable", user: u })}><UsersIcon /> Disable account</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const badges = (u) => (
    <>
      <Badge variant={u.role === "admin" ? "primary" : "default"}>{u.role}</Badge>
      {u.disabled ? <Badge variant="danger" dot>disabled</Badge> : u.must_change_password ? <Badge variant="warning" dot>invited</Badge> : <Badge variant="success" dot>active</Badge>}
    </>
  );

  return (
    <>
      <PageHeader title="Team" description="Everyone who can sign in. There is no open sign-up: you create each account." actions={<Button onClick={() => setAdding(true)}><PlusIcon /> Add member</Button>} />
      {error && <Alert variant="danger" title={error} className="mb-5" />}

      {!users ? <Skeleton className="h-40" /> : (
        <>
          <div className="grid gap-3 md:hidden">
            {users.map((u) => (
              <Card key={u.id} className="flex items-center gap-3 p-4">
                <Avatar name={u.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{u.name}{u.id === me?.id && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">{badges(u)}</div>
                </div>
                {menu(u)}
              </Card>
            ))}
          </div>
          <Card className="hidden md:block">
            <CardContent className="px-0 py-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Member</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Last sign-in</TableHead><TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{u.name}{u.id === me?.id && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}</p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant={u.role === "admin" ? "primary" : "default"}>{u.role}</Badge></TableCell>
                      <TableCell>{u.disabled ? <Badge variant="danger" dot>disabled</Badge> : u.must_change_password ? <Badge variant="warning" dot>invited</Badge> : <Badge variant="success" dot>active</Badge>}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{u.last_login_at ? ago(u.last_login_at) : "never"}</TableCell>
                      <TableCell className="text-right">{menu(u)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <CreateUser open={adding} onOpenChange={setAdding} onCreated={(r) => { setTemp({ title: `${r.data.name} was added`, name: r.data.name, email: r.data.email, password: r.temporary_password }); load(); }} />
      <TempPassword info={temp} onClose={() => setTemp(null)} />
      <AlertDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.kind === "disable" ? `Disable ${confirm?.user.name}?` : `Reset ${confirm?.user.name}'s password?`}
        description={confirm?.kind === "disable" ? "They are signed out everywhere immediately and cannot sign in again until you enable the account. Their API keys keep working until you revoke them." : "They are signed out everywhere and must use a new temporary password. You will see it once."}
        confirmLabel={confirm?.kind === "disable" ? "Disable account" : "Reset password"}
        destructive
        onConfirm={() => (confirm.kind === "disable" ? patch(confirm.user, { disabled: true }) : reset(confirm.user))}
      />
    </>
  );
}
