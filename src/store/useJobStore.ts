import { useState, useCallback } from "react";
import type { JobRecord, OutputTab } from "@/types/job";

const MOCK_RECORDS: JobRecord[] = [
  {
    id: "1",
    company: "微软 (Microsoft)",
    position: "PM",
    date: "2026/03/26",
    status: "active",
    jd: "We are looking for a Product Manager to lead our AI platform team...",
    resume: "3年互联网产品经验，负责过DAU百万级产品的从0到1...",
    outputs: { jdTranslation: "", dailyLife: "", resumeOptimized: "", coverLetter: "" },
    prompts: { jdTranslation: "", dailyLife: "", resumeOptimized: "", coverLetter: "" },
  },
  {
    id: "2",
    company: "Apple",
    position: "运营",
    date: "2026/03/20",
    status: "active",
    jd: "",
    resume: "",
    outputs: { jdTranslation: "", dailyLife: "", resumeOptimized: "", coverLetter: "" },
    prompts: { jdTranslation: "", dailyLife: "", resumeOptimized: "", coverLetter: "" },
  },
  {
    id: "3",
    company: "Meta",
    position: "DA",
    date: "2026/02/15",
    status: "rejected",
    jd: "",
    resume: "",
    outputs: { jdTranslation: "", dailyLife: "", resumeOptimized: "", coverLetter: "" },
    prompts: { jdTranslation: "", dailyLife: "", resumeOptimized: "", coverLetter: "" },
  },
];

export function useJobStore() {
  const [records, setRecords] = useState<JobRecord[]>(MOCK_RECORDS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OutputTab>("jd");

  // Current input state (when no record selected)
  const [company, setCompany] = useState("");
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState<OutputTab | "all" | null>(null);

  const selectedRecord = records.find((r) => r.id === selectedId) || null;

  const selectRecord = useCallback((id: string) => {
    setSelectedId(id);
    const rec = MOCK_RECORDS.find((r) => r.id === id);
    if (rec) {
      setCompany(rec.company);
      setJd(rec.jd);
      setResume(rec.resume);
    }
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setCompany("");
      setJd("");
      setResume("");
    }
  }, [selectedId]);

  const updateRecordStatus = useCallback((id: string, status: JobRecord["status"]) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  const clearInputs = useCallback(() => {
    setSelectedId(null);
    setCompany("");
    setJd("");
    setResume("");
  }, []);

  const updateOutput = useCallback((tab: OutputTab, content: string) => {
    if (selectedId) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedId
            ? { ...r, outputs: { ...r.outputs, [tabToKey(tab)]: content } }
            : r
        )
      );
    }
  }, [selectedId]);

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
    selectRecord,
    deleteRecord,
    updateRecordStatus,
    clearInputs,
    updateOutput,
  };
}

function tabToKey(tab: OutputTab): keyof JobRecord["outputs"] {
  const map: Record<OutputTab, keyof JobRecord["outputs"]> = {
    jd: "jdTranslation",
    daily: "dailyLife",
    resume: "resumeOptimized",
    cover: "coverLetter",
  };
  return map[tab];
}
