# Vercel crawler protection runbook

The repository now reduces crawler amplification, but the Vercel Firewall must
be the first line of defence. Firewall-mitigated traffic is stopped before it
reaches the application.

## Before restoring the custom domain

1. Deploy this revision while the custom domain is still detached.
2. In the Vercel project, open **Firewall**, then **Configure**.
3. Add a custom rule named `deny-unwanted-crawlers`.
   - Match the **User Agent** against the unwanted crawlers listed in
     `src/proxy.ts`.
   - Set the action to **Deny**.
4. Add one rate-limit rule named `rate-limit-expensive-routes`.
   - Match paths beginning with `/api/`, `/Anime/`, `/search/`, or `/seasons/`.
   - Use a fixed window of 60 seconds, a limit of 30 requests, and the IP
     address as the counting key.
   - Use **Log** briefly if production traffic patterns are unknown, then
     change the action to **Deny** or the default `429`.
5. Publish the Firewall changes.
6. Confirm that normal browser traffic and Googlebot/Bingbot traffic are not
   matched by the deny rule.

Vercel currently allows one rate-limit rule on Hobby projects. If only one is
available, keep the combined expensive-route rule above.

## Restore safely

1. Reattach the custom domain in **Project Settings → Domains**.
2. Update `NEXT_PUBLIC_SITE_URL`, `Prod_host`, and `prod_auth_redirect` to the
   restored HTTPS domain. `Prod_host` and the OAuth redirect should include the
   exact production hostname expected by MyAnimeList.
3. Redeploy production so sitemap, canonical, Open Graph, and OAuth URLs use
   the restored domain.
4. Test `/`, `/robots.txt`, `/sitemap.xml`, `/Anime/1`, search, login, and
   logout.
5. Watch **Firewall**, **Usage**, and **Logs** for at least 30 minutes. Group
   traffic by path and user agent. Tighten the rate limit if arbitrary anime
   IDs or query strings continue to dominate.

If a traffic spike starts again, enable **Attack Challenge Mode** temporarily.
Do not remove the domain first; challenge or deny the traffic at the Firewall
so the application remains available.

## What the repository now does

- Blocks known AI, SEO, and bulk crawler user agents on expensive routes.
- Tells those crawlers not to crawl through `robots.txt`.
- Advertises one small sitemap containing only stable list pages.
- Removes AI index files and duplicate sitemaps.
- Removes the public ISR warm-up endpoint, which could amplify one request
  into many internal requests.
- Caches public Jikan detail data for 12 hours and avoids retrying permanent
  `4xx` responses.
