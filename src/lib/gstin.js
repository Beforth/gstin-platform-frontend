// Local GSTIN helpers. Pure functions, no network.

export const GSTIN_RE = /^[0-9]{2}[A-Z0-9]{13}$/;
const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const STATES = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  10: "Bihar", 11: "Sikkim", 12: "Arunachal Pradesh", 13: "Nagaland", 14: "Manipur", 15: "Mizoram",
  16: "Tripura", 17: "Meghalaya", 18: "Assam", 19: "West Bengal", 20: "Jharkhand", 21: "Odisha",
  22: "Chhattisgarh", 23: "Madhya Pradesh", 24: "Gujarat", 26: "Dadra & Nagar Haveli and Daman & Diu",
  27: "Maharashtra", 29: "Karnataka", 30: "Goa", 31: "Lakshadweep", 32: "Kerala", 33: "Tamil Nadu",
  34: "Puducherry", 35: "Andaman & Nicobar", 36: "Telangana", 37: "Andhra Pradesh", 38: "Ladakh",
  97: "Other Territory", 99: "Centre Jurisdiction",
};

// 4th character of a PAN says what kind of holder it is.
export const HOLDER_TYPES = {
  P: "Individual", C: "Company", H: "HUF", F: "Firm / LLP", A: "Association of persons",
  T: "Trust", B: "Body of individuals", L: "Local authority", J: "Artificial juridical person",
  G: "Government",
};

export function checksumChar(first14) {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const p = ALPHABET.indexOf(first14[i]) * (i % 2 ? 2 : 1);
    sum += Math.floor(p / 36) + (p % 36);
  }
  return ALPHABET[(36 - (sum % 36)) % 36];
}

/** Break a (possibly partial) GSTIN into its labelled parts. */
export function decode(input) {
  const g = input.toUpperCase();
  const complete = GSTIN_RE.test(g);
  const stateCode = g.slice(0, 2);
  const pan = g.slice(2, 12);
  return {
    complete,
    chars: g.split(""),
    stateCode,
    state: STATES[stateCode] ?? (stateCode.length === 2 ? "Unknown code" : null),
    pan,
    holder: pan.length >= 4 ? HOLDER_TYPES[pan[3]] ?? "Unknown" : null,
    entity: g[12] ?? null,
    zChar: g[13] ?? null,
    check: g[14] ?? null,
    expectedCheck: complete ? checksumChar(g) : null,
    checksumOk: complete ? checksumChar(g) === g[14] : null,
    zOk: g.length >= 14 ? g[13] === "Z" : null,
  };
}

// Which segment a character index belongs to.
export const segmentOf = (i) => (i < 2 ? "state" : i < 12 ? "pan" : i === 12 ? "entity" : i === 13 ? "z" : "check");

export function yearsSince(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d)) return null;
  const years = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
  return years < 1 ? "under a year" : `${Math.floor(years)} yr${Math.floor(years) === 1 ? "" : "s"}`;
}

export function ago(ms) {
  if (!ms) return "";
  const s = Math.max(1, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export const cleanName = (s) => (s || "").replace(/^m\/s\s*/i, "").trim();
