import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Briefcase, HeartCrack } from "lucide-react";
import type { JobRecord } from "@/types/job";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  records: JobRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export default function HistorySidebar({ records, selectedId, onSelect, onDelete, onNew }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const active = records.filter((r) => r.status === "active");
  const rejected = records.filter((r) => r.status === "rejected");

  return (
    <aside className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-display text-sm font-semibold tracking-wide uppercase text-sidebar-foreground/60 mb-3">
          🗂️ 投递记录
        </h2>
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          新建求职项目
        </button>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Active */}
        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2 px-1">
            <Briefcase size={12} />
            推进中
          </h3>
          <AnimatePresence>
            {active.map((r) => (
              <RecordItem
                key={r.id}
                record={r}
                selected={selectedId === r.id}
                onSelect={onSelect}
                onDelete={() => setDeleteTarget(r.id)}
              />
            ))}
          </AnimatePresence>
          {active.length === 0 && (
            <p className="text-xs text-sidebar-foreground/30 px-2 py-3">暂无推进中的项目</p>
          )}
        </section>

        {/* Rejected */}
        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2 px-1">
            <HeartCrack size={12} />
            拒信 / 已放弃
          </h3>
          <AnimatePresence>
            {rejected.map((r) => (
              <RecordItem
                key={r.id}
                record={r}
                selected={selectedId === r.id}
                onSelect={onSelect}
                onDelete={() => setDeleteTarget(r.id)}
              />
            ))}
          </AnimatePresence>
          {rejected.length === 0 && (
            <p className="text-xs text-sidebar-foreground/30 px-2 py-3">太好了，还没有拒信！</p>
          )}
        </section>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除？</AlertDialogTitle>
            <AlertDialogDescription>
              拜拜就拜拜，下一个更乖！🫡 删除后所有相关数据将被彻底清除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>再想想</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) onDelete(deleteTarget);
                setDeleteTarget(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删！
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}

function RecordItem({
  record,
  selected,
  onSelect,
  onDelete,
}: {
  record: JobRecord;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer mb-1 transition-colors ${
        selected
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "hover:bg-sidebar-accent"
      }`}
      onClick={() => onSelect(record.id)}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">
          {record.company} ({record.position})
        </p>
        <p className={`text-xs ${selected ? "text-sidebar-primary-foreground/70" : "text-sidebar-foreground/40"}`}>
          {record.date}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={`shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
          selected
            ? "hover:bg-sidebar-primary-foreground/20"
            : "hover:bg-destructive/20 text-destructive"
        }`}
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}
