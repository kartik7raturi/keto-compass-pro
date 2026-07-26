import { Helmet } from "react-helmet-async";
import { SITE_CONFIG } from "@/lib/seo/config";
import { absoluteUrl, buildDescription, buildTitle } from "@/lib/seo/metadata";

interface SEOProps {
  /** Page-specific title, without the site name suffix (added automatically). */
  title: string;
  /** Raw description text; cleaned and truncated to ~160 chars automatically. */
  description?: string;
  /** Site-relative path, e.g. "/blog/my-post". Used for canonical + og:url. */
  path: string;
  /** Absolute image URL for OG/Twitter cards. Falls back to the site default. */
  image?: string;
  /** OG type: "website" for most pages, "article" for blog posts. */
  type?: "website" | "article";
  /** One or more JSON-LD objects, injected as <script type="application/ld+json">. */
  jsonLd?: object | object[];
  /** Set true on pages that shouldn't be indexed (auth, admin, thank-you pages). */
  noindex?: boolean;
  /** Skip the " | Ketopia" suffix (used on the homepage itself). */
  suffixSiteName?: boolean;
}

/**
 * Drop this at the top of every route's JSX. It's the single source of truth
 * for <title>, canonical URL, Open Graph, Twitter Card, and JSON-LD on that
 * page. Uses react-helmet-async, so it must render underneath the
 * <HelmetProvider> in App.tsx (already wired up).
 */
export function SEO({
  title,
  description,
  path,
  image,
  type = "website",
  jsonLd,
  noindex = false,
  suffixSiteName = true,
}: SEOProps) {
  const fullTitle = buildTitle(title, { suffixSiteName });
  const fullDescription = buildDescription(description);
  const canonical = absoluteUrl(path);
  const ogImage = image || SITE_CONFIG.defaultImage;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:site_name" content={SITE_CONFIG.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_CONFIG.twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImage} />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
