import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { ExternalLinkIcon, SearchIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Segmented } from "@/components/ui/segmented";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BASE = typeof location !== "undefined" ? location.origin : "";
const SAMPLE = "27AANFN6948F1ZR";

const RESPONSE = `{
  "data": {
    "gstin": "27AANFN6948F1ZR",
    "status": "active",
    "taxpayer": {
      "legal_name": "ACME TRADERS",
      "trade_name": "ACME TRADERS",
      "constitution": "Partnership",
      "taxpayer_type": "Regular",
      "registration_date": "2017-07-01",
      "last_updated": "2023-01-30",
      "business_activities": ["Retail Business", "Recipient of Goods or Services"],
      "address": {
        "full": "SHOP 4, MAIN ROAD, NASHIK, Maharashtra, 422001",
        "city": "Nashik",
        "city_is_derived": true,
        "district": "Nashik",
        "state": "Maharashtra",
        "pincode": "422001"
      },
      "jurisdiction": { "centre": "TAPOVAN RANGE", "state": "AMBAD_601" },
      "reference_id": "2987887"
    }
  },
  "meta": {
    "source": "cashfree",
    "cached": false,
    "fetched_at": "2026-10-07T10:49:39.609Z",
    "disclaimer": "Best-effort third-party data. Not authoritative for tax or compliance decisions.",
    "request_id": "req_05e969356fdabad9",
    "api_version": "v1"
  }
}`;

const ERRORS = [
  ["401", "api_key_required", "No key was sent."],
  ["401", "invalid_api_key", "The key is not recognised."],
  ["401", "api_key_revoked / api_key_expired", "The key was revoked or has expired."],
  ["400", "invalid_gstin_format", "The GSTIN is not 15 characters or does not start with 2 digits."],
  ["400", "invalid_source / invalid_gstins / invalid_json", "A parameter or the body is invalid. `error.details.field` names it."],
  ["404", "no_saved_result", "source=saved and nothing has been saved for this GSTIN."],
  ["429", "rate_limit_exceeded", "Over your requests-per-minute limit. Wait `Retry-After` seconds."],
  ["429", "quota_exceeded", "Monthly quota used up. It resets on the 1st (UTC)."],
  ["502", "provider_error", "The data provider failed. Safe to retry."],
  ["503", "upstream_rate_limited", "The provider is rate limiting us. Retry after a short wait."],
  ["504", "provider_timeout", "The provider timed out. Safe to retry."],
];

function Code({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <pre className="overflow-x-auto rounded-lg border bg-muted p-4 pr-12 font-mono text-[12.5px] leading-relaxed">{children}</pre>
      <CopyButton value={String(children)} className="absolute right-2 top-2 size-7" />
    </div>
  );
}

function Method({ m }) {
  return (
    <Badge variant={m === "GET" ? "info" : "success"} className="font-mono">
      {m}
    </Badge>
  );
}

function Endpoint({ method, path, title, children }) {
  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Method m={method} />
          <code className="font-mono text-sm font-medium">{path}</code>
        </div>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-[13px] text-muted-foreground">{children}</CardContent>
    </Card>
  );
}

function TryIt() {
  const [key, setKey] = useState("");
  const [gstin, setGstin] = useState(SAMPLE);
  const [source, setSource] = useState("auto");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);

  async function send(e) {
    e.preventDefault();
    setBusy(true);
    const t0 = performance.now();
    try {
      const res = await fetch(`/v1/gstin/${encodeURIComponent(gstin.trim())}?source=${source}`, { headers: { Authorization: `Bearer ${key.trim()}` } });
      const text = await res.text();
      let body = text;
      try {
        body = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        /* show raw */
      }
      const keep = ["api-version", "api-revision", "ratelimit-limit", "ratelimit-remaining", "x-quota-limit", "x-quota-remaining", "retry-after", "x-request-id"];
      setOut({ status: res.status, ms: Math.round(performance.now() - t0), headers: keep.filter((h) => res.headers.get(h) !== null).map((h) => `${h}: ${res.headers.get(h)}`), body });
    } catch {
      setOut({ status: 0, ms: 0, headers: [], body: "Could not reach the API. Is the gateway running?" });
    }
    setBusy(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Try it</CardTitle>
        <CardDescription>Runs a real request from your browser. The key stays in this page and is not stored.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={send} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="API key" htmlFor="try-key">
              <Input id="try-key" type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} placeholder="gst_live_…" className="font-mono" />
            </Field>
            <Field label="GSTIN" htmlFor="try-gstin">
              <Input id="try-gstin" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} maxLength={15} leftIcon={<SearchIcon />} className="font-mono" />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] font-medium">source</span>
            <Segmented value={source} onValueChange={setSource} options={["auto", "cashfree", "tally", "saved"].map((v) => ({ value: v, label: v }))} className="flex-wrap" />
            <Button type="submit" loading={busy} disabled={!key.trim() || !gstin.trim()} className="ml-auto">
              Send request
            </Button>
          </div>
        </form>
        {out && (
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={out.status >= 200 && out.status < 300 ? "success" : "warning"}>{out.status || "error"}</Badge>
              <span className="text-muted-foreground">{out.ms} ms</span>
            </div>
            {out.headers.length > 0 && <pre className="overflow-x-auto rounded-md border bg-muted p-3 font-mono text-xs text-muted-foreground">{out.headers.join("\n")}</pre>}
            <pre className="max-h-96 overflow-auto rounded-md border bg-muted p-3 font-mono text-xs">{out.body}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Docs() {
  const [changelog, setChangelog] = useState(null);

  useEffect(() => {
    fetch("/v1/changelog")
      .then((r) => r.json())
      .then((j) => setChangelog(j.data))
      .catch(() => setChangelog(null));
  }, []);

  const curl = `curl ${BASE}/v1/gstin/27AANFN6948F1ZR \\\n  -H "Authorization: Bearer YOUR_API_KEY"`;
  const js = `const res = await fetch("${BASE}/v1/gstin/27AANFN6948F1ZR", {\n  headers: { Authorization: \`Bearer \${process.env.GST_API_KEY}\` },\n});\nconst { data, meta } = await res.json();\nif (!res.ok) throw new Error(\`\${data?.error?.code ?? res.status}\`);\nconsole.log(data.status, data.taxpayer?.legal_name);`;
  const py = `import os, requests\n\nr = requests.get(\n    "${BASE}/v1/gstin/27AANFN6948F1ZR",\n    headers={"Authorization": f"Bearer {os.environ['GST_API_KEY']}"},\n    timeout=20,\n)\nbody = r.json()\nif r.status_code != 200:\n    raise RuntimeError(body["error"]["code"])\nprint(body["data"]["status"])`;
  const batch = `curl -X POST ${BASE}/v1/gstin/batch \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"gstins": ["27AANFN6948F1ZR", "29AAACI1681G1ZP"], "source": "auto"}'`;

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">GSTIN Verification API</h1>
            <Badge variant="info">v1</Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Look up a taxpayer's registration details by GSTIN. JSON over HTTPS, authenticated with an API key you create under API keys.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="/v1/openapi.json" target="_blank" rel="noreferrer">
            OpenAPI spec <ExternalLinkIcon />
          </a>
        </Button>
      </div>

      <Alert variant="warning" title="Best-effort data">
        Results come from third-party providers and are not authoritative for tax or compliance decisions. Every response says which source answered and whether it was saved.
      </Alert>

      <section className="grid gap-3">
        <h2 className="text-base font-semibold">Quickstart</h2>
        <p className="text-sm text-muted-foreground">
          Base URL <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">{BASE}</code>. Send your key as a Bearer token (or in an{" "}
          <code className="rounded bg-secondary px-1 font-mono text-xs">X-API-Key</code> header). Keep it on your server, never in browser code.
        </p>
        <Tabs defaultValue="curl">
          <TabsList variant="pill">
            <TabsTrigger value="curl">curl</TabsTrigger>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="py">Python</TabsTrigger>
          </TabsList>
          <TabsContent value="curl"><Code>{curl}</Code></TabsContent>
          <TabsContent value="js"><Code>{js}</Code></TabsContent>
          <TabsContent value="py"><Code>{py}</Code></TabsContent>
        </Tabs>
      </section>

      <TryIt />

      <section className="grid gap-3">
        <h2 className="text-base font-semibold">Endpoints</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Endpoint method="GET" path="/v1/gstin/{gstin}" title="Look up one GSTIN">
            <p>
              <code className="font-mono">source</code>: <b>auto</b> (default; Cashfree, then Tally), <b>cashfree</b>, <b>tally</b>, or <b>saved</b> (never calls a provider; returns the newest saved result
              of any source). <code className="font-mono">refresh=true</code> skips saved results.
            </p>
            <p>A GSTIN that is not registered is a normal <b>200</b> with <code className="font-mono">status: "not_registered"</code>, not an error.</p>
            <p>Status is one of <code className="font-mono">active</code>, <code className="font-mono">inactive</code>, <code className="font-mono">not_registered</code>, <code className="font-mono">unknown</code>.</p>
          </Endpoint>
          <Endpoint method="POST" path="/v1/gstin/batch" title="Look up up to 25 GSTINs">
            <p>Body: <code className="font-mono">{`{ "gstins": [...], "source": "auto" }`}</code>. Duplicates are merged. You get a result or an error per item.</p>
            <p>Quota is all-or-nothing: the whole batch must fit in what you have left, otherwise <b>429 quota_exceeded</b> and nothing runs.</p>
            <Code>{batch}</Code>
          </Endpoint>
          <Endpoint method="GET" path="/v1/usage" title="Your usage">
            <p>This month's quota used and remaining, your rate limit, and daily request counts (<code className="font-mono">?days=30</code>, max 90).</p>
          </Endpoint>
          <Endpoint method="GET" path="/v1/me" title="Your key's limits">
            <p>Name, scopes, limits and expiry. The key itself is never returned.</p>
          </Endpoint>
        </div>
        <p className="text-sm text-muted-foreground">
          No key needed for <code className="font-mono">GET /v1/status</code>, <code className="font-mono">/v1/changelog</code> and <code className="font-mono">/v1/openapi.json</code>.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="text-base font-semibold">Response</h2>
        <Code>{RESPONSE}</Code>
        <ul className="grid gap-1.5 text-[13px] text-muted-foreground">
          <li>Fields are never removed or renamed within v1. Unknown values are <code className="font-mono">null</code> (or <code className="font-mono">[]</code> for lists), never missing.</li>
          <li><code className="font-mono">city_is_derived</code> is true when the source gave no city and we filled it from the district.</li>
          <li>With <code className="font-mono">source=tally</code>, names carry an “M/s” prefix and jurisdiction, reference id and last-updated are <code className="font-mono">null</code>.</li>
          <li>Dates are ISO <code className="font-mono">YYYY-MM-DD</code>. <code className="font-mono">reference_id</code> is always a string.</li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-base font-semibold">Errors</h2>
        <p className="text-sm text-muted-foreground">
          Every error has the same shape and a <code className="font-mono">request_id</code> to quote when you need help:{" "}
          <code className="font-mono">{`{ "error": { "type", "code", "message", "request_id", "details"? } }`}</code>. Switch on <code className="font-mono">code</code>, not the message.
        </p>
        <Card>
          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>HTTP</TableHead>
                  <TableHead>code</TableHead>
                  <TableHead>Meaning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ERRORS.map(([h, c, m]) => (
                  <TableRow key={c}>
                    <TableCell><Badge variant={h.startsWith("4") ? "warning" : "danger"}>{h}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{c}</TableCell>
                    <TableCell className="text-muted-foreground">{m}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3">
        <h2 className="text-base font-semibold">Limits</h2>
        <ul className="grid gap-1.5 text-[13px] text-muted-foreground">
          <li><b>Rate limit</b> per key, per minute, sliding window. Headers: <code className="font-mono">RateLimit-Limit</code>, <code className="font-mono">RateLimit-Remaining</code>, <code className="font-mono">RateLimit-Reset</code>. When exceeded: 429 with <code className="font-mono">Retry-After</code>.</li>
          <li><b>Monthly quota</b> counts successful lookups (HTTP 200) per UTC calendar month. Errors, invalid input and rate-limited calls are free. Headers: <code className="font-mono">X-Quota-Limit</code>, <code className="font-mono">X-Quota-Used</code>, <code className="font-mono">X-Quota-Remaining</code>.</li>
          <li>Results are saved for 30 days (1 day for “not registered”), so repeat lookups are fast. They still count toward your quota.</li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="text-base font-semibold">Versioning</h2>
        <ul className="grid gap-1.5 text-[13px] text-muted-foreground">
          <li>The major version is in the URL (<code className="font-mono">/v1</code>). Every response carries <code className="font-mono">API-Version</code> and <code className="font-mono">API-Revision</code> (semver) so you can see exactly what served you.</li>
          <li>Within a major version we only add: new endpoints and new optional fields. Build clients that ignore fields they do not know.</li>
          <li>A breaking change ships as a new major version. The old one is then marked deprecated with a sunset date at least 6 months away, and its responses add <code className="font-mono">Deprecation</code>, <code className="font-mono">Sunset</code> and <code className="font-mono">Link: rel="successor-version"</code> headers.</li>
        </ul>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Changelog</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {!changelog ? (
              <p className="text-[13px] text-muted-foreground">Start the gateway to load the changelog.</p>
            ) : (
              changelog.flatMap((v) =>
                v.changelog.map((c) => (
                  <div key={v.version + c.revision} className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">{v.version} · {c.revision}</Badge>
                      <span className="text-xs text-muted-foreground">{c.date}</span>
                      {v.status !== "stable" && <Badge variant="warning">{v.status}</Badge>}
                    </div>
                    <ul className="ml-4 list-disc text-[13px] text-muted-foreground">
                      {c.changes.map((x) => <li key={x}>{x}</li>)}
                    </ul>
                  </div>
                )),
              )
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
