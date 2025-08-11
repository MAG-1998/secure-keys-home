import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Minimal replica of district canonicalization used in the frontend
const DISTRICT_SYNONYMS: Record<string, string[]> = {
  Bektemir: ["bektemir", "бектемир"],
  Chilonzor: ["chilanzar", "chilonzor", "чиланзар"],
  Mirobod: ["mirobod", "mirabad", "миробод", "мираба"],
  "Mirzo-Ulugbek": ["mirzo ulugbek", "mirzo-ulugbek", "мирзо-улугбек"],
  Sergeli: ["sergeli", "сергел"],
  Shaykhantahur: ["shaykhantakhur", "shaykhantahur", "shayxontohur", "шайхантахур"],
  Uchtepa: ["uchtepa", "учтепа"],
  Yakkasaray: ["yakkasaray", "yakkasaroy", "яккасарай"],
  Yunusobod: ["yunusabad", "yunusobod", "юнусабад"],
  Yashnobod: ["yashnabad", "yashnobod", "яшнобод"],
  Olmazor: ["olmazor", "almazar", "алмазар"],
  Yangihayot: ["yangihayot", "yangihayat", "янгиҳаёт", "янгиҳает"],
};

function canonicalizeDistrict(raw: string): string | null {
  const lc = (raw || "").toLowerCase();
  for (const [key, syns] of Object.entries(DISTRICT_SYNONYMS)) {
    if (syns.some((s) => lc.includes(s))) return key;
  }
  return null;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 200, preview = false, property_id } = (await req.json().catch(() => ({}))) as { limit?: number; preview?: boolean; property_id?: string };

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseAuth.auth.getUser(token);
    const user = userData.user;
    if (!user)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    // Authorize: only admins or moderators
    const { data: isAdmin } = await supabaseAuth.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    const { data: isMod } = await supabaseAuth.rpc("has_role", {
      _user_id: user.id,
      _role: "moderator",
    });
    if (!isAdmin && !isMod) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Yandex Geocoder API
    const Y_KEY =
      Deno.env.get("YANDEX_GEOCODER_API_KEY") || Deno.env.get("YANDEX_API_KEY") || "";
    if (!Y_KEY) {
      return new Response(
        JSON.stringify({ error: "Yandex Geocoder key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Fetch candidates
    let query = supabaseService
      .from("properties")
      .select("id, latitude, longitude, location, district");

    if (property_id) {
      query = query.eq("id", property_id);
    } else {
      query = query
        .or("district.is.null,district.eq.")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .limit(Math.min(Math.max(limit, 1), 500));
    }

    const { data: props, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;

    const total = props?.length || 0;
    let updated = 0;
    const suggestions: Array<{
      id: string;
      current_district: string | null;
      suggested_district: string;
      source: "geocoder" | "location";
    }> = [];

    for (const p of props || []) {
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      if (!isFinite(lat) || !isFinite(lng)) continue;

      let canon: string | null = null;
      let source: "geocoder" | "location" = "geocoder";

      // Call Yandex geocoder
      const url = new URL("https://geocode-maps.yandex.ru/1.x/");
      url.searchParams.set("apikey", Y_KEY);
      url.searchParams.set("format", "json");
      // Yandex expects "lon,lat"
      url.searchParams.set("geocode", `${lng},${lat}`);
      url.searchParams.set("kind", "district");
      url.searchParams.set("results", "1");
      url.searchParams.set("lang", "ru_RU");

      try {
        const resp = await fetch(url.toString());
        const json = await resp.json();
        const member = json?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
        const name = member?.name || member?.description || "";
        // Try from Address.Components if available
        const comps: any[] =
          member?.metaDataProperty?.GeocoderMetaData?.Address?.Components || [];
        const districtComp = comps.find(
          (c) => (c?.kind || "").toLowerCase() === "district",
        );
        const rawCandidate = districtComp?.name || name;
        canon = canonicalizeDistrict(String(rawCandidate || ""));
      } catch (_) {
        // ignore
      }

      // Fallback: try location text if geocoder failed
      if (!canon && p.location) {
        canon = canonicalizeDistrict(String(p.location));
        if (canon) source = "location";
      }

      if (canon) {
        if (preview) {
          suggestions.push({
            id: p.id,
            current_district: p.district ?? null,
            suggested_district: canon,
            source,
          });
        } else {
          const { error: updErr } = await supabaseService
            .from("properties")
            .update({ district: canon })
            .eq("id", p.id);
          if (!updErr) updated += 1;
        }
      }

      // Be gentle with rate limits
      await sleep(80);
    }

    if (preview) {
      return new Response(
        JSON.stringify({ total, suggested: suggestions.length, suggestions }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    return new Response(JSON.stringify({ total, updated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
