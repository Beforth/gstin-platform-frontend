import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshIcon } from "@/components/ui/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cleanName } from "@/lib/gstin";
import { OUTCOMES, outcomeBadge, show } from "./shared";

const norm = (v) =>
  String(v ?? "")
    .toLowerCase()
    .replace(/[,\s]+/g, " ")
    .trim();

// [label, accessor, normaliser used to decide "differs"]
const ROWS = [
  ["Status", (d) => d.status, norm],
  ["Legal name", (d) => d.legal_name, (v) => norm(cleanName(v))],
  ["Trade name", (d) => d.trade_name, (v) => norm(cleanName(v))],
  ["Taxpayer type", (d) => d.registration_type, norm],
  ["Registered on", (d) => d.registration_date, norm],
  ["Constitution", (d) => d.constitution, norm],
  ["Business activities", (d) => d.business_activities?.join(", "), norm],
  ["City", (d) => d.city, norm],
  ["State", (d) => d.state, norm],
  ["Pincode", (d) => d.pincode, norm],
  ["Centre jurisdiction", (d) => d.center_jurisdiction, norm],
  ["State jurisdiction", (d) => d.state_jurisdiction, norm],
  ["Reference id", (d) => d.reference_id, norm],
  ["Last updated", (d) => d.last_update_date, norm],
];

export function Compare({ left, right, onRefresh, refreshing }) {
  const a = left.result.data;
  const b = right.result.data;

  let same = 0;
  let comparable = 0;
  const rows = ROWS.map(([label, get, n]) => {
    const av = a ? get(a) : null;
    const bv = b ? get(b) : null;
    const both = av && bv;
    const differs = both && n(av) !== n(bv);
    if (both) {
      comparable += 1;
      if (!differs) same += 1;
    }
    return { label, av, bv, differs, onlyOne: !both && (av || bv) };
  });

  const head = (side) => (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-foreground normal-case tracking-normal">{side.heading}</span>
      <Badge variant={outcomeBadge(side.result.outcome)}>{OUTCOMES[side.result.outcome]?.title ?? "Unknown"}</Badge>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="grid gap-1">
          <CardTitle>Provider comparison</CardTitle>
          <CardDescription>
            {comparable
              ? `${same} of ${comparable} comparable fields agree. Name prefixes like “M/s” are ignored.`
              : "Not enough data from both providers to compare."}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} loading={refreshing}>
          {!refreshing && <RefreshIcon />}
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Field</TableHead>
              <TableHead>{head(left)}</TableHead>
              <TableHead>{head(right)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.label} className={r.differs ? "bg-warning/5" : ""}>
                <TableCell className="whitespace-nowrap text-muted-foreground">{r.label}</TableCell>
                <TableCell className="max-w-[260px] break-words">{show(r.av)}</TableCell>
                <TableCell className="max-w-[260px] break-words">
                  {show(r.bv)}
                  {r.differs && (
                    <Badge variant="warning" className="ml-2 align-middle">
                      differs
                    </Badge>
                  )}
                  {r.onlyOne && !r.differs && (
                    <Badge variant="outline" className="ml-2 align-middle">
                      one source only
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
