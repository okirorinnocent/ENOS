# Setup (about 15 minutes)

1. **Supabase**: create a free project at supabase.com.
2. **Database**: open SQL Editor, paste all of `supabase.sql`, click Run.
3. **Admin user**: Authentication > Users > Add user (your email + a strong password, tick "Auto confirm"). Then run in the SQL Editor:
   `insert into public.admins (user_id) select id from auth.users where email = 'YOUR-EMAIL';`
4. **Keys**: Project Settings > API. Copy the Project URL and the publishable (anon) key into `config.js` (`SUPA`, `KEY`). Never use the service_role key.
5. **Test**: open `admin.html`, sign in, click "Import sample products" (once), then add and delete products. Check `index.html` shows them.
6. **Deploy**: push the folder to GitHub and import it in Vercel (no build settings needed). This repository is currently hosted on Vercel, not GitHub Pages. Add the custom domain under Vercel > Settings > Domains.

## Cloudflare and admin protection

1. Add `okirorinnocent.tech` to Cloudflare and change the registrar nameservers to Cloudflare's two assigned nameservers. Keep the existing Vercel CNAME for `samaritan.agro` pointing to the exact target shown in Vercel > Settings > Domains.
2. Keep that CNAME **DNS only** (grey cloud) while Vercel validates its certificate. `samaritan.agro.okirorinnocent.tech` is a second-level subdomain; Cloudflare full-zone Universal SSL normally covers only the root and first-level subdomains. A first-level name such as `agro.okirorinnocent.tech` is simpler if Cloudflare proxying is required.
3. In Cloudflare SSL/TLS, use **Full (strict)** only after Vercel HTTPS works. Enable Always Use HTTPS, Automatic HTTPS Rewrites, TLS 1.2 minimum, Brotli and Early Hints. Do not use Flexible mode.
4. Create a Cloudflare Turnstile widget for this hostname. Put only its public site key in `config.js` as `TURNSTILE_SITE_KEY`. In Supabase > Authentication > CAPTCHA, select Turnstile and save the secret key there; never put the secret key in this repository.
5. Add a WAF Managed Challenge rule for `/admin` and `/admin.html`, and rate-limit requests to `/admin.html`. Test from a private browser before using Block.

`admin.html`, `admin.js` and `config.js` are sent with `no-store`. The repository also sends a Content-Security-Policy-Report-Only header so browser violations can be fixed before enforcement. The site no longer depends on the Tailwind CDN (layout CSS is in `style.css`); the admin page still loads supabase-js from a pinned, SRI-checked URL.

## Troubleshooting Turnstile

If the widget shows "Unable to connect to website" or sign-in stalls:

1. **Widget hostname list** (Cloudflare Turnstile dashboard) must include `samaritan.agro.okirorinnocent.tech` and `okirorinnocent.tech`.
2. **Site key** in `config.js` (`TURNSTILE_SITE_KEY`) is copied exactly — no extra spaces or quotes.
3. **Test in incognito/private window** with no extensions/VPN; ad-blockers and privacy tools often block `challenges.cloudflare.com`.
4. **Supabase > Authentication > Attack Protection** must have **Cloudflare Turnstile enabled** with the secret key saved there (never in the repo).

If using a second-level subdomain (`samaritan.agro.okirorinnocent.tech`), Cloudflare Universal SSL covers only the root and first-level subdomains by default. A first-level name such as `agro.okirorinnocent.tech` avoids this.

## Supabase hardening

- Disable public sign-ups, require email confirmation, enable MFA for the administrator, and use a long unique password.
- Run `harden.sql` after `supabase.sql` (it also adds the `stock_qty` column the admin page needs, so existing databases must run it); it limits product fields and restricts product images to JPEG, PNG or WebP under 2 MB.
- Keep RLS enabled. Public users may read products and images; only rows in `public.admins` may write products or storage.
- The browser may contain only the publishable key. Never commit a `service_role` key.
- Restrict Authentication redirect URLs and CORS to `https://samaritan.agro.okirorinnocent.tech`.

Back up the products table and product images monthly, and monitor Cloudflare Security Events plus Supabase Auth/API logs.

**Daily use**: add a product on the admin page and it appears on the site immediately. Delete removes it for good. Tap the stock button to switch In stock / Out of stock. Price is optional; leave it empty to show "Ask for price".
Keep your admin URL private and use a strong password.
