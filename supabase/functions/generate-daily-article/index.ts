import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const body = await req.json().catch(() => ({}));
  const explicitTopic: string | undefined = body?.topic;
  const explicitCategory: string | undefined = body?.category;
  const topicId: string | undefined = body?.topic_id;

  let queueRow: any = null;
  let topic = explicitTopic;
  let category = explicitCategory || 'general';

  if (!topic) {
    const query = supabase
      .from('article_topics_queue')
      .select('*')
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: true })
      .limit(1);
    const { data } = topicId
      ? await supabase.from('article_topics_queue').select('*').eq('id', topicId).maybeSingle()
      : await query.maybeSingle();
    queueRow = data;
    if (!queueRow) {
      return new Response(JSON.stringify({ status: 'no_pending_topics' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    topic = queueRow.topic;
    category = queueRow.category || 'general';
  }

  const prompt = `Write a comprehensive, engaging blog article about "${topic}" for a keto/low-carb health audience.

Return STRICT JSON with keys: title (string, catchy, 8-14 words), excerpt (string, 1-2 sentences, ~160 chars), content (HTML string with <h2>, <h3>, <p>, <ul>, <li>, <strong> tags — 700-1200 words, well-structured with 3-5 sections).

No markdown, no code fences. Only valid JSON.`;

  const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Lovable-API-Key': LOVABLE_API_KEY,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are an expert keto/nutrition writer. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!aiResp.ok) {
    const text = await aiResp.text();
    if (queueRow) {
      await supabase.from('article_topics_queue').update({ status: 'failed', error_message: text.slice(0, 500) }).eq('id', queueRow.id);
    }
    return new Response(JSON.stringify({ error: 'AI call failed', status: aiResp.status, detail: text }), {
      status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const aiData = await aiResp.json();
  const raw = aiData?.choices?.[0]?.message?.content ?? '{}';
  let parsed: any;
  try { parsed = JSON.parse(raw); } catch { parsed = { title: topic, excerpt: '', content: `<p>${raw}</p>` }; }

  const title = String(parsed.title || topic).slice(0, 200);
  const excerpt = String(parsed.excerpt || '').slice(0, 300);
  const content = String(parsed.content || '');
  const slug = slugify(title) + '-' + Date.now().toString(36);

  // Admin user (for user_id)
  const { data: adminRole } = await supabase.from('user_roles').select('user_id').eq('role', 'admin').limit(1).maybeSingle();
  const adminUserId = adminRole?.user_id;

  const { data: inserted, error: insertError } = await supabase
    .from('articles')
    .insert({
      title,
      slug,
      excerpt,
      content,
      category,
      is_published: true,
      user_id: adminUserId,
    })
    .select()
    .single();

  if (insertError) {
    if (queueRow) {
      await supabase.from('article_topics_queue').update({ status: 'failed', error_message: insertError.message }).eq('id', queueRow.id);
    }
    return new Response(JSON.stringify({ error: 'Insert failed', detail: insertError.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (queueRow) {
    await supabase.from('article_topics_queue').update({ status: 'generated', generated_article_id: inserted.id }).eq('id', queueRow.id);
  }

  return new Response(JSON.stringify({ status: 'ok', article: inserted }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
