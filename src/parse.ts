const times = /(-?(?:\d+\.?\d*|\d*\.?\d+)(?:e[-+]?\d+)?)\s*([\p{L}]*)/iu;

type Parse = {
  (str: string | number | null | undefined): number | null;
  [key: string]:
    number | ((str: string | number | null | undefined) => number | null);
};

const parse = function (
  str: string | number | null | undefined,
): number | null {
  if (str === null || str === undefined) return null;
  if (typeof str === "number") return str;
  const cleaned = str.toLowerCase().replace(/[,_]/g, "");
  const match = times.exec(cleaned);
  if (!match) return null;
  const [, value, units] = match;
  const unitValue =
    (parse as any)[units!] ?? (parse as any)[units!.replace(/s$/, "")];
  if (unitValue == null) return null;
  const result = unitValue * parseFloat(value!);
  return Math.abs(Math.round(result * 1000) / 1000);
} as Parse;

parse.millisecond = parse.ms = 0.001;
parse.second = parse.sec = parse.s = parse[""] = 1;
parse.minute = parse.min = parse.m = parse.s * 60;
parse.hour = parse.hr = parse.h = parse.m * 60;
parse.day = parse.d = parse.h * 24;
parse.week = parse.wk = parse.w = parse.d * 7;
parse.year = parse.yr = parse.y = parse.d * 365.25;
parse.month = parse.b = parse.y / 12;

export default parse;
