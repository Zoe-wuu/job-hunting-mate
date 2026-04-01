import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Copy, Download, ThumbsUp, ThumbsDown, FileText, Sun, PenLine, Mail, Sparkles } from "lucide-react";
import type { OutputTab } from "@/types/job";
import { OUTPUT_TAB_LABELS } from "@/types/job";
import { toast } from "sonner";

const TABS: OutputTab[] = ["jd", "daily", "resume", "cover"];

const TAB_ICONS: Record<OutputTab, React.ReactNode> = {
  jd: <FileText size={14} />,
  daily: <Sun size={14} />,
  resume: <PenLine size={14} />,
  cover: <Mail size={14} />,
};

const LOADING_MESSAGES: Record<OutputTab, string> = {
  jd: "正在用大白话解码黑话中...",
  daily: "正在还原职场真实日常中...",
  resume: "正在为你的简历植入关键词弹药中...",
  cover: "正在酝酿一封有灵魂的求职信中...",
};

const EMPTY_MESSAGES: Record<OutputTab, string> = {
  jd: "填写 JD 和简历后，点击「翻译JD」开始",
  daily: "填写 JD 后，点击「看日常」了解岗位真实一天",
  resume: "填写 JD 和简历后，点击「改简历」获取 ATS 优化建议",
  cover: "填写 JD 和简历后，点击「写求职信」生成定制求职信",
};

interface Props {
  activeTab: OutputTab;
  setActiveTab: (tab: OutputTab) => void;
  loading: OutputTab | "all" | null;
  outputs: Record<OutputTab, string>;
}

export default function OutputPanel({ activeTab, setActiveTab, loading, outputs }: Props) {
  const isTabLoading = loading === activeTab || loading === "all";
  const content = outputs[activeTab];
  const hasContent = content.length > 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("已复制到剪贴板！");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-2">
        <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles size={18} className="text-secondary" />
          AI 战略输出
        </h2>
      </div>

      <div className="px-5 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl transition-all ${
              activeTab === tab
                ? "bg-secondary-wash text-secondary-deep"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {TAB_ICONS[tab]}
            {OUTPUT_TAB_LABELS[tab]}
            {outputs[tab].length > 0 && activeTab !== tab && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-success inline-block" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto mt-3">
        <AnimatePresence mode="wait">
          {isTabLoading && !hasContent ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-3"
            >
              <div className="w-8 h-8 border-2 border-secondary/20 border-t-secondary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">{LOADING_MESSAGES[activeTab]}</p>
            </motion.div>
          ) : hasContent ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="px-5 pb-5"
            >
              <article className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-headings:mt-4 prose-headings:mb-2 prose-p:text-foreground/80 prose-p:mb-3 prose-p:leading-normal prose-strong:text-foreground prose-li:text-foreground/80 prose-li:leading-normal prose-ul:my-2 prose-ul:space-y-0.5 prose-ol:my-2 prose-ol:space-y-0.5 prose-blockquote:border-l-secondary prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:text-foreground prose-hr:border-border prose-h1:text-lg prose-h2:text-base prose-h3:text-sm whitespace-pre-wrap leading-normal">
                <ReactMarkdown>{content}</ReactMarkdown>
              </article>
              {isTabLoading && (
                <span className="inline-block w-2 h-4 bg-secondary/60 animate-pulse ml-0.5" />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-2 text-center px-8"
            >
              <span className="text-muted-foreground/30">{TAB_ICONS[activeTab]}</span>
              <p className="text-sm text-muted-foreground">{EMPTY_MESSAGES[activeTab]}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasContent && (
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy size={13} />
              复制 Markdown
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <Download size={13} />
              导出 PDF
            </button>
          </div>
          <div className="flex gap-1">
            <button className="p-2 rounded-xl text-muted-foreground hover:text-success hover:bg-success/10 transition-colors">
              <ThumbsUp size={15} />
            </button>
            <button className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
              <ThumbsDown size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
