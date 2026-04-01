import { Settings, Sparkles, FileText, Sun, PenLine, Mail, LayoutDashboard, Building2, FileSearch, ClipboardList } from "lucide-react";
import type { OutputTab } from "@/types/job";
import { useState } from "react";
import PromptConfigModal from "./PromptConfigModal";

interface Props {
  company: string;
  setCompany: (v: string) => void;
  jd: string;
  setJd: (v: string) => void;
  resume: string;
  setResume: (v: string) => void;
  loading: OutputTab | "all" | null;
  onExecute: (tab: OutputTab | "all") => void;
  userPrompts: Record<OutputTab, string>;
  setUserPrompts: React.Dispatch<React.SetStateAction<Record<OutputTab, string>>>;
}

const ACTIONS: { tab: OutputTab; label: string; icon: React.ReactNode }[] = [
  { tab: "jd", label: "翻译JD", icon: <FileText size={16} /> },
  { tab: "daily", label: "看日常", icon: <Sun size={16} /> },
  { tab: "resume", label: "改简历", icon: <PenLine size={16} /> },
  { tab: "cover", label: "写求职信", icon: <Mail size={16} /> },
];

const DEFAULT_SYSTEM_PROMPTS: Record<OutputTab, string> = {
  jd: "你是一位资深HR顾问。请用大白话把JD翻译成普通人能听懂的版本，包括：这活儿到底干啥、要啥能力、有什么坑。",
  daily: "你是一位在该岗位工作3年的前辈。请描述这个岗位一天的真实日常，从早到晚，包括会议、工作内容、加班情况。",
  resume: "你是一位精通ATS筛选逻辑的顶级猎头。请对比JD和简历，进行Gap分析，然后逐条优化简历的每段经历，植入JD关键词，替换弱动词，补充量化成果。用**加粗**标注所有修改处。",
  cover: "你是一位求职信写作大师。请根据JD、简历和公司背景，写一封有灵魂的求职信。要有故事感，不要模板味。",
};

export default function InputWorkbench({
  company,
  setCompany,
  jd,
  setJd,
  resume,
  setResume,
  loading,
  onExecute,
  userPrompts,
  setUserPrompts,
}: Props) {
  const [configTab, setConfigTab] = useState<OutputTab | null>(null);

  const canExecute = jd.trim().length > 0 && resume.trim().length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-5 pb-3">
        <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <LayoutDashboard size={18} className="text-secondary" />
          工作台
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">输入 JD 和简历，让 AI 帮你拆解战略</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            <Building2 size={13} />
            目标公司（选填）
          </label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="例: 微软 (Microsoft) - PM"
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-secondary-deep/20 focus:border-secondary-deep/40 transition-all"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            <FileSearch size={13} />
            目标岗位 JD <span className="text-destructive">*</span>
          </label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="直接粘贴岗位描述，中英夹杂/带格式都没问题..."
            rows={6}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-secondary-deep/20 focus:border-secondary-deep/40 transition-all resize-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            <ClipboardList size={13} />
            你的简历 / 核心经历 <span className="text-destructive">*</span>
          </label>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="复制你的工作经历文字即可，碎片化描述也 OK..."
            rows={6}
            className="w-full px-3 py-2.5 rounded-xl bg-background border border-input text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-secondary-deep/20 focus:border-secondary-deep/40 transition-all resize-none"
          />
        </div>

        <div className="pt-2">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            <Sparkles size={13} />
            AI 引擎控制台
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map(({ tab, label, icon }) => (
              <div key={tab} className="relative">
                <button
                  disabled={!canExecute || loading !== null}
                  onClick={() => onExecute(tab)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all border ${
                    loading === tab || loading === "all"
                      ? "bg-secondary-wash border-secondary text-secondary-deep animate-pulse"
                      : canExecute
                      ? "bg-card border-border text-foreground hover:bg-secondary-wash hover:border-secondary-deep hover:text-secondary-deep shadow-soft"
                      : "bg-muted text-muted-foreground/40 cursor-not-allowed border-transparent"
                  }`}
                >
                  {icon}
                  {label}
                </button>
                <button
                  onClick={() => setConfigTab(tab)}
                  className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-card border border-border shadow-soft text-muted-foreground hover:text-foreground hover:border-secondary-deep/30 transition-colors"
                  title="自定义 Prompt"
                >
                  <Settings size={12} />
                </button>
              </div>
            ))}
          </div>

          <button
            disabled={!canExecute || loading !== null}
            onClick={() => onExecute("all")}
            className={`w-full mt-3 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
              canExecute && loading === null
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium"
                : "bg-muted text-muted-foreground/40 cursor-not-allowed"
            }`}
          >
            <Sparkles size={18} />
            一键跑通全流程
          </button>

          {!canExecute && (
            <p className="text-xs text-muted-foreground/60 text-center mt-2">
              请先填写 JD 和简历
            </p>
          )}
        </div>
      </div>

      <PromptConfigModal
        open={configTab !== null}
        tab={configTab}
        systemPrompt={configTab ? DEFAULT_SYSTEM_PROMPTS[configTab] : ""}
        userPrompt={configTab ? userPrompts[configTab] : ""}
        onUserPromptChange={(v) => {
          if (configTab) setUserPrompts((prev) => ({ ...prev, [configTab]: v }));
        }}
        onReset={() => {
          if (configTab) setUserPrompts((prev) => ({ ...prev, [configTab]: "" }));
        }}
        onClose={() => setConfigTab(null)}
      />
    </div>
  );
}
