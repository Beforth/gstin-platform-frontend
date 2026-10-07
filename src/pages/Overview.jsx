import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/app-shell";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, DonutChart, Sparkline } from "@/components/ui/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { Gauge } from "@/components/ui/gauge";
import { BarChartIcon, CheckCircleIcon, ClockIcon, LockIcon, PlusIcon, ShieldIcon, TrendingIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/lib/auth";
import { consoleApi } from "@/lib/console";
import { RequestsTable } from "@/widgets/RequestsTable";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};
const SOURCE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#06b6d4"];

function Step({ done, title, to, children }) {
  return (
    <li className="flex gap-3">
      <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${done ? "border-success bg-success/10 text-success" : "text-muted-foreground"}`}>
        {done ? <CheckCircleIcon className="size-3.5" /> : null}
      </span>
      <div className="grid gap-0.5">
        <Link to={to} className="text-[13px] font-medium hover:underline">{title}</Link>
        <p className="text-xs text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}

export default function Overview() {
  const { user, isAdmin } = useAuth();
  const nav = useNavigate();
  const [d, setD] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    consoleApi.overview(14).then((r) => (r.ok ? setD(r.json.data) : setError(r.error?.message ?? "Could not load the dashboard.")));
  }, []);

  const first = (user?.name ?? "").split(" ")[0] || "there";
  const t = d?.totals;
  const reqs = d?.daily.map((x) => x.requests) ?? [];
  const bill = d?.daily.map((x) => x.billable) ?? [];
  const okRate = t?.requests ? Math.round((t.ok / t.requests) * 100) : null;
  const savedRate = t?.requests ? Math.round((t.cached / t.requests) * 100) : null;
  const q = d?.quota;
  const pct = q?.limit ? Math.min(100, (q.used / q.limit) * 100) : 0;
  const spark = (a) => (a.some((v) => v > 0) ? <Sparkline data={a.length > 1 ? a : [0, 0]} /> : undefined);

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${first}`}
        description={d ? (d.scope === "all" ? "Everything across your workspace, last 14 days." : "Your keys and requests, last 14 days.") : "Loading your workspace…"}
        actions={
          <>
            <Button variant="outline" onClick={() => nav("/verify")}>
              <ShieldIcon /> Verify a GSTIN
            </Button>
            <Button onClick={() => nav("/keys?new=1")}>
              <PlusIcon /> New API key
            </Button>
          </>
        }
      />

      {error && <Alert variant="danger" title={error} className="mb-5" />}

      {d && d.keys.active === 0 && (
        <Card className="mb-5 border-primary/30 bg-primary/[0.03]">
          <CardHeader>
            <CardTitle className="text-base">Get started</CardTitle>
            <CardDescription>Three steps to your first verified GSTIN from code.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-4 sm:grid-cols-3">
              <Step done={d.keys.total > 0} to="/keys?new=1" title="Create an API key">Each key has its own limits and can be revoked.</Step>
              <Step done={(t?.requests ?? 0) > 0} to="/docs" title="Make your first request">Copy a curl, JavaScript or Python snippet.</Step>
              <Step done={false} to="/usage" title="Watch it appear here">Requests, sources and response times show up live.</Step>
            </ol>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Requests" value={t ? t.requests : "…"} icon={<BarChartIcon />} chart={d ? spark(reqs) : undefined} />
        <StatCard label="Billable lookups" value={t ? t.billable : "…"} icon={<TrendingIcon />} chart={d ? spark(bill) : undefined} />
        <StatCard label="Success rate" value={okRate == null ? "—" : `${okRate}%`} icon={<ShieldIcon />} />
        <StatCard label="Avg response" value={t?.requests ? `${Math.round(t.avg_latency_ms)} ms` : "—"} icon={<ClockIcon />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Requests per day</CardTitle>
            <CardDescription>Last 14 days (UTC)</CardDescription>
          </CardHeader>
          <CardContent>{d ? <BarChart data={d.daily.map((x) => ({ label: x.day.slice(8), value: x.requests }))} height={150} /> : <Skeleton className="h-40" />}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly quota</CardTitle>
            <CardDescription>{q?.limit ? "Successful lookups this month" : q?.unlimited ? "Unlimited on your active keys" : "Resets on the 1st (UTC)"}</CardDescription>
          </CardHeader>
          <CardContent className="grid place-items-center gap-2">
            {!d ? (
              <Skeleton className="h-32 w-full" />
            ) : d.keys.active === 0 ? (
              <EmptyState className="w-full border-0 py-4" icon={<LockIcon />} title="No active key" description="Create a key to start using your quota." />
            ) : (
              <>
                <Gauge value={q.limit ? q.used : 0} max={q.limit ?? 1} tone={pct >= 90 ? "danger" : pct >= 70 ? "warning" : "primary"} size={190} />
                <p className="text-center text-[13px] text-muted-foreground">
                  {q.limit ? (
                    <>
                      <b className="text-foreground">{q.used}</b> of {q.limit} used
                    </>
                  ) : (
                    <>
                      <b className="text-foreground">{q.used}</b> lookups this month
                    </>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Where answers came from</CardTitle>
            <CardDescription>{savedRate == null ? "No requests yet" : `${savedRate}% served from saved results`}</CardDescription>
          </CardHeader>
          <CardContent>
            {!d ? (
              <Skeleton className="h-28" />
            ) : d.by_source.length === 0 ? (
              <EmptyState className="border-0 py-6" icon={<BarChartIcon />} title="Nothing yet" />
            ) : (
              <DonutChart size={104} thickness={12} data={d.by_source.map((s, i) => ({ label: s.source, value: s.requests, color: SOURCE_COLORS[i % SOURCE_COLORS.length] }))} centerLabel={<span className="text-lg font-semibold tabular-nums">{t.requests}</span>} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div className="grid gap-1">
              <CardTitle className="text-base">Recent activity</CardTitle>
              <CardDescription>Latest calls made with API keys</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => nav("/usage")}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {!d ? (
              <div className="px-5 pb-3"><Skeleton className="h-32" /></div>
            ) : d.recent.length === 0 ? (
              <EmptyState className="mx-5 mb-3 py-8" icon={<BarChartIcon />} title="No requests yet" description="Calls made with a key will appear here." />
            ) : (
              <RequestsTable rows={d.recent} showKey={isAdmin} compact />
            )}
          </CardContent>
        </Card>
      </div>

      {d && (
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Card className="flex items-center gap-3 p-4">
            <Badge variant="success" dot>{d.api.status}</Badge>
            <p className="text-[13px] text-muted-foreground">API <b className="text-foreground">{d.api.version}</b> · revision <span className="font-mono">{d.api.revision}</span></p>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <p className="text-[13px] text-muted-foreground"><b className="text-foreground">{d.saved.gstins}</b> GSTINs saved · <b className="text-foreground">{d.saved.cache_hits}</b> repeat lookups served</p>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <p className="text-[13px] text-muted-foreground">
              <b className="text-foreground">{d.keys.active}</b> active key{d.keys.active === 1 ? "" : "s"} of {d.keys.total}
              {d.team ? <> · <b className="text-foreground">{d.team.users}</b> team member{d.team.users === 1 ? "" : "s"}</> : null}
            </p>
          </Card>
        </div>
      )}
    </>
  );
}
