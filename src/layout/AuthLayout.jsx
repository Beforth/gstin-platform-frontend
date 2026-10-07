import { Badge } from "@/components/ui/badge";
import { BefMark, CheckCircleIcon } from "@/components/ui/icons";

const POINTS = [
  "Verify any GSTIN against Cashfree, Tally and the official portals",
  "Issue API keys with their own limits, quotas and expiry",
  "See every request, source and response time in one place",
];

/** Split screen: brand and value on the left (desktop only), the form on the right. */
export function AuthLayout({ children }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-card p-10 lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full bg-info/10 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BefMark className="size-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">GSTIN Platform</span>
        </div>
        <div className="relative grid max-w-md gap-6">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">GST verification you can build on.</h2>
          <ul className="grid gap-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-success" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted-foreground">Data is best-effort and not authoritative for tax or compliance decisions.</p>
      </aside>
      <main className="grid place-items-center p-5 sm:p-8">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <BefMark className="size-5" />
            </span>
            <span className="text-base font-semibold tracking-tight">GSTIN Platform</span>
            <Badge variant="outline" className="ml-auto">v1</Badge>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
