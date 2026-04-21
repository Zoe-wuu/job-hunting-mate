import { User, Rocket } from "lucide-react";
import HistorySidebar from "@/components/HistorySidebar";
import InputWorkbench from "@/components/InputWorkbench";
import OutputPanel from "@/components/OutputPanel";
import LoginModal from "@/components/LoginModal";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useJobStore } from "@/store/useJobStore";
import { streamJobAI } from "@/services/jobAI";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import type { OutputTab } from "@/types/job";
import { toast } from "sonner";
import { useCallback, useRef, useState } from "react";

const ALL_TABS: OutputTab[] = ["jd", "daily", "resume", "cover"];

export default function Index() {
  const store = useJobStore();
  const runningRef = useRef(false);
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [showLogin, setShowLogin] = useState(false);

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
        <h1 className="font-display text-xl font-extrabold text-foreground tracking-wider flex items-center gap-2">
          <Rocket size={20} className="text-primary" />
          HIRED
          <span className="text-sm font-medium text-muted-foreground ml-1 tracking-wide">
            Congratulations!
          </span>
        </h1>

        {user ? (
          <ProfileDropdown user={user} onSignOut={signOut} />
        ) : (
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card text-sm text-muted-foreground hover:text-foreground transition-colors shadow-soft border border-border"
          >
            <User size={15} />
            {t("个人中心", "Profile")}
          </button>
        )}
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
            setRecordStatus={store.setRecordStatus}
            onNew={store.clearInputs}
          />
        </div>

        <div className="flex-1 min-w-0 overflow-hidden rounded-3xl bg-card border border-border/60 shadow-sm">
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

        <div className="flex-1 min-w-0 overflow-hidden rounded-3xl bg-card border border-border/60 shadow-sm">
          <OutputPanel
            activeTab={store.activeTab}
            setActiveTab={store.setActiveTab}
            loading={store.loading}
            outputs={store.outputs}
          />
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
