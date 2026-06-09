// Integration test: signs a sample JVZoo payload with the real secret and posts it
// to the deployed jvzoo-webhook endpoint, then verifies it was logged + processed.
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SECRET = Deno.env.get("JVZOO_SECRET_KEY")!;

async function sign(params: Record<string, string>): Promise<string> {
  const keys = Object.keys(params).sort();
  const concat = keys.map((k) => params[k]).join("|") + "|" + SECRET;
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(concat));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase().slice(0, 8);
}

async function post(params: Record<string, string>) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/jvzoo-webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

Deno.test("rejects invalid signature", async () => {
  const r = await post({
    ccustname: "Bad", ccustemail: "bad@test.com", ctransreceipt: "BAD-1",
    ctransaction: "SALE", ctransamount: "19.00", cproditem: "1", cverify: "DEADBEEF",
  });
  assertEquals(r.status, 401);
});

Deno.test("accepts valid SALE and is idempotent", async () => {
  const receipt = "TEST-" + Date.now();
  const params: Record<string, string> = {
    ccustname: "Test User",
    ccustemail: "test+jvzoo@ketopia.test",
    ctransreceipt: receipt,
    ctransaction: "SALE",
    ctransamount: "19.00",
    cproditem: "100001",
    cprodtitle: "Ketopia Basic",
    ctranspaymentmethod: "PAYPAL",
    ctransvendor: "ketopia",
    cvendthru: "ketopia",
  };
  params.cverify = await sign(params);

  const first = await post(params);
  assertEquals(first.status, 200);
  console.log("first:", first.body);

  const second = await post(params);
  assertEquals(second.status, 200);
  console.log("second (should be duplicate):", second.body);
  if (!second.body.includes("duplicate")) {
    throw new Error("Idempotency failed — second call was not marked duplicate");
  }
});
