// Meta Conversions API proxy. Keep META_CAPI_ACCESS_TOKEN in Supabase secrets;
// never expose it in browser JavaScript.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const META_PIXEL_ID = "1759880568532895";
const DEFAULT_TEST_EVENT_CODE = "TEST1841";

type MetaConversionsPayload = {
  event_name?: string;
  event_id?: string;
  event_source_url?: string;
  action_source?: string;
  custom_data?: Record<string, unknown>;
  test_event_code?: string;
  attribution?: Record<string, unknown>;
  user_data?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const accessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  if (!accessToken) {
    return new Response(JSON.stringify({ error: "META_CAPI_ACCESS_TOKEN is not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = (await req.json()) as MetaConversionsPayload;
    if (!payload.event_name) {
      return new Response(JSON.stringify({ error: "event_name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metaBody = {
      data: [
        {
          event_name: payload.event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: payload.event_id,
          event_source_url: payload.event_source_url,
          action_source: payload.action_source || "website",
          user_data: payload.user_data || {},
          custom_data: {
            ...(payload.custom_data || {}),
            attribution: payload.attribution || null,
          },
        },
      ],
      test_event_code: payload.test_event_code || DEFAULT_TEST_EVENT_CODE,
    };

    const metaResponse = await fetch(
      `https://graph.facebook.com/v20.0/${META_PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaBody),
      },
    );

    const responseBody = await metaResponse.json();
    return new Response(JSON.stringify(responseBody), {
      status: metaResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Meta CAPI request failed", error);
    return new Response(JSON.stringify({ error: "Meta CAPI request failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
