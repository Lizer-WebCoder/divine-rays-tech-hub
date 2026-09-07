/**
 * Divine Rays — send ticket email (Resend)
 * Deploy: supabase functions deploy send-ticket-email
 * Secrets: RESEND_API_KEY, EMAIL_FROM
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Body = {
  type?: string;
  to_email?: string;
  to_user_id?: string;
  subject?: string;
  title?: string;
  message?: string;
  ticket_number?: string;
  ticket_id?: string;
  meta?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const EMAIL_FROM =
      Deno.env.get("EMAIL_FROM") || "Divine Rays Support <onboarding@resend.dev>";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!RESEND_API_KEY) {
      return json({ error: "RESEND_API_KEY not configured" }, 500);
    }

    const body = (await req.json()) as Body;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    let toEmail = (body.to_email || "").trim().toLowerCase();
    let toName = "";

    if (!toEmail && body.to_user_id) {
      const { data: prof } = await admin
        .from("profiles")
        .select("email, full_name")
        .eq("id", body.to_user_id)
        .maybeSingle();
      toEmail = (prof?.email || "").toLowerCase();
      toName = prof?.full_name || "";
    }

    if (!toEmail && body.to_user_id) {
      const { data: u } = await admin.auth.admin.getUserById(body.to_user_id);
      toEmail = (u?.user?.email || "").toLowerCase();
    }

    if (!toEmail) {
      return json({ error: "No recipient email" }, 400);
    }

    const ticketNo = body.ticket_number || "Ticket";
    const title = body.title || "";
    const subject =
      body.subject || subjectFor(body.type || "update", ticketNo, title);
    const message =
      body.message || defaultMessage(body.type || "update", ticketNo, title);

    const html = wrapHtml({
      toName: toName || "there",
      subject,
      message,
      ticketNo,
      title,
      type: body.type || "update",
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [toEmail],
        subject,
        html,
        text: message,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error", data);
      return json({ error: data?.message || "Resend failed", detail: data }, 502);
    }

    return json({ ok: true, id: data?.id, to: toEmail });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function subjectFor(type: string, num: string, title: string) {
  const t = title ? `: ${title}` : "";
  switch (type) {
    case "ticket_created":
      return `[Divine Rays] New ticket ${num}${t}`;
    case "ticket_claimed":
      return `[Divine Rays] ${num} has been claimed`;
    case "status_changed":
      return `[Divine Rays] ${num} status updated`;
    case "new_comment":
      return `[Divine Rays] New reply on ${num}`;
    case "ticket_deleted":
      return `[Divine Rays] ${num} was closed/deleted`;
    default:
      return `[Divine Rays] Update on ${num}`;
  }
}

function defaultMessage(type: string, num: string, title: string) {
  switch (type) {
    case "ticket_created":
      return `A new support ticket ${num} was submitted${title ? ` (${title})` : ""}. Please review it in Tech Hub.`;
    case "ticket_claimed":
      return `Good news — ticket ${num} has been claimed by a support agent and is being worked on.`;
    case "status_changed":
      return `The status of ticket ${num} has been updated. Open Tech Hub to see the latest details.`;
    case "new_comment":
      return `There is a new reply on ticket ${num}. Sign in to Tech Hub to read and respond.`;
    case "ticket_deleted":
      return `Ticket ${num} has been removed by support. If you still need help, please submit a new ticket.`;
    default:
      return `There is an update on ticket ${num}.`;
  }
}

function wrapHtml(p: {
  toName: string;
  subject: string;
  message: string;
  ticketNo: string;
  title: string;
  type: string;
}) {
  const safe = (s: string) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0c0c12;font-family:Inter,Segoe UI,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c12;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#15151f;border:1px solid #2a2a3e;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:20px 24px;background:linear-gradient(135deg,#7c6af0,#6d5ef5);">
          <div style="color:#fff;font-size:18px;font-weight:700;">Divine Rays Tech Hub</div>
          <div style="color:rgba(255,255,255,0.85);font-size:13px;margin-top:4px;">Support notification</div>
        </td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 12px;color:#eeeef6;font-size:15px;">Hi ${safe(p.toName)},</p>
          <p style="margin:0 0 16px;color:#b0b0c8;font-size:14px;line-height:1.55;">${safe(p.message)}</p>
          <table cellpadding="0" cellspacing="0" style="margin:16px 0;background:#1c1c2a;border-radius:10px;width:100%;">
            <tr><td style="padding:14px 16px;">
              <div style="color:#9494ae;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;">Ticket</div>
              <div style="color:#eeeef6;font-size:16px;font-weight:700;margin-top:4px;">${safe(p.ticketNo)}</div>
              ${p.title ? `<div style="color:#9494ae;font-size:13px;margin-top:4px;">${safe(p.title)}</div>` : ""}
            </td></tr>
          </table>
          <p style="margin:0;color:#6b6b86;font-size:12px;line-height:1.5;">You received this because of activity on your Divine Rays support account. Sign in to the portal for full details.</p>
        </td></tr>
        <tr><td style="padding:14px 24px;border-top:1px solid #2a2a3e;color:#6b6b86;font-size:11px;">
          © Divine Rays · Lizzz · All Rights Reserved
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
