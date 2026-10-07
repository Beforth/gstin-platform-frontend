import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon, XCircleIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { decode, segmentOf } from "@/lib/gstin";

const SEGMENT_STYLE = {
  state: "bg-primary/10 text-primary border-primary/25",
  pan: "bg-info/10 text-foreground border-info/20",
  entity: "bg-warning/10 text-warning border-warning/25",
  z: "bg-secondary text-muted-foreground border-transparent",
  check: "bg-success/10 text-success border-success/25",
};

function Part({ label, value, sub }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-mono text-sm font-medium">{value || "—"}</p>
      <p className="truncate text-xs text-muted-foreground">{sub || " "}</p>
    </div>
  );
}

/** Live breakdown of what the user has typed so far. Purely local. */
export function Anatomy({ value }) {
  const d = decode(value);
  const slots = Array.from({ length: 15 }, (_, i) => d.chars[i] ?? "");

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex w-full max-w-md gap-1" aria-label="GSTIN characters">
          {slots.map((c, i) => (
            <span
              key={i}
              className={cn(
                "grid h-9 min-w-0 flex-1 place-items-center rounded-md border font-mono text-sm font-semibold transition-colors",
                c ? SEGMENT_STYLE[segmentOf(i)] : "border-dashed text-muted-foreground/40",
              )}
            >
              {c || "·"}
            </span>
          ))}
        </div>
        {d.complete && (
          <Badge variant={d.checksumOk ? "success" : "warning"}>
            {d.checksumOk ? <CheckCircleIcon /> : <XCircleIcon />}
            {d.checksumOk ? "Checksum valid" : `Checksum mismatch (expected ${d.expectedCheck})`}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Part label="State" value={d.stateCode.length === 2 ? d.stateCode : ""} sub={d.state} />
        <Part label="PAN" value={d.pan.length ? d.pan : ""} sub={d.holder ? `${d.holder} holder` : null} />
        <Part label="Entity no." value={d.entity} sub={d.entity ? `Registration #${d.entity} on this PAN` : null} />
        <Part
          label="Check digit"
          value={d.check}
          sub={d.zOk === false ? "14th character should be Z" : d.complete ? "Computed locally" : null}
        />
      </div>
    </div>
  );
}
