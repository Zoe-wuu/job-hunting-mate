import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, HeartCrack, Users, MoreHorizontal, ChevronDown, ChevronRight, ArrowRightLeft, Trash2 } from "lucide-react";
import type { JobRecord, JobStatus } from "@/types/job";
import { useState, useEffect } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  records: JobRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onReject: (id: string) => void;
  setRecordStatus: (id: string, status: JobStatus) => void;
  onNew: () => void;
}

const COLLAPSE_KEY = "jobfinder_section_collapsed";

type SectionKey = JobStatus;

const SECTIONS: { key: SectionKey; label: string; icon: typeof Briefcase; emptyText: string }[] = [
  { key: "active", label: "推进中", icon: Briefcase, emptyText: "暂无推进中的项目" },
  { key: "interviewing", label: "面试中", icon: Users, emptyText: "暂无面试中的项目" },
  { key: "rejected", label: "拒信 / 已放弃", icon: HeartCrack, emptyText: "太好了，还没有拒信！" },
];

function loadCollapsed(): Record<SectionKey, boolean> {
  try {
    const raw = localStorage.getItem(COLLAPSE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { active: false, interviewing: false, rejected: false };
}

export default function HistorySidebar({ records, selectedId, onSelect, onDelete, onReject, setRecordStatus, onNew }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>(() => loadCollapsed());

  useEffect(() => {
    try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(collapsed)); } catch { /* ignore */ }
  }, [collapsed]);

  const grouped: Record<SectionKey, JobRecord[]> = {
    active: records.filter((r) => r.status === "active"),
    interviewing: records.filter((r) => r.status === "interviewing"),
    rejected: records.filter((r) => r.status === "rejected"),
  };

  const targetRecord = deleteTarget ? records.find((r) => r.id === deleteTarget) : null;

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    onDelete(deleteTarget);
    setDeleteTarget(null);
  };

  const toggleSection = (key: SectionKey) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
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
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-foreground text-card hover:bg-foreground/85 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          新建求职项目
        </button>
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {SECTIONS.map(({ key, label, icon: Icon, emptyText }) => {
          const items = grouped[key];
          const isCollapsed = collapsed[key];
          return (
            <section key={key}>
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between px-1 mb-2 group"
              >
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  <Icon size={12} />
                  {label}
                  <span className="ml-1 text-muted-foreground/50 normal-case tracking-normal">
                    ({items.length})
                  </span>
                </h3>
              </button>

              {!isCollapsed && (
                <>
                  <AnimatePresence>
                    {items.map((r) => (
                      <RecordItem
                        key={r.id}
                        record={r}
                        selected={selectedId === r.id}
                        onSelect={onSelect}
                        onMove={(status) => {
                          if (status === "rejected") onReject(r.id);
                          else setRecordStatus(r.id, status);
                        }}
                        onDelete={() => setDeleteTarget(r.id)}
                      />
                    ))}
                  </AnimatePresence>
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground/40 px-2 py-2">{emptyText}</p>
                  )}
                </>
              )}
            </section>
          );
        })}
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认彻底删除？</AlertDialogTitle>
            <AlertDialogDescription>
              将彻底删除「{targetRecord?.company}」及其所有相关数据，无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>再想想</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              彻底删除
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
  onMove,
  onDelete,
}: {
  record: JobRecord;
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (status: JobStatus) => void;
  onDelete: () => void;
}) {
  const allMoves: { status: JobStatus; label: string }[] = [
    { status: "active", label: "移回「推进中」" },
    { status: "interviewing", label: "移至「面试中」" },
    { status: "rejected", label: "移至「拒信/已放弃」" },
  ];
  const moveOptions = allMoves.filter((o) => o.status !== record.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer mb-1 transition-all ${
        selected
          ? "bg-muted/40 border-l-4 border-l-primary border border-transparent"
          : "hover:bg-muted/20 border-l-4 border-l-transparent"
      }`}
      onClick={() => onSelect(record.id)}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{record.company}</p>
        <p className={`text-xs ${selected ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
          {record.date}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity hover:bg-muted/50 text-muted-foreground"
          >
            <MoreHorizontal size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {moveOptions.map((o) => (
            <DropdownMenuItem
              key={o.status}
              onClick={(e) => {
                e.stopPropagation();
                onMove(o.status);
              }}
            >
              <ArrowRightLeft size={14} className="mr-2" />
              {o.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 size={14} className="mr-2" />
            删除项目
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
