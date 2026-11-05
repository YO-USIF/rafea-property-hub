import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { createOpenAI } from "npm:@ai-sdk/openai@2";
import { streamText } from "npm:ai@5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SUGGEST = `أنت مهندس تخطيط مشاريع عقارية وإنشائية في السعودية. اقترح مراحل تنفيذ واقعية مرتبة زمنياً للمشروع المعطى ضمن تاريخ البدء والانتهاء المتوقع.
أعد JSON فقط بدون أي نص آخر بالشكل:
{"phases":[{"phase_name":"...","description":"...","planned_start":"YYYY-MM-DD","planned_end":"YYYY-MM-DD","budget_percent":number,"keywords":"كلمات مفتاحية مفصولة بفواصل لربط المستخلصات مثل: حفر, خرسانة"}]}
من 6 إلى 12 مرحلة، ومجموع budget_percent = 100.`;

const ANALYZE = `أنت محلل مشاريع إنشائية. حلل مراحل المشروع وتكاليفها المرتبطة (من المستخلصات وأوامر التكليف) مقارنة بتاريخ اليوم.
أعد JSON فقط بدون أي نص آخر بالشكل:
{"summary":"ملخص عام","health":"جيد|متوسط|حرج","overall_delay_days":number,"predicted_completion":"YYYY-MM-DD","phases":[{"phase_name":"...","risk":"منخفض|متوسط|مرتفع","expected_delay_days":number,"reason":"..."}],"recommendations":["..."]}
اكتب بالعربية وبإيجاز احترافي.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization" }, 401);
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: u } = await supa.auth.getUser();
    if (!u?.user) return json({ error: "Unauthorized" }, 401);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured" }, 500);

    const { mode, payload } = await req.json();
    if (mode !== "suggest" && mode !== "analyze") return json({ error: "invalid mode" }, 400);

    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const today = new Date().toISOString().slice(0, 10);
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system: mode === "suggest" ? SUGGEST : ANALYZE,
      messages: [{ role: "user", content: `تاريخ اليوم: ${today}\nالبيانات (JSON):\n${JSON.stringify(payload)}` }],
      abortSignal: req.signal,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    let text = "";
    try {
      for await (const chunk of result.textStream) text += chunk;
    } catch (e: any) {
      const status = e?.statusCode ?? e?.status ?? 500;
      if (status === 429) return json({ error: "تم تجاوز حد الطلبات، حاول بعد قليل" }, 429);
      if (status === 402) return json({ error: "رصيد الذكاء الصناعي غير كافٍ، يرجى إضافة رصيد" }, 402);
      return json({ error: e?.message || "AI error" }, status >= 400 && status < 600 ? status : 500);
    }
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return json({ error: "لم يرجع الذكاء الصناعي نتيجة صالحة" }, 502);
    return json({ result: JSON.parse(match[0]) });
  } catch (e: any) {
    if (e?.name === "AbortError") return json({ error: "aborted" }, 499);
    return json({ error: e?.message || "error" }, 500);
  }
});
