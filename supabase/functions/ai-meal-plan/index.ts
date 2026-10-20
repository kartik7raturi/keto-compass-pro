import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";
import { createResponsesCall } from "../_shared/responses.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const Body = z.object({
  preferences: z.string().max(500).default(""),
  restrictions: z.string().max(500).default(""),
  goals: z.string().max(500).default(""),
  days: z.number().int().min(1).max(7).default(3),
  calories: z.number().int().min(800).max(5000).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!userData?.user) return json({ error: "Please sign in to create a meal plan." }, 401);

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
  const p = parsed.data;

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI is not configured." }, 500);

  const instructions =
    "You are a registered-dietitian-style keto meal planner. Create practical, low-carb (under ~25g net carbs/day) keto meal plans. " +
    "Strictly respect every food restriction and allergy. Output clean Markdown: a short intro, then for each day a '## Day N' heading with " +
    "Breakfast, Lunch, Dinner and Snack (each with dish name, key ingredients, and approx calories / net carbs / protein / fat), a daily total line, " +
    "and finish with a '## Shopping list' grouped by category. Do not give medical advice.";

  const prompt = `Create a ${p.days}-day keto meal plan.
Dietary preferences: ${p.preferences || "none given"}
Food restrictions / allergies: ${p.restrictions || "none"}
Goals: ${p.goals || "general keto weight loss"}
${p.calories ? `Daily calorie target: about ${p.calories} kcal` : ""}`;

  try {
    const { result } = createResponsesCall(
      req,
      { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
      [{ role: "user", content: prompt }],
      instructions,
    );
    const text = await result.text;
    if (!text.trim()) return json({ error: "The AI couldn't create a plan for this request." }, 422);
    return json({ plan: text });
  } catch (e: any) {
    const status = e?.statusCode ?? e?.status ?? 500;
    console.error("ai-meal-plan failed", status, e?.message);
    if (status === 429) return json({ error: "Too many requests right now. Please try again in a minute." }, 429);
    if (status === 402) return json({ error: "AI credits have run out. Please contact the site owner." }, 402);
    if (status === 403) return json({ error: "AI access is currently blocked for this site." }, 403);
    return json({ error: "Couldn't create your plan. Please try again." }, status >= 400 && status < 600 ? status : 500);
  }
});
