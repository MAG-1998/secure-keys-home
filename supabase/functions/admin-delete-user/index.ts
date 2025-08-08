import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Payload = {
  target_user_id?: string;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!SUPABASE_URL || !ANON || !SERVICE) {
      throw new Error("Missing Supabase environment configuration");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Client bound to user token (for authorization checks)
    const supabaseUser = createClient(SUPABASE_URL, ANON);
    const { data: userData, error: userErr } = await supabaseUser.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid user token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const callerId = userData.user.id;

    // Verify caller is admin via SECURITY DEFINER has_role()
    const { data: isAdmin, error: roleErr } = await createClient(SUPABASE_URL, ANON, {
      auth: { persistSession: false }
    })
      .rpc('has_role', { _user_id: callerId, _role: 'admin' });

    if (roleErr) {
      console.error('[admin-delete-user] role check error', roleErr);
      throw roleErr;
    }
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const body: Payload = await req.json().catch(() => ({}));
    const targetUserId = body.target_user_id;
    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "target_user_id is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (targetUserId === callerId) {
      return new Response(JSON.stringify({ error: "Cannot delete your own account" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Service client for privileged operations
    const supabaseService = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false } });

    // 1) Delete auth user
    const { error: delErr } = await supabaseService.auth.admin.deleteUser(targetUserId);
    if (delErr) {
      console.error('[admin-delete-user] delete auth user error', delErr);
      throw delErr;
    }

    // 2) Delete profile (no FK cascade in schema)
    const { error: profErr } = await supabaseService
      .from('profiles')
      .delete()
      .eq('user_id', targetUserId);
    if (profErr) {
      console.warn('[admin-delete-user] profile delete warning', profErr.message);
    }

    // 3) Log to role_audit_log
    const { error: logErr } = await supabaseService.from('role_audit_log').insert({
      user_id: targetUserId,
      target_user_id: targetUserId,
      changed_by: callerId,
      old_role: null,
      new_role: 'deleted',
      action: 'account_deletion',
      created_at: new Date().toISOString(),
    });
    if (logErr) {
      console.warn('[admin-delete-user] audit log warning', logErr.message);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[admin-delete-user] error', msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
