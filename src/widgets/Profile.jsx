import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible } from "@/components/ui/collapsible";
import { CopyButton } from "@/components/ui/copy-button";
import { CalendarIcon, ClockIcon, FileIcon, RefreshIcon, ShieldIcon } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ago, yearsSince } from "@/lib/gstin";
import { Item, OUTCOMES, outcomeBadge, show } from "./shared";

function Fact({ icon, label, value, sub }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
      <span className="mt-0.5 text-muted-foreground [&_svg]:size-4">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export function Profile({ result, onRefresh, refreshing }) {
  const meta = OUTCOMES[result.outcome] || OUTCOMES.unknown;
  const d = result.data;

  // No profile to show (not registered, invalid, provider trouble): explain it clearly.
  if (!d) {
    return (
      <Card>
        <CardContent className="grid gap-3 p-5">
          <Alert variant={meta.variant} title={meta.title}>
            {result.message}
          </Alert>
          {result.raw && (
            <Collapsible title="Raw provider response">
              <pre className="max-h-64 overflow-auto rounded-md border bg-muted p-3 font-mono text-xs text-foreground">
                {JSON.stringify(result.raw, null, 2)}
              </pre>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    );
  }

  const name = d.trade_name || d.legal_name || d.gstin;
  const age = yearsSince(d.registration_date);

  return (
    <Card>
      <CardContent className="grid gap-5 p-5">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={name.replace(/^M\/s\s*/i, "")} size="lg" className="rounded-xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold tracking-tight">{name}</h2>
              <Badge variant={outcomeBadge(result.outcome)} dot>
                {show(d.status)}
              </Badge>
            </div>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">{d.gstin}</span>
              <CopyButton value={d.gstin} className="size-6" />
              <span>·</span>
              <span>{[d.city, d.state].filter(Boolean).join(", ") || "Location not available"}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh} loading={refreshing}>
            {!refreshing && <RefreshIcon />}
            Refresh
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Fact
            icon={<CalendarIcon />}
            label="Registered"
            value={show(d.registration_date)}
            sub={age ? `${age} ago` : null}
          />
          <Fact icon={<ShieldIcon />} label="Taxpayer type" value={show(d.registration_type)} />
          <Fact icon={<FileIcon />} label="Constitution" value={show(d.constitution)} />
          <Fact
            icon={<ClockIcon />}
            label="Provider data as of"
            value={show(d.last_update_date)}
            sub={d.last_update_date ? null : "Not provided by this source"}
          />
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="jurisdiction">Jurisdiction</TabsTrigger>
            <TabsTrigger value="raw">Raw data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Item label="Legal name">
                {show(d.legal_name)}
                {d.provider === "tally" && (
                  <Badge variant="outline" className="ml-2 align-middle">
                    M/s prefix, not authoritative
                  </Badge>
                )}
              </Item>
              <Item label="Trade name">{show(d.trade_name)}</Item>
              <Item label="Business activities" className="sm:col-span-2">
                {d.business_activities.length ? (
                  <span className="flex flex-wrap gap-1.5">
                    {d.business_activities.map((a) => (
                      <Badge key={a}>{a}</Badge>
                    ))}
                  </span>
                ) : (
                  "—"
                )}
              </Item>
            </dl>
          </TabsContent>

          <TabsContent value="address">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Item label="Principal place of business" className="sm:col-span-2">
                {show(d.address)}
              </Item>
              <Item label="City">
                {show(d.city)}
                {d.city_derived && (
                  <Badge variant="outline" className="ml-2 align-middle">
                    derived from district
                  </Badge>
                )}
              </Item>
              <Item label="District">{show(d.district)}</Item>
              <Item label="State">{show(d.state)}</Item>
              <Item label="Pincode">{show(d.pincode)}</Item>
            </dl>
          </TabsContent>

          <TabsContent value="jurisdiction">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Item label="Centre jurisdiction">{show(d.center_jurisdiction)}</Item>
              <Item label="State jurisdiction">{show(d.state_jurisdiction)}</Item>
              <Item label="Provider reference id">{show(d.reference_id)}</Item>
              <Item label="Source">{show(d.provider)}</Item>
            </dl>
            {d.provider === "tally" && (
              <p className="mt-4 text-xs text-muted-foreground">
                Tally does not return jurisdiction or a reference id. Use Cashfree for those.
              </p>
            )}
          </TabsContent>

          <TabsContent value="raw">
            <pre className="max-h-96 overflow-auto rounded-md border bg-muted p-3 font-mono text-xs">
              {JSON.stringify(result.raw, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>

        <Separator />
        <p className="text-xs text-muted-foreground">
          {result.cached ? `Saved result from ${ago(result.fetched_at)}.` : "Fetched live just now."}{" "}
          {result.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}
