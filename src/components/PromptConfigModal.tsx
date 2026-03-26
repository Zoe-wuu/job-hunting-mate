import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save, X, ChevronDown, ChevronRight } from "lucide-react";
import type { OutputTab } from "@/types/job";
import { OUTPUT_TAB_LABELS } from "@/types/job";
import { useState } from "react";

interface Props {
  open: boolean;
  tab: OutputTab | null;
  systemPrompt: string;
  userPrompt: string;
  onUserPromptChange: (v: string) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function PromptConfigModal({
  open,
  tab,
  systemPrompt,
  userPrompt,
  onUserPromptChange,
  onReset,
  onClose,
}: Props) {
  const [showSystem, setShowSystem] = useState(false);

  if (!tab) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            ⚙️ 配置：{OUTPUT_TAB_LABELS[tab]} Prompt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* System prompt (collapsible) */}
          <div>
            <button
              onClick={() => setShowSystem(!showSystem)}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {showSystem ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              🤖 系统底层提示词 (System Prompt)
            </button>
            {showSystem && (
              <div className="mt-2 p-3 rounded-lg bg-muted text-xs text-muted-foreground leading-relaxed">
                {systemPrompt}
              </div>
            )}
          </div>

          {/* User prompt */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              ✍️ 我的特殊要求 (User Additional Prompt)
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => onUserPromptChange(e.target.value)}
              placeholder='例: "请帮我把每段经历压缩在3个Bullet Points以内，语气要极其Aggressive，并且重点突出我的 Python 技能，不要提及我会Java。"'
              rows={5}
              className="w-full px-3 py-2.5 rounded-lg bg-card border border-input text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
            <RotateCcw size={14} className="mr-1" />
            恢复默认
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X size={14} className="mr-1" />
            取消
          </Button>
          <Button size="sm" onClick={onClose}>
            <Save size={14} className="mr-1" />
            保存并应用
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
