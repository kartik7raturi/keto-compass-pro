// JVZoo IPN webhook — verifies signature, enforces idempotency, logs every request.
// Public endpoint (no JWT). JVZoo signs each POST with your Secret Key (cverify).
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Map JVZoo product IDs -> Ketopia plan. Optional override; otherwise amount-based.
const PRODUCT_PLAN_MAP: Record<string, "basic" | "vip" | "vip_lifetime"> = {
  // "12345": "basic",  // $19
  // "67890": "vip",    // $99
};
// JVZoo product IDs for the standalone Video Course ($47). Grants course access only.
const COURSE_PRODUCT_IDS = new Set<string>([
  // Add your JVZoo course product ID(s) here, e.g.: "33333"
]);

// JVZoo signature: concat all POST fields (sorted alphabetically by key) with "|",
// append "|<secret>", SHA1, uppercase, first 8 chars must equal cverify.
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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Helper to write a log row + return a JSON response.
  const logAndRespond = async (
    log: Record<string, unknown>,
    status: number,
    body: Record<string, unknown> | string,
  ) => {
    const responseBody = typeof body === "string" ? body : JSON.stringify(body);
    try {
      await supabase.from("jvzoo_webhook_logs").insert({
        ...log,
        response_status: status,
        response_body: responseBody.slice(0, 2000),
      });
    } catch (e) {
      console.error("Failed to write webhook log:", e);
    }
    return new Response(responseBody, {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  };

  let params: Record<string, string> = {};
  try {
    const secret = Deno.env.get("JVZOO_SECRET_KEY");
    if (!secret) {
      return await logAndRespond(
        { raw_payload: {}, error_message: "JVZOO_SECRET_KEY not configured" },
        500, { error: "JVZOO_SECRET_KEY not configured" },
      );
    }

    // JVZoo posts application/x-www-form-urlencoded
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      params = await req.json();
    } else {
      const form = await req.formData();
      form.forEach((v, k) => { params[k] = String(v); });
    }

    const txnType = params["ctransaction"] || "";
    const email = params["ccustemail"] || "";
    const productId = params["cproditem"] || "";
    const amount = parseFloat(params["ctransamount"] || "0");
    const orderId = params["ctransreceipt"] || "";

    const baseLog = {
      transaction_receipt: orderId || null,
      transaction_type: txnType || null,
      product_id: productId || null,
      customer_email: email || null,
      amount: isNaN(amount) ? null : amount,
      raw_payload: params,
    };

    // 1. Signature check
    const sigValid = verifyJvzooSignature(params, secret);
    if (!sigValid) {
      console.warn("JVZoo IPN: signature mismatch", { orderId, txnType });
      return await logAndRespond(
        { ...baseLog, signature_valid: false, error_message: "Invalid signature" },
        401, { error: "Invalid signature" },
      );
    }

    // 2. Idempotency — skip if this (receipt, type) was already processed
    if (orderId && txnType) {
      const { data: existing } = await supabase
        .from("jvzoo_webhook_logs")
        .select("id")
        .eq("transaction_receipt", orderId)
        .eq("transaction_type", txnType)
        .eq("processed", true)
        .maybeSingle();

      if (existing) {
        return await logAndRespond(
          { ...baseLog, signature_valid: true, processed: false, duplicate: true,
            error_message: "Duplicate event — already processed" },
          200, { ok: true, duplicate: true },
        );
      }
    }

    // 3. Process transaction
    if (["SALE", "BILL"].includes(txnType)) {
      // Course-only product → grant course access (no full membership)
      if (COURSE_PRODUCT_IDS.has(productId)) {
        const { error } = await supabase.rpc("grant_course_access", {
          p_email: email, p_amount: amount,
          p_product_id: productId, p_order_id: orderId,
        });
        if (error) {
          return await logAndRespond(
            { ...baseLog, signature_valid: true, processed: false,
              error_message: `grant_course_access: ${error.message}` },
            500, { error: error.message },
          );
        }
        console.log(`JVZoo ${txnType}: granted course access to ${email}`);
        return await logAndRespond(
          { ...baseLog, signature_valid: true, processed: true },
          200, { ok: true, course: true, email },
        );
      }

      const plan = PRODUCT_PLAN_MAP[productId] ?? (amount >= 90 ? "vip_lifetime" : amount >= 30 ? "vip" : "basic");
      const { error } = await supabase.rpc("grant_ketopia_subscription", {
        p_email: email, p_plan: plan, p_amount: amount,
        p_product_id: productId, p_order_id: orderId,
      });
      if (error) {
        console.error("grant error", error);
        return await logAndRespond(
          { ...baseLog, signature_valid: true, processed: false,
            error_message: `grant_ketopia_subscription: ${error.message}` },
          500, { error: error.message },
        );
      }
      console.log(`JVZoo ${txnType}: granted ${plan} to ${email}`);
      return await logAndRespond(
        { ...baseLog, signature_valid: true, processed: true },
        200, { ok: true, plan, email },
      );
    } else if (["RFND", "CGBK", "INSF"].includes(txnType)) {
      const { data: user } = await supabase
        .from("profiles").select("user_id").ilike("email", email).maybeSingle();
      if (user?.user_id) {
        await supabase.from("user_subscriptions").update({
          plan_type: "free", is_active: false, payment_status: "refunded",
        }).eq("user_id", user.user_id);
      }
      console.log(`JVZoo ${txnType}: revoked for ${email}`);
      return await logAndRespond(
        { ...baseLog, signature_valid: true, processed: true },
        200, { ok: true, revoked: true, email },
      );
    }

    // Unknown / ignored transaction type
    return await logAndRespond(
      { ...baseLog, signature_valid: true, processed: false,
        error_message: `Unhandled transaction type: ${txnType}` },
      200, { ok: true, ignored: true, txnType },
    );
  } catch (e) {
    console.error("JVZoo IPN error", e);
    return await logAndRespond(
      { raw_payload: params, error_message: String(e) },
      500, { error: String(e) },
    );
  }
});
