import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Copy, Download, ThumbsUp, ThumbsDown } from "lucide-react";
import type { OutputTab } from "@/types/job";
import { OUTPUT_TAB_LABELS, OUTPUT_TAB_ICONS } from "@/types/job";
import { toast } from "sonner";

const TABS: OutputTab[] = ["jd", "daily", "resume", "cover"];

// Demo content
const DEMO_CONTENT: Record<OutputTab, string> = {
  jd: `## 🔍 大白话翻译

### 这活儿到底干啥？
简单来说，就是当一个 **AI产品的"翻译官"**——把工程师的技术语言翻译成用户能用的产品，把老板的商业目标翻译成团队能执行的需求。

### 要啥硬实力？
- **数据分析能力** → 得会看数据、讲故事，SQL 是基本功
- **跨部门沟通** → 你是工程、设计、市场中间的润滑剂
- **AI/ML 基础理解** → 不用会写模型，但得知道模型能干啥、不能干啥

### ⚠️ 潜在的坑
- "fast-paced" = 加班可能比较多
- "ambiguity" = 需求经常变，得扛得住`,

  daily: `## ☀️ 这个岗位的一天

**9:00** ☕ 到公司，打开邮件，处理昨晚美国同事的反馈

**9:30** 📊 看昨日数据 Dashboard，关注核心指标有没有异常

**10:00** 🤝 和工程团队 Standup，对齐本周 Sprint 进度

**11:00** 📝 写 PRD，把新功能的需求文档补全

**12:00** 🍱 午饭，可能约设计师边吃边聊 UI 方案

**14:00** 🎯 和老板 1:1，汇报项目进展，讨论优先级调整

**15:00** 💻 Review 设计稿，给反馈

**16:30** 📞 和市场团队对齐下个月推广计划

**18:00** 📋 整理今天的 Action Items，更新 Jira

**19:00** 🏠 收工（如果没有紧急上线的话）`,

  resume: `## 📊 岗位匹配度诊断 (Gap Analysis)

✅ **核心优势**: 数据敏锐度高、有完整产品落地经验
❌ **致命短板**: 缺乏B端商业化变现经验
🎯 **核心对齐策略**: 强调"数据驱动增长"潜力，弱化B端经验缺口

---

## 📝 ATS-Optimized 简历优化

### Work Experience 1

**原文**: 负责日常数据的整理，提高了效率。

**修改后**:
- **Spearheaded** daily data processing pipeline using **Python** and **SQL**, increasing operational efficiency by **30%**
- **Designed** and implemented automated reporting **dashboard** serving **50+** stakeholders across 3 departments
- **Drove** data-informed **product decisions** that contributed to **15% DAU growth** in Q3 2025

> 💡 修改说明: \`替换弱动词\` → Spearheaded/Designed/Drove | \`植入关键词\` → Python, SQL, Dashboard | \`补充量化成果(ATS友好)\` → 30%, 50+, 15%

---

### Work Experience 2

**原文**: 参与产品需求讨论，协助完成产品上线。

**修改后**:
- **Led** cross-functional **product requirement** workshops with engineering and design teams, reducing requirement ambiguity by **40%**
- **Orchestrated** end-to-end product launch for **AI-powered** feature, achieving **100K+ users** within first month

> 💡 修改说明: \`"参与"→"Led"\` 突出主导性 | \`植入 AI-powered 关键词\` | \`补充发布成果数据\``,

  cover: `## 💌 求职信

Dear Hiring Manager,

三年前，我在凌晨三点盯着数据看板时，发现了一个异常——用户在某个按钮上的点击率突然飙升了200%。那不是Bug，而是我们无意中触发的一个"隐藏需求"。那一刻我意识到：**数据不会说谎，但需要有人替它讲故事**。

这就是我想加入贵司AI平台团队的原因。

在过去三年里，我从零到一打造了DAU百万级的数据产品，学会了用SQL挖掘洞察、用PRD翻译需求、用Dashboard说服老板。但更重要的是，我学会了如何**在技术与商业之间搭桥**。

我相信贵司正在做的事情，不仅仅是技术的突破，更是对"如何让AI真正被普通人使用"的回答。而我，想成为这个回答的一部分。

期待与您进一步交流。

此致敬礼
[你的名字]`,
};

interface Props {
  activeTab: OutputTab;
  setActiveTab: (tab: OutputTab) => void;
  loading: OutputTab | "all" | null;
}

export default function OutputPanel({ activeTab, setActiveTab, loading }: Props) {
  const isTabLoading = loading === activeTab || loading === "all";
  const content = DEMO_CONTENT[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板！");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
          📤 AI 战略输出
        </h2>
      </div>

      {/* Tabs */}
      <div className="px-5 flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2.5 text-xs font-medium rounded-t-lg transition-colors relative ${
              activeTab === tab
                ? "bg-card text-foreground border-t border-x border-border -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {OUTPUT_TAB_ICONS[tab]} {OUTPUT_TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-card">
        <AnimatePresence mode="wait">
          {isTabLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-3"
            >
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                {activeTab === "jd" && "正在用大白话解码黑话中..."}
                {activeTab === "daily" && "正在还原职场真实日常中..."}
                {activeTab === "resume" && "正在为你的简历植入关键词弹药中..."}
                {activeTab === "cover" && "正在酝酿一封有灵魂的求职信中..."}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-5"
            >
              <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-li:text-foreground/80 prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:text-foreground">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy size={13} />
            复制 Markdown
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Download size={13} />
            导出 PDF
          </button>
        </div>
        <div className="flex gap-1">
          <button className="p-2 rounded-md text-muted-foreground hover:text-success hover:bg-success/10 transition-colors">
            <ThumbsUp size={15} />
          </button>
          <button className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <ThumbsDown size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
