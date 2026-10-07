import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchIcon, ShieldIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { captchaCancel, captchaChallenge, captchaSolve, getHistory, getStats, verify } from "@/lib/api";
import { GSTIN_RE } from "@/lib/gstin";
import { Anatomy } from "@/widgets/Anatomy";
import { CaptchaCard } from "@/widgets/CaptchaCard";
import { Compare } from "@/widgets/Compare";
import { Profile } from "@/widgets/Profile";
import { Completeness, LibraryStats, Recent, Trail, trailFor } from "@/widgets/Sidebar";
import { CAPTCHA_SOURCES } from "@/widgets/shared";

const SAMPLE = "27AANFN6948F1ZR";

const PROVIDER_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "cashfree", label: "Cashfree" },
  { value: "tally", label: "Tally" },
  { value: "gst_portal", label: "GST portal" },
  { value: "ewaybill", label: "E-way bill" },
  { value: "compare", label: "Compare" },
];

function ResultSkeleton() {
  return (
    <Card>
      <CardContent className="grid gap-5 p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-xl" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
        <Skeleton className="h-32" />
      </CardContent>
    </Card>
  );
}

export default function Verify() {
  const [gstin, setGstin] = useState("");
  const [provider, setProvider] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  // { mode: 'single'|'compare', gstin, sides: [{key, heading, result}] }
  // or { mode: 'captcha', gstin, challenge, error, busy } while the user types the portal CAPTCHA
  const [view, setView] = useState(null);
  const [history, setHistory] = useState(null);
  const [stats, setStats] = useState(null);

  // Leaving the page must not leave a portal session open on the server.
  const viewRef = useRef(null);
  viewRef.current = view;
  useEffect(
    () => () => {
      const v = viewRef.current;
      if (v?.mode === "captcha") captchaCancel(v.source, v.challenge.challenge_id);
    },
    [],
  );

  const normalized = gstin.trim().toUpperCase();

  const loadLibrary = useCallback(async () => {
    const [h, s] = await Promise.all([getHistory(8), getStats()]);
    setHistory(h?.items ?? null);
    setStats(s);
  }, []);
  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const showSingle = (g, p, result) => setView({ mode: "single", gstin: g, sides: [{ key: p, heading: null, result }] });

  async function startChallenge(g, source) {
    const c = await captchaChallenge(source, g);
    if (c.challenge_id) setView({ mode: "captcha", source, gstin: g, challenge: c, error: "", busy: false });
    else showSingle(g, source, { outcome: "provider_error", message: c.message || "Could not open that source." });
  }

  async function submitCaptcha(value) {
    setView((v) => ({ ...v, busy: true }));
    const r = await captchaSolve(view.source, view.challenge.challenge_id, value);
    if (r.outcome === "captcha_invalid" && r.image) {
      setView((v) => ({ ...v, busy: false, error: r.message, challenge: { ...v.challenge, image: r.image, tries_left: r.tries_left } }));
      return;
    }
    showSingle(view.gstin, view.source, r);
    loadLibrary();
  }

  async function newCaptchaImage() {
    const { gstin: g, source } = view;
    setView((v) => ({ ...v, busy: true }));
    await captchaCancel(source, view.challenge.challenge_id);
    await startChallenge(g, source);
  }

  async function cancelCaptcha() {
    await captchaCancel(view.source, view.challenge.challenge_id);
    setView(null);
  }

  async function run(g, p, refresh = false) {
    if (view?.mode === "captcha") captchaCancel(view.source, view.challenge.challenge_id); // free the session
    if (!GSTIN_RE.test(g)) {
      setError("GSTIN must be 15 alphanumeric characters, and the first 2 must be digits.");
      return;
    }
    setError("");
    refresh ? setRefreshing(true) : setLoading(true);
    if (CAPTCHA_SOURCES.includes(p)) {
      const r = await verify(g, p, refresh); // fresh saved result, or "captcha_required"
      if (r.outcome === "captcha_required") await startChallenge(g, p);
      else showSingle(g, p, r);
    } else if (p === "compare") {
      const [cf, tl] = await Promise.all([verify(g, "cashfree", refresh), verify(g, "tally", refresh)]);
      setView({
        mode: "compare",
        gstin: g,
        sides: [
          { key: "cf", heading: "Cashfree", result: cf },
          { key: "tl", heading: "Tally", result: tl },
        ],
      });
    } else {
      setView({ mode: "single", gstin: g, sides: [{ key: p, heading: null, result: await verify(g, p, refresh) }] });
    }
    setLoading(false);
    setRefreshing(false);
    loadLibrary();
  }

  const onSubmit = (e) => {
    e.preventDefault();
    run(normalized, provider);
  };

  const pick = (g) => {
    // Opening a saved lookup must never surprise the user with a CAPTCHA.
    const p = provider === "compare" || CAPTCHA_SOURCES.includes(provider) ? "auto" : provider;
    setGstin(g);
    setProvider(p);
    run(g, p);
  };

  const single = view?.mode === "single" ? view.sides[0].result : null;

  return (
    <>
      <PageHeader title="Verify GSTIN" description="Look up a registration through Cashfree, Tally, the GST portal or the e-way bill site." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ---------- main column ---------- */}
        <div className="grid min-w-0 grid-cols-1 content-start gap-6 lg:col-span-8">
          <Card>
            <CardContent className="grid gap-5 p-5 sm:p-6">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Look up a GSTIN</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter a 15-character GSTIN to see who it belongs to, whether it is active, and where it is registered.
                </p>
              </div>

              <form onSubmit={onSubmit} className="grid gap-4" noValidate>
                <Field label="GSTIN" htmlFor="gstin" error={error}>
                  <div className="flex gap-2">
                    <Input
                      id="gstin"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                      placeholder={SAMPLE}
                      maxLength={15}
                      autoComplete="off"
                      spellCheck={false}
                      leftIcon={<SearchIcon />}
                      aria-invalid={error ? true : undefined}
                      className="h-11 font-mono text-[15px] tracking-wider"
                    />
                    <Button type="submit" size="lg" loading={loading}>
                      {loading ? "Verifying" : "Verify"}
                    </Button>
                  </div>
                </Field>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium">Source</span>
                    <Segmented value={provider} onValueChange={setProvider} options={PROVIDER_OPTIONS} className="flex-wrap" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    <span className="text-xs text-muted-foreground">Try</span>
                    <Chip selected={normalized === SAMPLE} onClick={() => setGstin(SAMPLE)}>
                      Sample GSTIN
                    </Chip>
                  </div>
                </div>
              </form>

              <Anatomy value={normalized} />
            </CardContent>
          </Card>

          {loading && (
            <div className="grid gap-6">
              <ResultSkeleton />
              {provider === "compare" && <Skeleton className="h-64" />}
            </div>
          )}

          {!loading && !view && (
            <EmptyState
              icon={<ShieldIcon />}
              title="No lookup yet"
              description="Results appear here with the company profile, address, jurisdiction and where the data came from."
              action={
                <Button variant="outline" size="sm" onClick={() => pick(SAMPLE)}>
                  Run the sample
                </Button>
              }
            />
          )}

          {!loading && view?.mode === "captcha" && (
            <CaptchaCard
              key={view.challenge.challenge_id}
              source={view.source}
              gstin={view.gstin}
              challenge={view.challenge}
              error={view.error}
              busy={view.busy}
              onSubmit={submitCaptcha}
              onNewImage={newCaptchaImage}
              onCancel={cancelCaptcha}
            />
          )}

          {!loading && view?.mode === "single" && (
            <Profile result={single} refreshing={refreshing} onRefresh={() => run(view.gstin, provider, true)} />
          )}

          {!loading && view?.mode === "compare" && (
            <Compare
              left={view.sides[0]}
              right={view.sides[1]}
              refreshing={refreshing}
              onRefresh={() => run(view.gstin, "compare", true)}
            />
          )}
        </div>

        {/* ---------- side column ---------- */}
        <aside className="grid min-w-0 grid-cols-1 content-start gap-6 lg:col-span-4">
          {!loading && single?.data && <Completeness data={single.data} />}
          {!loading && single && <Trail items={trailFor(single)} />}
          {!loading &&
            view?.mode === "compare" &&
            view.sides.map((s) => <Trail key={s.key} title={`${s.heading} trail`} items={trailFor(s.result)} />)}
          <LibraryStats stats={stats} />
          <Recent items={history} onPick={pick} activeGstin={view?.gstin} />
        </aside>
      </div>
    </>
  );
}
