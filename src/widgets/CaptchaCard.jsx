import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClockIcon, RefreshIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/label";

/** Shows the official portal's CAPTCHA and lets the user type it. Nothing here reads or solves it. */
const SOURCES = {
  gst_portal: { name: "GST portal", digitsOnly: true, hint: "6 digits", slow: "Checking can take 10 to 20 seconds, because the gateway fills in the portal's form for you." },
  ewaybill: { name: "e-way bill site", digitsOnly: false, hint: "6 letters or digits", slow: "Checking usually takes a few seconds." },
};

export function CaptchaCard({ source = "gst_portal", gstin, challenge, error, busy, onSubmit, onNewImage, onCancel }) {
  const cfg = SOURCES[source];
  const [value, setValue] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  // A fresh image (after a wrong answer) starts with an empty box.
  useEffect(() => setValue(""), [challenge.image]);

  const left = Math.max(0, Math.round((challenge.expires_at - now) / 1000));
  const expired = left === 0;
  const valid = (cfg.digitsOnly ? /^[0-9]{6}$/ : /^[A-Z0-9]{6}$/).test(value);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="grid gap-1">
          <CardTitle>Type the CAPTCHA from the {cfg.name}</CardTitle>
          <CardDescription>
            The {cfg.name} needs a person to read this before it will show details for{" "}
            <span className="font-mono">{gstin}</span>.
          </CardDescription>
        </div>
        <Badge variant={expired ? "danger" : left < 30 ? "warning" : "outline"}>
          <ClockIcon />
          {expired ? "Expired" : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && <Alert variant="warning" title={error} />}

        <div className="flex flex-wrap items-center gap-3">
          {challenge.image ? (
            <img
              src={challenge.image}
              alt="CAPTCHA to type"
              className="h-14 rounded-md border bg-white p-1"
              style={{ imageRendering: "auto" }}
            />
          ) : (
            <span className="text-sm text-muted-foreground">No image. Request a new one.</span>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={onNewImage} disabled={busy}>
            <RefreshIcon /> New image
          </Button>
        </div>

        <form
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid && !expired) onSubmit(value);
          }}
        >
          <Field label="CAPTCHA" htmlFor="captcha" hint={`${cfg.hint}. ${challenge.tries_left} attempt${challenge.tries_left === 1 ? "" : "s"} left.`}>
            <div className="flex gap-2">
              <Input
                id="captcha"
                value={value}
                onChange={(e) =>
                  setValue(
                    (cfg.digitsOnly ? e.target.value.replace(/\D/g, "") : e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")).slice(0, 6),
                  )
                }
                inputMode={cfg.digitsOnly ? "numeric" : "text"}
                autoComplete="off"
                autoFocus
                placeholder={cfg.digitsOnly ? "000000" : "A1B2C3"}
                className="max-w-40 font-mono tracking-[0.3em]"
              />
              <Button type="submit" loading={busy} disabled={!valid || expired}>
                {busy ? "Checking" : "Submit"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
                Cancel
              </Button>
            </div>
          </Field>
        </form>
        <p className="text-xs text-muted-foreground">
          {cfg.slow}
        </p>
      </CardContent>
    </Card>
  );
}
