import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const META_PIXEL_ID = "1759880568532895";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!userData?.user) return json({ error: "Unauthorized" }, 401);
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return json({ error: "Forbidden" }, 403);

  const token = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  const status = {
    pixel_id: META_PIXEL_ID,
    token_configured: !!token,
    token_valid: false as boolean,
    tracking_active: false as boolean,
    detail: "" as string,
    checked_at: new Date().toISOString(),
  };

  if (!token) {
    status.detail = "No access token saved. Server-side purchase tracking is off; only the browser pixel is tracking.";
    return json(status);
  }

  try {
    const r = await fetch(
      `https://graph.facebook.com/v20.0/${META_PIXEL_ID}?fields=id,name,last_fired_time&access_token=${encodeURIComponent(token)}`,
    );
    const body = await r.json();
    if (r.ok && body?.id) {
      status.token_valid = true;
      status.tracking_active = true;
      status.detail = body.last_fired_time
        ? `Token works. Pixel "${body.name ?? META_PIXEL_ID}" last received an event at ${body.last_fired_time}.`
        : `Token works for pixel "${body.name ?? META_PIXEL_ID}".`;
    } else {
      status.detail = `Meta rejected the token: ${body?.error?.message ?? r.status}`;
    }
  } catch (e) {
    status.detail = "Couldn't reach Meta to check the token. Try again shortly.";
    console.error(e);
  }
  return json(status);
});
