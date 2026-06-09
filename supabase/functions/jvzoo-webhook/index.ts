// JVZoo IPN webhook — grants Ketopia subscriptions after verified purchases.
// Public endpoint (no JWT). JVZoo signs each POST with your Secret Key (cverify).
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Map JVZoo product IDs -> Ketopia plan. Configure via env or edit below.
// Find product IDs in JVZoo dashboard. $19 = basic, $99 = vip (yearly).
const PRODUCT_PLAN_MAP: Record<string, "basic" | "vip" | "vip_lifetime"> = {
  // "12345": "basic",
  // "67890": "vip",
};

function verifyJvzooSignature(params: Record<string, string>, secret: string): boolean {
  const cverify = (params["cverify"] || "").toUpperCase();
  if (!cverify) return false;
  const keys = Object.keys(params).filter((k) => k !== "cverify").sort();
  const concat = keys.map((k) => params[k]).join("|") + "|" + secret;
  const sha = createHash("sha1").update(concat, "utf8").digest("hex").toUpperCase();
  return sha.slice(0, 8) === cverify;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const secret = Deno.env.get("JVZOO_SECRET_KEY");
    if (!secret) {
      return new Response(JSON.stringify({ error: "JVZOO_SECRET_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const form = await req.formData();
    const params: Record<string, string> = {};
    form.forEach((v, k) => { params[k] = String(v); });

    if (!verifyJvzooSignature(params, secret)) {
      console.warn("JVZoo IPN: signature mismatch", params);
      return new Response("Invalid signature", { status: 401, headers: corsHeaders });
    }

    const txnType = params["ctransaction"] || "";   // SALE, BILL, RFND, CGBK, INSF
    const email = params["ccustemail"] || "";
    const productId = params["cproditem"] || "";
    const amount = parseFloat(params["ctransamount"] || "0");
    const orderId = params["ctransreceipt"] || "";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (["SALE", "BILL"].includes(txnType)) {
      const plan = PRODUCT_PLAN_MAP[productId] ?? (amount >= 90 ? "vip" : "basic");
      const { error } = await supabase.rpc("grant_ketopia_subscription", {
        p_email: email, p_plan: plan, p_amount: amount,
        p_product_id: productId, p_order_id: orderId,
      });
      if (error) {
        console.error("grant error", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log(`JVZoo ${txnType}: granted ${plan} to ${email}`);
    } else if (["RFND", "CGBK", "INSF"].includes(txnType)) {
      // Revoke on refund/chargeback
      const { data: user } = await supabase
        .from("profiles").select("user_id").ilike("email", email).maybeSingle();
      if (user?.user_id) {
        await supabase.from("user_subscriptions").update({
          plan_type: "free", is_active: false, payment_status: "refunded",
        }).eq("user_id", user.user_id);
      }
      console.log(`JVZoo ${txnType}: revoked for ${email}`);
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (e) {
    console.error("JVZoo IPN error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
