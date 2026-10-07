import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart } from "@/components/ui/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { BookmarkIcon, CheckCircleIcon, ClockIcon, GlobeIcon, ListIcon, XCircleIcon } from "@/components/ui/icons";
import { ProgressRing } from "@/components/ui/progress-ring";
import { StatCard } from "@/components/ui/stat-card";
import { Timeline } from "@/components/ui/timeline";
import { ago, cleanName } from "@/lib/gstin";
import { CAPTCHA_SOURCES, outcomeBadge, PROVIDER_NAMES } from "./shared";

const FIELDS = [
  ["Legal name", (d) => d.legal_name],
  ["Trade name", (d) => d.trade_name],
  ["Status", (d) => d.status],
  ["Registration date", (d) => d.registration_date],
  ["Constitution", (d) => d.constitution],
  ["Business activities", (d) => d.business_activities?.length],
  ["Address", (d) => d.address],
  ["City", (d) => d.city],
  ["State", (d) => d.state],
  ["Pincode", (d) => d.pincode],
  ["Centre jurisdiction", (d) => d.center_jurisdiction],
  ["State jurisdiction", (d) => d.state_jurisdiction],
  ["Reference id", (d) => d.reference_id],
  ["Last updated", (d) => d.last_update_date],
];

export function Completeness({ data }) {
  const missing = FIELDS.filter(([, get]) => !get(data)).map(([label]) => label);
  const pct = Math.round(((FIELDS.length - missing.length) / FIELDS.length) * 100);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data completeness</CardTitle>
        <CardDescription>How much this source returned</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <ProgressRing value={pct} size={84} />
        <div className="min-w-0 text-[13px]">
          {missing.length ? (
            <>
              <p className="text-muted-foreground">Missing</p>
              <p className="break-words">{missing.join(", ")}</p>
            </>
          ) : (
            <p className="text-muted-foreground">Every tracked field is present.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function Trail({ items, title = "Verification trail" }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>What happened behind this result</CardDescription>
      </CardHeader>
      <CardContent>
        <Timeline items={items} />
      </CardContent>
    </Card>
  );
}

/** Build trail entries from a gateway response. */
export function trailFor(result) {
  const items = [{ title: "Format checked locally", description: "15 characters, state code numeric", tone: "success", icon: <CheckCircleIcon /> }];
  if (result.cached) {
    items.push({
      title: "Served from saved results",
      description: `Originally fetched ${ago(result.fetched_at)}${result.provider ? ` from ${PROVIDER_NAMES[result.provider] ?? result.provider}` : ""}`,
      tone: "info",
      icon: <BookmarkIcon />,
    });
  } else {
    for (const a of result.attempts ?? []) {
      items.push({
        title: `${PROVIDER_NAMES[a.provider] ?? a.provider} ${a.ok ? "answered" : "failed"}`,
        description: a.ok ? (CAPTCHA_SOURCES.includes(a.provider) ? "Read from the site after your CAPTCHA" : "Live call to the provider") : `${a.error}: ${a.message}`,
        tone: a.ok ? "success" : "danger",
        icon: a.ok ? <GlobeIcon /> : <XCircleIcon />,
      });
    }
    if (result.provider) items.push({ title: "Result saved", description: "Stored for faster repeat lookups", tone: "default", icon: <BookmarkIcon /> });
  }
  return items;
}

export function LibraryStats({ stats }) {
  if (!stats) return null;
  const donut = (stats.by_outcome ?? []).map((o) => ({
    label: o.outcome.replace("_", " "),
    value: o.n,
    color: o.outcome === "active" ? "#10b981" : o.outcome === "not_registered" ? "#f43f5e" : "#f59e0b",
  }));
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Saved GSTINs" value={stats.gstins} icon={<ListIcon />} />
        <StatCard label="Served saved" value={stats.cache_hits} icon={<ClockIcon />} />
      </div>
      {donut.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved by outcome</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={donut}
              size={104}
              thickness={12}
              centerLabel={<span className="text-lg font-semibold tabular-nums">{stats.gstins}</span>}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function Recent({ items, onPick, activeGstin }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent lookups</CardTitle>
        <CardDescription>Click one to open the saved result</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        {!items?.length ? (
          <EmptyState
            className="mx-3 mb-3 py-8"
            icon={<ListIcon />}
            title="Nothing saved yet"
            description="Verified GSTINs will show up here."
          />
        ) : (
          <ul className="grid">
            {items.map((r) => {
              const name = cleanName(r.trade_name || r.legal_name) || r.gstin;
              return (
                <li key={r.gstin}>
                  <button
                    type="button"
                    onClick={() => onPick(r.gstin)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 ${activeGstin === r.gstin ? "bg-accent" : ""}`}
                  >
                    <Avatar name={name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{name}</span>
                      <span className="block truncate font-mono text-[11px] text-muted-foreground">
                        {r.gstin} · {ago(r.fetched_at)}
                      </span>
                    </span>
                    <Badge variant={outcomeBadge(r.outcome)}>{r.status || r.outcome.replace("_", " ")}</Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
