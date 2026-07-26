import { SITE_CONFIG } from "./config";

/** Truncates text to a max length on a word boundary, appending an ellipsis if cut. */
export function truncate(text: string, maxLength: number): string {
  if (!text) return "";
  const clean = text.replace(/<[^>]*>/g, "").trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

/** Builds a meta description within Google's practical ~160 char display limit. */
export function buildDescription(raw?: string | null, fallback: string = SITE_CONFIG.description): string {
  const source = raw && raw.trim().length > 0 ? raw : fallback;
  return truncate(source, 160);
}

/** Builds a <title> tag within a safe ~70 char display limit, with the site name suffixed. */
export function buildTitle(pageTitle: string, options: { suffixSiteName?: boolean } = {}): string {
  const { suffixSiteName = true } = options;
  if (!suffixSiteName) return truncate(pageTitle, 70);
  const withSuffix = `${pageTitle} | ${SITE_CONFIG.name}`;
  return withSuffix.length <= 70 ? withSuffix : truncate(pageTitle, 70);
}

/** Turns a site-relative path ("/blog/foo") into an absolute canonical URL. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.url}${clean === "/" ? "/" : clean.replace(/\/$/, "")}`;
}

/** Slugify used anywhere we need a URL-safe slug from free text. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
