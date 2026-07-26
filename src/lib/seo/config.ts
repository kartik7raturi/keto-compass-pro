/**
 * Central SEO configuration for Ketopia.
 * Every page, the sitemap generator, and JSON-LD schema builders read from
 * here so site-wide facts (name, domain, default image) never drift out of
 * sync across the app.
 */
export const SITE_CONFIG = {
  name: "Ketopia",
  // Canonical production origin. No trailing slash.
  url: "https://ketopia.online",
  description:
    "Ketopia is your all-in-one keto companion: track macros, fasting, water, and weight, plus meal plans and recipes to hit your goals.",
  defaultImage:
    "https://storage.googleapis.com/gpt-engineer-file-uploads/HM2KLeTP9fO8bZUNM1KUD54WLp62/social-images/social-1759771399052-ketopia.png",
  twitterHandle: "@ketopia",
  locale: "en_US",
  organization: {
    name: "Ketopia",
    logo: "https://ketopia.online/favicon.ico",
    sameAs: [] as string[],
  },
} as const;
