# Email notifications setup (Divine Rays Tech Hub)

Emails are sent by a **Supabase Edge Function** using **[Resend](https://resend.com)** (free tier is enough to test).

## What gets emailed

| Event | Recipient |
|-------|-----------|
| New ticket | All agents & admins (profiles with email) |
| Ticket claimed / assigned | Customer |
| Status changed | Customer |
| New comment | Other party (customer ↔ assignee) |
| Ticket deleted | Customer |

## 1. Create a Resend API key

1. Sign up at https://resend.com  
2. **API Keys** → create key  
3. Testing: from address `Divine Rays Support <onboarding@resend.dev>` (can only send to **your** Resend account email until you verify a domain)

## 2. Deploy Edge Function `send-ticket-email`

### Dashboard method

1. Supabase → **Edge Functions** → **Create function**  
2. Name: **`send-ticket-email`** (exact)  
3. Paste code from repo file:  
   `supabase/functions/send-ticket-email/index.ts`  
4. Deploy

### CLI method

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set RESEND_API_KEY=re_xxxxxxxx
supabase secrets set EMAIL_FROM="Divine Rays Support <onboarding@resend.dev>"
supabase functions deploy send-ticket-email
```

## 3. Set secrets

**Project Settings → Edge Functions → Secrets**

| Name | Example |
|------|---------|
| `RESEND_API_KEY` | `re_...` |
| `EMAIL_FROM` | `Divine Rays Support <onboarding@resend.dev>` |

Service role / URL are normally injected automatically.

## 4. Profiles need email addresses

```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR p.email = '');
```

## 5. App code

`js/email-notify.js` is included in the app. It:

- Listens to ticket inserts/updates/comments (Realtime)
- Calls `supabase.functions.invoke('send-ticket-email', …)`

If the function is not deployed, the app still works; check the browser console for `[email]` warnings.

## 6. Test

1. Hard refresh the site  
2. Submit a ticket as a **customer** → agent should get email  
3. Claim the ticket as **agent** → customer should get email  
4. Open **Resend → Logs** to confirm delivery  

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No email | Function not deployed, or wrong name |
| Resend 403 | Using `onboarding@resend.dev` but sending to an email that isn’t your Resend login — verify a domain or only send to yourself |
| No agent email | `profiles.email` empty — run backfill SQL |
| CORS / 401 | Stay logged in; confirm function is public invoke with user JWT |

Production: verify your domain in Resend and set `EMAIL_FROM` to that domain.
