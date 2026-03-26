import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  jd: `你是一位资深HR顾问和职场前辈。请用大白话把以下JD翻译成普通人能听懂的版本。
输出必须包含以下三个版块（用Markdown格式）：
## 🔍 大白话翻译
### 这活儿到底干啥？
### 要啥硬实力？
### ⚠️ 潜在的坑
要求：语言接地气，有洞察力，把行业黑话翻译成人话。每个版块给3-5个要点。`,

  daily: `你是一位在该岗位工作3年的前辈。请根据JD描述的岗位，描述这个岗位一天的真实日常。
输出用Markdown格式，用时间线展示从早到晚的工作内容。
包含：会议、核心工作内容、协作对象、可能的加班情况。
要求：真实、有细节、有情绪，不要太理想化。`,

  resume: `你是一位精通ATS筛选逻辑的顶级猎头。请完成以下任务：

1. **岗位匹配度诊断 (Gap Analysis)**：对比JD和简历，列出核心优势(✅)、致命短板(❌)、核心对齐策略(🎯)。

2. **ATS-Optimized 简历优化**：逐条优化简历的每段经历。对每段经历：
   - 先显示"原文"
   - 再显示"修改后"的版本（英文Bullet Points格式）
   - 用**加粗**标注所有修改处（替换的动词、植入的关键词、补充的数据）
   - 添加"💡 修改说明"解释每处修改的策略

规则：
- 替换弱动词(如"负责"→"Spearheaded"、"参与"→"Led")
- 从JD中提取关键词植入简历
- 补充量化成果（百分比、数字、规模）
- 绝不编造数据，如果简历中没有具体数字，用合理的占位符并标注[请补充]
- 输出用Markdown格式，确保**加粗**和格式正确`,

  cover: `你是一位求职信写作大师。请根据JD、简历和公司背景，写一封有灵魂的求职信。
要求：
- 有故事感的开头（不要"尊敬的HR"这种模板开头）
- 展示对公司的理解和热情
- 将个人经历与岗位需求巧妙连接
- 语气真诚、有个性，不要模板味
- 控制在300-400字
- 用Markdown格式输出`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, company, jd, resume, userPrompt } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[type];
    if (!systemPrompt) throw new Error(`Unknown type: ${type}`);

    // Build user message
    let userMessage = "";
    if (company) userMessage += `目标公司：${company}\n\n`;
    userMessage += `岗位JD：\n${jd}\n\n`;
    if (type !== "jd" && type !== "daily") {
      userMessage += `我的简历/经历：\n${resume}\n\n`;
    }

    // Sandwich prompt: system + user's custom requirements at highest priority
    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    if (userPrompt && userPrompt.trim()) {
      messages.push({
        role: "system",
        content: `【CRITICAL CONSTRAINT (绝对指令)】：在执行上述任务时，你必须、绝对、严格遵守用户的以下自定义要求，用户的要求优先级高于一切：\n\n${userPrompt}`,
      });
    }

    messages.push({ role: "user", content: userMessage });

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "请求太频繁，请稍后再试。" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 额度已用完，请前往设置充值。" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI 服务暂时不可用" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("job-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
