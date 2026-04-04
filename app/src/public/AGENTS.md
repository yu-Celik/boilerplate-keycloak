<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-04 -->

# public

## Purpose
Static assets served by Next.js without processing. Currently empty — this directory exists for future use. Typical contents would be favicons, robots.txt, sitemap.xml, and other static files that should be served as-is at the root path.

## Key Files
None currently.

## For AI Agents

### Working In This Directory
- Files in `public/` are served at the root URL path (e.g., `/favicon.ico` for `public/favicon.ico`)
- These files are static — not processed or bundled by Webpack
- Use `public/` for: favicons, robots.txt, sitemaps, static images not imported as modules
- Do NOT use for: code, styles, or assets that should be part of the build bundle
- For images imported in components, use `<Image>` from `next/image` instead

### Adding Static Assets
- Place files directly in this directory
- Reference without the `/public` prefix in URLs (e.g., `/favicon.ico`, `/robots.txt`)
- Large static assets (videos, PDFs) can be stored here if needed
- Consider using a CDN for high-traffic static content in production

## Next Steps
- Add `public/favicon.ico` when branding is finalized
- Add `public/robots.txt` for SEO configuration
- Add `public/sitemap.xml` when sitemap generation is set up
