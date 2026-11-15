# Setup (about 15 minutes)

1. **Supabase**: create a free project at supabase.com.
2. **Database**: open SQL Editor, paste all of `supabase.sql`, click Run.
3. **Admin user**: Authentication > Users > Add user (your email + a strong password, tick "Auto confirm"). Then run in the SQL Editor:
   `insert into public.admins (user_id) select id from auth.users where email = 'YOUR-EMAIL';`
4. **Keys**: Project Settings > API. Copy the Project URL and the publishable (anon) key into `config.js` (`SUPA`, `KEY`). Never use the service_role key.
5. **Test**: open `admin.html`, sign in, click "Import sample products" (once), then add and delete products. Check `index.html` shows them.
6. **Deploy**: push the folder to GitHub and import it in Vercel (no build settings needed), or upload to GitHub Pages. Add a custom domain under Vercel > Settings > Domains.

**Daily use**: add a product on the admin page and it appears on the site immediately. Delete removes it for good. Tap the stock button to switch In stock / Out of stock. Price is optional; leave it empty to show "Ask for price".
Keep your admin URL private and use a strong password.
