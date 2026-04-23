# HIRED — An AI-Native Job Search Companion

An independently designed and shipped AI-powered workspace for navigating the job search. Built end-to-end by one non-technical founder using vibe coding (Lovable, Claude Code, Supabase) — from customer insight to live deployment, without an engineering team.

> 🚀 **Live product:** job-hunting-mate.lovable.app
> 👋 **Built by:** [Zoe Wu]www.linkedin.com/in/zoewu-builds · wenwu064@gmail.com
> 🛠️ **Status:** Active side project, in daily personal use

---

## Why I built this

Job searching with AI today is fragmented. You paste the JD into ChatGPT, paste your CV separately, lose context every session, and the outputs aren't tuned to the specific company or role.

I wanted a workspace where the AI actually understood the full application landscape — and I wanted to see if someone without an engineering background could build it alone.

2 weeks later, this is my answer.

## What HIRED does

A multi-panel workspace centered around four AI-generated outputs for each application:

- **大白话 JD** — decodes opaque job description language into what the role actually means day-to-day
- **一天日常** — generates a realistic "day in the life" in this role at this company
- **简历优化** — surfaces targeted CV rewrites specific to the JD
- **灵魂求职信** — drafts cover letters that don't read like generic ChatGPT output

All grounded in a persistent Cockpit where your CV, target company, and JD live together across sessions.

## Architecture decisions worth calling out

**Prompt engineering as core IP.** Constraint-based system prompts refined through dozens of real test cycles against live applications I was actively submitting. The prompt architecture is the product.

**LLM selection based on commercial tradeoffs.** Evaluated Anthropic, Gemini, and DeepSeek APIs on cost-per-token, latency, and rate limits — optimized for zero/low-cost solo operation.

**Local-first data persistence.** User CVs stored in browser so re-pasting isn't required across sessions — a small UX detail that compounds over time.

**Workflow-over-chat UI.** Deliberately not a chatbot. The four AI outputs sit in fixed panels so users compare and iterate, rather than scrolling through conversation history.

## Stack

React · TypeScript · Tailwind · Supabase · Lovable AI Gateway · Deployed on Lovable

## A note on running locally

This project uses Lovable's built-in AI integration, which routes LLM calls through Lovable's backend. Cloning and running locally will render the UI, but the AI-powered features require the Lovable runtime — so the best way to experience HIRED is via the live link above.

Source is public here for architecture review and code walkthrough purposes.

## What I'm looking for

Product roles, Founder's Associate, AI Product Analyst, or early-stage teams where someone who can spot the opportunity AND ship the first version creates asymmetric value.

📬 wenwu064@gmail.com
