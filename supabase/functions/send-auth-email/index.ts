import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SupabaseEmailEvent {
  user: { email: string };
  email_data: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);

    const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
    if (!hookSecret) {
      throw new Error("Missing SEND_EMAIL_HOOK_SECRET");
    }

    // Verify webhook from Supabase
    const wh = new Webhook(hookSecret);
    const { user, email_data } = wh.verify(payload, headers) as SupabaseEmailEvent;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://mvndmnkgtoygsvesktgw.supabase.co";

    const { token, token_hash, redirect_to, email_action_type } = email_data;

    // Subject by action type
    const subjectByType: Record<string, string> = {
      signup: "Confirm your email",
      email_confirmation: "Confirm your email",
      magiclink: "Your login link",
      magic_link: "Your login link",
      recovery: "Reset your password",
      email_change: "Confirm your new email",
      invite: "You are invited",
      otp: "Your verification code",
    };
    const subject = subjectByType[email_action_type] || "Your verification link";

    // Compose content
    let htmlContent = "";
    if (token_hash && redirect_to) {
      const link = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height:1.5">
          <h2 style="margin:0 0 16px">${subject}</h2>
          <p>Click the button below to continue:</p>
          <p>
            <a href="${link}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">Continue</a>
          </p>
          <p>Or copy and paste this link into your browser:<br/>
            <a href="${link}">${link}</a>
          </p>
          <p style="color:#6b7280;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
        </div>`;
    } else if (token) {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height:1.5">
          <h2 style="margin:0 0 16px">${subject}</h2>
          <p>Use the code below to continue:</p>
          <pre style="font-size:20px;background:#f3f4f6;padding:12px;border-radius:6px">${token}</pre>
          <p style="color:#6b7280;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
        </div>`;
    } else {
      throw new Error("Unsupported email data: missing token or token_hash/redirect_to");
    }

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("Missing BREVO_API_KEY");
    }

    const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL") ?? "bearded.sempai@gmail.com";
    const senderName = Deno.env.get("BREVO_SENDER_NAME") ?? "Magit";

    // Send via Brevo API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: user.email }],
        subject,
        htmlContent,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Brevo error:", result);
      throw new Error(`Brevo send failed: ${response.status} ${response.statusText}`);
    }

    console.log("Email sent successfully via Brevo", { to: user.email, email_action_type });

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("send-auth-email error:", error?.message || error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
