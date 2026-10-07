import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ago } from "@/lib/gstin";

export const httpBadge = (s) => (s >= 500 ? "danger" : s >= 400 ? "warning" : "success");

/** Request log rows. Hides columns on small screens instead of letting the page scroll sideways. */
export function RequestsTable({ rows, showKey = true, compact = false }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>When</TableHead>
          {showKey && <TableHead className="hidden sm:table-cell">Key</TableHead>}
          <TableHead>Request</TableHead>
          <TableHead className="hidden md:table-cell">GSTIN</TableHead>
          {!compact && <TableHead className="hidden md:table-cell">Source</TableHead>}
          <TableHead>Status</TableHead>
          {!compact && <TableHead className="hidden text-right sm:table-cell">Time</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={`${r.request_id}-${i}`}>
            <TableCell className="whitespace-nowrap text-muted-foreground">{ago(r.ts)}</TableCell>
            {showKey && <TableCell className="hidden max-w-32 truncate sm:table-cell">{r.key_name}</TableCell>}
            <TableCell className="font-mono text-xs">
              {r.method} {r.route.replace("/v1", "").replace(":gstin", "{gstin}")}
            </TableCell>
            <TableCell className="hidden font-mono text-xs md:table-cell">{r.gstin ?? "—"}</TableCell>
            {!compact && (
              <TableCell className="hidden whitespace-nowrap md:table-cell">
                {r.source ?? "—"}
                {r.cached ? <Badge variant="outline" className="ml-1.5">saved</Badge> : null}
              </TableCell>
            )}
            <TableCell>
              <Badge variant={httpBadge(r.status)}>{r.status}</Badge>
            </TableCell>
            {!compact && <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">{r.latency_ms} ms</TableCell>}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
