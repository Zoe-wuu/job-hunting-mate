import { useState, useCallback, useEffect } from "react";
import type { JobRecord, OutputTab } from "@/types/job";

const STORAGE_RECORDS_KEY = "jobfinder_records";
const STORAGE_PROMPTS_KEY = "jobfinder_user_prompts";
const STORAGE_RESUME_KEY = "jobfinder_resume";

const EMPTY_OUTPUTS = { jdTranslation: "", dailyLife: "", resumeOptimized: "", coverLetter: "" };
const EMPTY_PROMPTS = { jdTranslation: "", dailyLife: "", resumeOptimized: "", coverLetter: "" };

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded – silently ignore */ }
}

function createRecord(company: string, jd: string, resume: string): JobRecord {
  return {
    id: crypto.randomUUID(),
    company: company || "未命名公司",
    position: "",
    date: new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "/"),
    status: "active",
    jd,
    resume,
    outputs: { ...EMPTY_OUTPUTS },
    prompts: { ...EMPTY_PROMPTS },
  };
}

const TAB_TO_KEY: Record<OutputTab, keyof JobRecord["outputs"]> = {
  jd: "jdTranslation",
  daily: "dailyLife",
  resume: "resumeOptimized",
  cover: "coverLetter",
};

const DEFAULT_USER_PROMPTS: Record<OutputTab, string> = { jd: "", daily: "", resume: "", cover: "" };

export function useJobStore() {
  const [records, setRecords] = useState<JobRecord[]>(() => loadFromStorage(STORAGE_RECORDS_KEY, []));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OutputTab>("jd");

  const [company, setCompany] = useState("");
  const [jd, setJd] = useState("");
  const [resume, setResumeState] = useState<string>(() => loadFromStorage(STORAGE_RESUME_KEY, ""));
  const [loading, setLoading] = useState<OutputTab | "all" | null>(null);

  const setResume = useCallback((v: string) => {
    setResumeState(v);
    saveToStorage(STORAGE_RESUME_KEY, v);
  }, []);

  const [outputs, setOutputs] = useState<Record<OutputTab, string>>({
    jd: "", daily: "", resume: "", cover: "",
  });

  const [userPrompts, setUserPrompts] = useState<Record<OutputTab, string>>(
    () => loadFromStorage(STORAGE_PROMPTS_KEY, DEFAULT_USER_PROMPTS)
  );

  useEffect(() => { saveToStorage(STORAGE_RECORDS_KEY, records); }, [records]);
  useEffect(() => { saveToStorage(STORAGE_PROMPTS_KEY, userPrompts); }, [userPrompts]);

  const selectedRecord = records.find((r) => r.id === selectedId) || null;

  const selectRecord = useCallback((id: string) => {
    setSelectedId(id);
    setRecords((prev) => {
      const rec = prev.find((r) => r.id === id);
      if (rec) {
        setCompany(rec.company);
        setJd(rec.jd);
        if (rec.resume) setResumeState(rec.resume);
        setOutputs({
          jd: rec.outputs.jdTranslation,
          daily: rec.outputs.dailyLife,
          resume: rec.outputs.resumeOptimized,
          cover: rec.outputs.coverLetter,
        });
      }
      return prev;
    });
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setCompany("");
      setJd("");
      setOutputs({ jd: "", daily: "", resume: "", cover: "" });
    }
  }, [selectedId]);

  const rejectRecord = useCallback((id: string) => {
    setRecords((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: "rejected" as const } : r)
    );
  }, []);

  const clearInputs = useCallback(() => {
    setSelectedId(null);
    setCompany("");
    setJd("");
    setOutputs({ jd: "", daily: "", resume: "", cover: "" });
  }, []);

  const ensureRecord = useCallback((): string => {
    if (selectedId) return selectedId;
    const rec = createRecord(company, jd, resume);
    setRecords((prev) => [rec, ...prev]);
    setSelectedId(rec.id);
    return rec.id;
  }, [selectedId, company, jd, resume]);

  const appendOutput = useCallback((tab: OutputTab, chunk: string) => {
    setOutputs((prev) => ({ ...prev, [tab]: prev[tab] + chunk }));
  }, []);

  const clearOutput = useCallback((tab: OutputTab) => {
    setOutputs((prev) => ({ ...prev, [tab]: "" }));
  }, []);

  const saveOutputToRecord = useCallback((recordId: string, tab: OutputTab, content: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? { ...r, outputs: { ...r.outputs, [TAB_TO_KEY[tab]]: content } }
          : r
      )
    );
  }, []);

  return {
    records,
    selectedId,
    selectedRecord,
    activeTab,
    setActiveTab,
    company,
    setCompany,
    jd,
    setJd,
    resume,
    setResume,
    loading,
    setLoading,
    outputs,
    userPrompts,
    setUserPrompts,
    selectRecord,
    deleteRecord,
    rejectRecord,
    clearInputs,
    ensureRecord,
    appendOutput,
    clearOutput,
    saveOutputToRecord,
  };
}
