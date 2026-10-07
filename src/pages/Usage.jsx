import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/app-shell";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, DonutChart } from "@/components/ui/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChartIcon, ClockIcon, ShieldIcon, TrendingIcon } from "@/components/ui/icons";
import { Segmented } from "@/components/ui/segmented";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/lib/auth";
import { consoleApi } from "@/lib/console";
import { RequestsTable } from "@/widgets/RequestsTable";

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#06b6d4"];

export default function Usage() {
  const { isAdmin } = useAuth();
  const [days, setDays] = useState("14");
  const [keyId, setKeyId] = useState("all");
  const [keys, setKeys] = useState([]);
  const [u, setU] = useState(null);
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    consoleApi.keys().then((r) => r.ok && setKeys(r.json.data));
  }, []);

  useEffect(() => {
    setU(null);
    setRows(null);
    const k = keyId === "all" ? undefined : keyId;
    Promise.all([consoleApi.usage(Number(days), k), consoleApi.requests(50, k)]).then(([a, b]) => {
      if (!a.ok) return setError(a.error?.message ?? "Could not load usage.");
      setError("");
      setU(a.json.data);
      setRows(b.json?.data ?? []);
    });
  }, [days, keyId]);

  const t = u?.totals;
  const okRate = t?.requests ? Math.round((t.ok / t.requests) * 100) : null;
  const saved = t?.requests ? Math.round((t.cached / t.requests) * 100) : null;
  // 90 daily bars are too dense on a phone: label every Nth day only.
  const labelEvery = days === "90" ? 10 : days === "30" ? 5 : 1;

  return (
    <>
      <PageHeader title="Usage" description={isAdmin ? "Requests across the workspace." : "Requests made with your keys."} />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented value={days} onValueChange={setDays} options={RANGES} className="flex-wrap" />
        <Select value={keyId} onValueChange={setKeyId}>
          <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All keys</SelectItem>
            {keys.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}{k.status !== "active" ? ` (${k.status})` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {error && <Alert variant="danger" title={error} className="mb-5" />}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Requests" value={t ? t.requests : "…"} icon={<BarChartIcon />} />
        <StatCard label="Billable lookups" value={t ? t.billable : "…"} icon={<TrendingIcon />} />
        <StatCard label="Success rate" value={okRate == null ? "—" : `${okRate}%`} icon={<ShieldIcon />} />
        <StatCard label="Served from saved" value={saved == null ? "—" : `${saved}%`} icon={<ClockIcon />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Requests per day</CardTitle>
            <CardDescription>UTC days</CardDescription>
          </CardHeader>
          <CardContent>
            {u ? (
              <BarChart data={u.daily.map((d, i) => ({ label: i % labelEvery === 0 ? d.day.slice(5) : "", value: d.requests }))} height={160} />
            ) : (
              <Skeleton className="h-44" />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By source</CardTitle>
            <CardDescription>Who answered</CardDescription>
          </CardHeader>
          <CardContent>
            {!u ? <Skeleton className="h-28" /> : u.by_source.length === 0 ? <EmptyState className="border-0 py-6" icon={<BarChartIcon />} title="No data" /> : (
              <DonutChart size={100} thickness={12} data={u.by_source.map((s, i) => ({ label: s.source, value: s.requests, color: COLORS[i % COLORS.length] }))} centerLabel={<span className="text-lg font-semibold tabular-nums">{t.requests}</span>} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Request log</CardTitle>
          <CardDescription>The latest 50 calls</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {!rows ? (
            <div className="px-5 pb-3"><Skeleton className="h-40" /></div>
          ) : rows.length === 0 ? (
            <EmptyState className="mx-5 mb-3 py-8" icon={<BarChartIcon />} title="No requests" description="Nothing matches this filter yet." />
          ) : (
            <RequestsTable rows={rows} showKey />
          )}
        </CardContent>
      </Card>
    </>
  );
}
