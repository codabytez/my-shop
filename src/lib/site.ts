/**
 * Public base URL of the site, for absolute links (emails, metadata).
 * AUTH_URL wins when set; on Vercel we fall back to the production domain it
 * provides, so nothing silently points at localhost after a deploy.
 */
export function siteUrl() {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const url =
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (vercel ? `https://${vercel}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}
