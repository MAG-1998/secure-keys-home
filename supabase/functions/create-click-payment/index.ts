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
      method_param: 'click',
      ip_addr: clientIP,
      user_agent_str: userAgent
    });

    if (logError) {
      throw new Error(logError.message);
    }

    // Click API integration
    const clickApiUrl = "https://my.click.uz/services/pay";
    const merchantId = Deno.env.get("CLICK_MERCHANT_ID");
    const serviceId = Deno.env.get("CLICK_SERVICE_ID");
    const secretKey = Deno.env.get("CLICK_SECRET_KEY");

    if (!merchantId || !serviceId || !secretKey) {
      throw new Error("Click credentials not configured");
    }

    // Create payment request for Click
    const orderId = crypto.randomUUID();
    const paymentData = {
      service_id: serviceId,
      merchant_id: merchantId,
      amount: amount,
      transaction_param: orderId,
      return_url: return_url,
      merchant_user_id: user?.id || "guest"
    };

    // Generate payment URL
    const paymentUrl = `${clickApiUrl}?${new URLSearchParams({
      service_id: serviceId,
      merchant_id: merchantId,
      amount: amount.toString(),
      transaction_param: orderId,
      return_url: return_url,
      merchant_user_id: user?.id || "guest"
    })}`;

    return new Response(
      JSON.stringify({ 
        payment_url: paymentUrl,
        order_id: orderId 
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