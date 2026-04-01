export type JobStatus = "active" | "rejected";

export interface JobRecord {
  id: string;
  company: string;
  position: string;
  date: string;
  status: JobStatus;
  jd: string;
  resume: string;
  outputs: {
    jdTranslation: string;
    dailyLife: string;
    resumeOptimized: string;
    coverLetter: string;
  };
  prompts: {
    jdTranslation: string;
    dailyLife: string;
    resumeOptimized: string;
    coverLetter: string;
  };
}

export type OutputTab = "jd" | "daily" | "resume" | "cover";

export const OUTPUT_TAB_LABELS: Record<OutputTab, string> = {
  jd: "大白话JD",
  daily: "一天日常",
  resume: "简历优化",
  cover: "灵魂求职信",
};
