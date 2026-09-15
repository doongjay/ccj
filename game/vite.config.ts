import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const productionHost = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const configured = env.SITE_URL?.trim() || (productionHost ? `https://${productionHost}` : undefined);
  const site = configured ? new URL(configured) : undefined;
  if (site && !["https:", "http:"].includes(site.protocol)) throw new Error("SITE_URL must be an HTTP(S) website address.");
  return {
    plugins: [{
      name: "wedding-share-urls",
      transformIndexHtml: {
        order: "pre",
        handler(html, context) {
          // Write the URL into the HTML itself: chat crawlers do not run app JavaScript.
          const base = site?.origin ?? context.server?.resolvedUrls?.local[0];
          if (!base) return html;
          return html.replace(/(<(?:meta|link)\b[^>]*(?:content|href)=")\/(?!\/)([^"<>]*)("[^>]*>)/g,
            (_match, before: string, path: string, after: string) => `${before}${new URL(`/${path}`, base).href}${after}`);
        },
      },
    }],
  };
});
