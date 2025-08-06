import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = "UZS", return_url, cancel_url } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("Authentication required");
    }

    // Get client IP and user agent for security logging
    const clientIP = req.headers.get("cf-connecting-ip") || 
                    req.headers.get("x-forwarded-for") || 
                    "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Log and validate payment request
    const { error: logError } = await supabaseClient.rpc('log_payment_request', {
      user_id_param: user.id,
      amount_param: amount,
      currency_param: currency,
      method_param: 'payme',
      ip_addr: clientIP,
      user_agent_str: userAgent
    });

    if (logError) {
      throw new Error(logError.message);
    }

    // Payme API integration
    const paymeApiUrl = "https://checkout.paycom.uz";
    const merchantId = Deno.env.get("PAYME_MERCHANT_ID");
    const secretKey = Deno.env.get("PAYME_SECRET_KEY");

    if (!merchantId || !secretKey) {
      throw new Error("Payme credentials not configured");
    }

    // Create payment request for Payme
    const paymentData = {
      merchant: merchantId,
      amount: amount,
      account: {
        order_id: crypto.randomUUID()
      },
      callback: return_url,
      callback_timeout: 15000,
      lang: "uz"
    };

    // Generate payment URL
    const paymentUrl = `${paymeApiUrl}/?${new URLSearchParams({
      m: merchantId,
      ac: JSON.stringify(paymentData.account),
      a: amount.toString(),
      c: return_url,
      ct: "15000",
      l: "uz"
    })}`;

    return new Response(
      JSON.stringify({ 
        payment_url: paymentUrl,
        order_id: paymentData.account.order_id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});