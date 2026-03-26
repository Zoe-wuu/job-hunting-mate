import { User } from "lucide-react";
import HistorySidebar from "@/components/HistorySidebar";
import InputWorkbench from "@/components/InputWorkbench";
import OutputPanel from "@/components/OutputPanel";
import { useJobStore } from "@/store/useJobStore";
import type { OutputTab } from "@/types/job";

export default function Index() {
  const store = useJobStore();

  const handleExecute = (tab: OutputTab | "all") => {
    store.setLoading(tab);
    if (tab !== "all") store.setActiveTab(tab);
    // Simulate AI generation
    setTimeout(() => {
      store.setLoading(null);
      if (tab === "all") store.setActiveTab("jd");
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shadow-soft shrink-0">
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight">
          🚀 找工找工 <span className="text-sm font-medium text-muted-foreground ml-1">JobFinder Pro</span>
        </h1>
        <p className="hidden md:block text-xs text-muted-foreground italic">
          去术语化 · 场景化 · 高转化率
        </p>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors">
          <User size={15} />
          个人中心
        </button>
      </header>

      {/* Main 3-col Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left - History */}
        <div className="w-64 shrink-0 border-r border-border overflow-hidden">
          <HistorySidebar
            records={store.records}
            selectedId={store.selectedId}
            onSelect={store.selectRecord}
            onDelete={store.deleteRecord}
            onNew={store.clearInputs}
          />
        </div>

        {/* Center - Input */}
        <div className="flex-1 min-w-0 border-r border-border overflow-hidden">
          <InputWorkbench
            company={store.company}
            setCompany={store.setCompany}
            jd={store.jd}
            setJd={store.setJd}
            resume={store.resume}
            setResume={store.setResume}
            loading={store.loading}
            onExecute={handleExecute}
          />
        </div>

        {/* Right - Output */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <OutputPanel
            activeTab={store.activeTab}
            setActiveTab={store.setActiveTab}
            loading={store.loading}
          />
        </div>
      </div>
    </div>
  );
}
