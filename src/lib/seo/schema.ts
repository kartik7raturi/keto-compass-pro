import { SITE_CONFIG } from "./config";
import { absoluteUrl } from "./metadata";

/** Article JSON-LD (used on /blog/:slug). */
export function articleSchema(article: {
  title: string;
  excerpt?: string | null;
  slug: string;
  featured_image_url?: string | null;
  created_at: string;
  updated_at?: string | null;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || undefined,
    image: [article.featured_image_url || SITE_CONFIG.defaultImage],
    datePublished: article.created_at,
    dateModified: article.updated_at || article.created_at,
    author: { "@type": "Organization", name: SITE_CONFIG.organization.name },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.organization.name,
      logo: { "@type": "ImageObject", url: SITE_CONFIG.organization.logo },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${article.slug}`) },
    articleSection: article.category || undefined,
  };
}

/** Recipe JSON-LD (used on /recipes/:slug). Google requires `image` for rich results. */
export function recipeSchema(recipe: {
  title: string;
  description?: string | null;
  slug: string;
  image_url?: string | null;
  ingredients: string[];
  instructions: string[];
  prep_time?: number | null;
  cook_time?: number | null;
  servings?: number | null;
  calories?: number | null;
  category?: string | null;
  created_at?: string;
}) {
  const totalMinutes = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description || undefined,
    image: [recipe.image_url || SITE_CONFIG.defaultImage],
    author: { "@type": "Organization", name: SITE_CONFIG.organization.name },
    datePublished: recipe.created_at || undefined,
    recipeCategory: recipe.category || undefined,
    recipeCuisine: "Keto",
    prepTime: recipe.prep_time ? `PT${recipe.prep_time}M` : undefined,
    cookTime: recipe.cook_time ? `PT${recipe.cook_time}M` : undefined,
    totalTime: totalMinutes ? `PT${totalMinutes}M` : undefined,
    recipeYield: recipe.servings ? `${recipe.servings} servings` : undefined,
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: step,
    })),
    nutrition: recipe.calories ? { "@type": "NutritionInformation", calories: `${recipe.calories} calories` } : undefined,
  };
}

/** BreadcrumbList — pass an ordered array from home down to the current page. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Organization JSON-LD — identical on every page. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.organization.name,
    url: SITE_CONFIG.url,
    logo: SITE_CONFIG.organization.logo,
    sameAs: SITE_CONFIG.organization.sameAs,
  };
}

/** WebSite JSON-LD — enables sitelinks search box eligibility in Google. */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_CONFIG.url}/blog?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
