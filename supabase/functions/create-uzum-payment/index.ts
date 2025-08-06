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
      method_param: 'uzum',
      ip_addr: clientIP,
      user_agent_str: userAgent
    });

    if (logError) {
      throw new Error(logError.message);
    }

    // Uzum Bank API integration
    const uzumApiUrl = "https://processing.uzumbank.uz/api/v1";
    const merchantId = Deno.env.get("UZUM_MERCHANT_ID");
    const secretKey = Deno.env.get("UZUM_SECRET_KEY");

    if (!merchantId || !secretKey) {
      throw new Error("Uzum Bank credentials not configured");
    }

    // Create payment request for Uzum Bank
    const orderId = crypto.randomUUID();
    const paymentData = {
      merchant_id: merchantId,
      amount: amount,
      currency: currency,
      order_id: orderId,
      description: "Property listing payment",
      return_url: return_url,
      cancel_url: cancel_url,
      customer_id: user?.id || "guest"
    };

    // Generate signature (this would need actual implementation based on Uzum's requirements)
    const signature = btoa(`${merchantId}:${orderId}:${amount}:${secretKey}`);

    // Create payment session
    const response = await fetch(`${uzumApiUrl}/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${signature}`
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create Uzum payment");
    }

    return new Response(
      JSON.stringify({ 
        payment_url: result.payment_url || `https://pay.uzumbank.uz/payment/${orderId}`,
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