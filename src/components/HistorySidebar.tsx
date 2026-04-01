import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Briefcase, HeartCrack, XCircle } from "lucide-react";
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
  onReject: (id: string) => void;
  onNew: () => void;
}

export default function HistorySidebar({ records, selectedId, onSelect, onDelete, onReject, onNew }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const active = records.filter((r) => r.status === "active");
  const rejected = records.filter((r) => r.status === "rejected");

  const targetRecord = deleteTarget ? records.find((r) => r.id === deleteTarget) : null;
  const isRejectedDelete = targetRecord?.status === "rejected";

  const handleAction = () => {
    if (!deleteTarget) return;
    if (isRejectedDelete) {
      onDelete(deleteTarget);
    } else {
      onReject(deleteTarget);
    }
    setDeleteTarget(null);
  };

  return (
    <aside className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-display text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
          <Briefcase size={14} />
          投递记录
        </h2>
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          新建求职项目
        </button>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Active */}
        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 px-1">
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
                onAction={() => setDeleteTarget(r.id)}
                actionIcon={<XCircle size={14} />}
              />
            ))}
          </AnimatePresence>
          {active.length === 0 && (
            <p className="text-xs text-muted-foreground/40 px-2 py-3">暂无推进中的项目</p>
          )}
        </section>

        {/* Rejected */}
        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2 px-1">
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
                onAction={() => setDeleteTarget(r.id)}
                actionIcon={<Trash2 size={14} />}
              />
            ))}
          </AnimatePresence>
          {rejected.length === 0 && (
            <p className="text-xs text-muted-foreground/40 px-2 py-3">太好了，还没有拒信！</p>
          )}
        </section>
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRejectedDelete ? "确认彻底删除？" : "移入拒信？"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRejectedDelete
                ? "删除后所有相关数据将被彻底清除，无法恢复。"
                : "该项目将被移入「拒信/已放弃」区域，你仍可在那里查看或彻底删除。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>再想想</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRejectedDelete ? "彻底删除" : "移入拒信"}
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
  onAction,
  actionIcon,
}: {
  record: JobRecord;
  selected: boolean;
  onSelect: (id: string) => void;
  onAction: () => void;
  actionIcon: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer mb-1 transition-all ${
        selected
          ? "bg-muted/60 border-l-4 border-l-primary border border-transparent"
          : "hover:bg-muted/30 border-l-4 border-l-transparent"
      }`}
      onClick={() => onSelect(record.id)}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">
          {record.company} ({record.position})
        </p>
        <p className={`text-xs ${selected ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
          {record.date}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAction();
        }}
        className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 text-destructive"
      >
        {actionIcon}
      </button>
    </motion.div>
  );
}
