import { User, Rocket } from "lucide-react";
import HistorySidebar from "@/components/HistorySidebar";
import InputWorkbench from "@/components/InputWorkbench";
import OutputPanel from "@/components/OutputPanel";
import { useJobStore } from "@/store/useJobStore";
import { streamJobAI } from "@/services/jobAI";
import type { OutputTab } from "@/types/job";
import { toast } from "sonner";
import { useCallback, useRef } from "react";

const ALL_TABS: OutputTab[] = ["jd", "daily", "resume", "cover"];

export default function Index() {
  const store = useJobStore();
  const runningRef = useRef(false);

  const runSingleTab = useCallback(async (tab: OutputTab, recordId: string) => {
    store.clearOutput(tab);
    store.setActiveTab(tab);

    let accumulated = "";
    await new Promise<void>((resolve) => {
      streamJobAI({
        type: tab,
        company: store.company,
        jd: store.jd,
        resume: store.resume,
        userPrompt: store.userPrompts[tab],
        onDelta: (chunk) => {
          accumulated += chunk;
          store.appendOutput(tab, chunk);
        },
        onDone: () => {
          store.saveOutputToRecord(recordId, tab, accumulated);
          resolve();
        },
        onError: (err) => {
          toast.error(err);
          resolve();
        },
      });
    });
  }, [store]);

  const handleExecute = useCallback(async (tab: OutputTab | "all") => {
    if (runningRef.current) return;
    runningRef.current = true;

    const recordId = store.ensureRecord();
    store.setLoading(tab);

    try {
      if (tab === "all") {
        for (const t of ALL_TABS) {
          store.setLoading(t);
          await runSingleTab(t, recordId);
        }
        store.setActiveTab("jd");
      } else {
        await runSingleTab(tab, recordId);
      }
    } finally {
      store.setLoading(null);
      runningRef.current = false;
    }
  }, [store, runSingleTab]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 shrink-0">
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Rocket size={20} className="text-primary" />
          找工找工 <span className="text-sm font-medium text-muted-foreground ml-1">JobFinder Pro</span>
        </h1>
        <p className="hidden md:block text-xs text-muted-foreground italic">
          去术语化 · 场景化 · 高转化率
        </p>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card text-sm text-muted-foreground hover:text-foreground transition-colors shadow-soft border border-border">
          <User size={15} />
          个人中心
        </button>
      </header>

      {/* Main 3-col Bento Layout */}
      <div className="flex flex-1 overflow-hidden gap-4 px-4 pb-4">
        <div className="w-64 shrink-0 overflow-hidden rounded-3xl bg-card border border-border/60 shadow-sm">
          <HistorySidebar
            records={store.records}
            selectedId={store.selectedId}
            onSelect={store.selectRecord}
            onDelete={store.deleteRecord}
            onReject={store.rejectRecord}
            onNew={store.clearInputs}
          />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden rounded-3xl bg-card border border-border shadow-soft">
          <InputWorkbench
            company={store.company}
            setCompany={store.setCompany}
            jd={store.jd}
            setJd={store.setJd}
            resume={store.resume}
            setResume={store.setResume}
            loading={store.loading}
            onExecute={handleExecute}
            userPrompts={store.userPrompts}
            setUserPrompts={store.setUserPrompts}
          />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden rounded-3xl bg-card border border-border shadow-soft">
          <OutputPanel
            activeTab={store.activeTab}
            setActiveTab={store.setActiveTab}
            loading={store.loading}
            outputs={store.outputs}
          />
        </div>
      </div>
    </div>
  );
}
