# Divine Rays Tech Hub — Supabase setup

## Fix: shared data across devices & agents

Follow these steps once.

### 1. Create a Supabase project
1. Go to https://supabase.com and create a free project
2. Wait until the database is ready

### 2. Run the schema
1. Open **SQL Editor** → New query
2. Paste the contents of `supabase/schema.sql`
3. Click **Run**

### 3. Get your API keys
1. **Project Settings** → **API**
2. Copy:
   - Project URL
   - `anon` `public` key

### 4. Put keys in the app
Edit `js/config.js`:

```js
window.DR_CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_ANON_KEY'
};
```

Commit and push (or edit on GitHub).

### 5. Auth settings
In Supabase → **Authentication** → **Providers**:
- Enable **Email**
- For testing, disable **Confirm email** under Auth → Settings so sign-up works immediately

### 6. Test
1. Open the live site
2. Create a **Customer** account and submit a ticket
3. On another device/browser, create an **Agent** account
4. Agent should see the customer ticket

After this, data is shared for everyone — not stuck in one browser.
