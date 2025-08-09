import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateTicketPayload {
  subject?: string | null;
  message: string;
  property_id?: string | null;
  type?: 'general' | 'financing' | 'complaint';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: "Missing Supabase env vars" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const payload = (await req.json()) as CreateTicketPayload;
    if (!payload?.message || typeof payload.message !== 'string') {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = userData.user.id;

    // 1) Create ticket (auto-assign via trigger)
    const { data: ticket, error: ticketErr } = await supabase
      .from('tickets')
      .insert({
        user_id: userId,
        subject: payload.subject ?? null,
        initial_message: payload.message,
        property_id: payload.property_id ?? null,
        type: payload.type ?? undefined,
      })
      .select('id, assigned_to, priority, type')
      .single();

    if (ticketErr || !ticket) {
      console.error('ticket insert error', ticketErr);
      return new Response(JSON.stringify({ error: ticketErr?.message ?? 'Failed to create ticket' }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!ticket.assigned_to) {
      // Should not happen with our trigger, but safe-guard
      return new Response(JSON.stringify({ error: "No moderator/admin available to assign" }), {
        status: 503,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // 2) Send first message linked to ticket
    const { error: msgErr } = await supabase.from('messages').insert({
      sender_id: userId,
      recipient_id: ticket.assigned_to,
      content: payload.message,
      ticket_id: ticket.id,
    } as any);

    if (msgErr) {
      console.error('message insert error', msgErr);
      return new Response(JSON.stringify({ error: msgErr.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({
        ticket_id: ticket.id,
        assigned_to: ticket.assigned_to,
        priority: ticket.priority,
        type: ticket.type,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e) {
    console.error('support-create-ticket error', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
