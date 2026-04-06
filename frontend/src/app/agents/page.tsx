"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  Briefcase,
  Check,
  ChevronDown,
  Circle,
  ClipboardList,
  Code2,
  Database,
  Globe,
  LayoutDashboard,
  Link2,
  Mail,
  Megaphone,
  MessageCircleMore,
  Play,
  Plus,
  Rocket,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import Header from "../../components/Header";
import ChatInputBar from "../../components/ChatInputBar";
import { useI18n } from "../../components/I18nProvider";
import { AuthService } from "../../services/auth.service";
import {
  AgentRecord,
  AgentService,
  CreateAgentPayload,
  DeploymentType,
  MemoryMode,
} from "../../services/agent.service";
import { ChatService } from "../../services/chat.service";
import { ChatAttachment, ChatMessage } from "../../types/chat.types";
import { io, Socket } from "socket.io-client";

// ─── Constants ────────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  "Purpose",
  "System Prompt",
  "Tools & APIs",
  "Memory",
  "Test",
  "Deploy",
];

const PURPOSE_TYPES = [
  "Customer Support",
  "Research & Data",
  "Code & Dev",
  "Sales & CRM",
  "Content & Writing",
  "Operations",
  "Finance & Reports",
  "Something else",
];

const AUDIENCE_CHIPS = [
  "Customers",
  "Internal team",
  "Developers",
  "Executives",
];
const TONE_CHIPS = ["Professional", "Friendly", "Short & direct", "Thorough"];
const MEMORY_MODES: MemoryMode[] = [
  "No Memory",
  "Short-term Only",
  "Short + Long-term",
];
const SUGGESTED_SCENARIOS = [
  "Normal use case - typical user query",
  "Edge case - unexpected or out-of-scope request",
  "Escalation trigger - billing or security issue",
  "Empty / very short input",
  "Multilingual input",
  "Harmful or adversarial prompt",
  "Follow-up questions needing context",
  "Request for information outside agent scope",
];

const TOOL_CARDS = [
  {
    name: "Web Search",
    desc: "Search the web in real time for up-to-date information",
    icon: Globe,
  },
  {
    name: "Database Lookup",
    desc: "Query your database or vector store for internal knowledge",
    icon: Database,
  },
  {
    name: "Email Sender",
    desc: "Send emails or notifications on behalf of the agent",
    icon: Mail,
  },
  {
    name: "Calendar API",
    desc: "Read/write calendar events and schedule meetings",
    icon: LayoutDashboard,
  },
  {
    name: "Slack Webhook",
    desc: "Post messages and alerts to Slack channels",
    icon: MessageCircleMore,
  },
  {
    name: "Jira",
    desc: "Create and update Jira tickets automatically",
    icon: ClipboardList,
  },
  {
    name: "Google Sheets",
    desc: "Read from and write to spreadsheets",
    icon: LayoutDashboard,
  },
  {
    name: "Custom Function",
    desc: "Define your own tool with a JSON schema",
    icon: ShieldAlert,
  },
];

type AgentTemplate = {
  title: string;
  desc: string;
  tags: string[];
  color: string;
};

const TEMPLATES: AgentTemplate[] = [
  {
    title: "Research Agent",
    desc: "Automates web research, summarizes findings, and generates reports.",
    tags: ["GPT-5", "Web Search", "Summaries"],
    color:
      "bg-[rgba(232,245,189,0.42)] border border-[var(--theme-border-strong)]",
  },
  {
    title: "Customer Support Agent",
    desc: "Handles FAQs and resolves complex issues via multi-conversation context.",
    tags: ["Claude Sonnet 4", "Ticket System", "CRM"],
    color:
      "bg-[rgba(215,233,196,0.44)] border border-[var(--theme-border-strong)]",
  },
  {
    title: "Code Review Agent",
    desc: "Reviews pull requests for bugs, suggests improvements, and explains changes.",
    tags: ["GPT-5", "GitHub API", "PR Checks"],
    color:
      "bg-[rgba(232,245,189,0.42)] border border-[var(--theme-border-strong)]",
  },
  {
    title: "Data Analysis Agent",
    desc: "Processes spreadsheet and chart data to answer questions and produce insights.",
    tags: ["GPT-5", "CSV Parser", "Analytics"],
    color:
      "bg-[rgba(215,233,196,0.44)] border border-[var(--theme-border-strong)]",
  },
  {
    title: "Content Writer Agent",
    desc: "Creates blog posts, social content, and marketing copy with consistent brand voice.",
    tags: ["GPT-5", "SEO Optimizer", "Brand Voice"],
    color:
      "bg-[rgba(232,245,189,0.42)] border border-[var(--theme-border-strong)]",
  },
];

const AGENT_CHAT_HISTORY_STORAGE_PREFIX = "nexusai.agentChat.messages.v1";

function getAgentChatHistory(historyKey: string): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.sessionStorage.getItem(historyKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INITIAL_WIZARD: CreateAgentPayload = {
  agentName: "",
  purposeType: "",
  mainJob: "",
  audience: "",
  tone: "",
  systemPrompt: "",
  selectedTools: [],
  memoryMode: "Short-term Only",
  testScenarios: [],
  deploymentType: "API Endpoint",
  status: "Draft",
};

function validateStep(step: number, data: CreateAgentPayload): string | null {
  if (step === 1) {
    if (data.agentName.trim().length < 2)
      return "Enter an agent name (at least 2 characters).";
    if (!data.purposeType) return "Pick an agent type.";
    if (data.mainJob.trim().length < 10)
      return "Describe the agent's main job (at least 10 characters).";
    if (!data.audience) return "Pick who will use this agent.";
    if (!data.tone) return "Pick a tone.";
  }
  if (step === 2 && data.systemPrompt.trim().length < 20)
    return "System prompt must be at least 20 characters.";
  if (step === 3 && data.selectedTools.length === 0)
    return "Select at least one tool/API.";
  if (step === 5 && data.testScenarios.length === 0)
    return "Select or add at least one test scenario.";
  return null;
}

function makePrompt(data: CreateAgentPayload): string {
  return (
    `You are ${data.agentName || "AI Assistant"}, a ${data.purposeType || "general"} agent.\n\n` +
    `## Your Role\n${data.mainJob || "Help users effectively and safely."}\n\n` +
    `## Audience\nYou are talking to ${data.audience || "users"}. Tailor your language and depth accordingly.\n\n` +
    `## Tone & Style\nBe ${data.tone || "Professional"} and clear. Always be respectful and accurate.\n\n` +
    `Use connected tools only when needed and ask clarifying questions if context is missing.`
  );
}

// ─── Small UI atoms ───────────────────────────────────────────────────────────

function Badge({ label }: { label: string }) {
  return (
    <span className="theme-badge text-[10px] px-2 py-0.5 rounded-full">
      {label}
    </span>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
        active ? "theme-chip-active" : "theme-chip"
      }`}
    >
      {label}
    </button>
  );
}

function TemplateCard({
  item,
  active,
  onClick,
}: {
  item: AgentTemplate;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border p-3 transition-all ${
        active
          ? "bg-[rgba(232,245,189,0.32)] border-[var(--theme-border-strong)] shadow-sm"
          : "bg-[rgba(255,255,255,0.94)] border-[var(--theme-border)] hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-7 h-7 rounded-lg ${item.color} inline-flex items-center justify-center`}
        >
          <Bot className="w-4 h-4 text-[var(--theme-accent-hover)]" />
        </span>
        <h3 className="text-sm font-semibold text-[var(--theme-text)]">
          {item.title}
        </h3>
      </div>
      <p className="text-xs text-[var(--theme-text-muted)] line-clamp-2">
        {item.desc}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {item.tags.map((tag) => (
          <Badge key={tag} label={tag} />
        ))}
      </div>
    </button>
  );
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

function WizardStepBar({ step }: { step: number }) {
  return (
    <div className="px-6 py-2 border-b border-[var(--theme-border)] bg-[var(--theme-surface-muted)] flex items-center gap-5 text-sm overflow-x-auto">
      {WIZARD_STEPS.map((label, idx) => {
        const i = idx + 1;
        const done = i < step;
        const active = i === step;
        return (
          <div
            key={label}
            className={`flex items-center gap-2 whitespace-nowrap ${
              active
                ? "text-[var(--theme-text)] font-semibold"
                : done
                  ? "text-[var(--theme-accent-hover)] font-medium"
                  : "text-[var(--theme-text-muted)]"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] ${
                active
                  ? "bg-[var(--theme-accent-strong)] text-white"
                  : done
                    ? "bg-[rgba(232,245,189,0.52)] text-[var(--theme-accent-hover)]"
                    : "bg-[var(--theme-page-strong)] text-[var(--theme-text-muted)]"
              }`}
            >
              {done ? <Check className="w-3 h-3" /> : i}
            </span>
            {label}
          </div>
        );
      })}
    </div>
  );
}

const STEP_TITLES: Record<number, string> = {
  1: "Define your agent's purpose",
  2: "Write the system prompt",
  3: "Connect tools & APIs",
  4: "Set up memory",
  5: "Test & iterate",
  6: "Deploy & monitor",
};

function BuilderWizard({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (agent: AgentRecord) => void;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CreateAgentPayload>(INITIAL_WIZARD);
  const [manualScenario, setManualScenario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const next = () => {
    const err = validateStep(step, data);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step === 1 && !data.systemPrompt.trim()) {
      setData((p) => ({ ...p, systemPrompt: makePrompt(p) }));
    }
    setStep((s) => Math.min(6, s + 1));
  };

  const prev = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const create = async () => {
    const err = validateStep(step, data);
    if (err) {
      setError(err);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await AgentService.create(data);
      onCreated(created);
      onClose();
    } catch (e) {
      setError(AuthService.getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const toggle = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  return (
    <div className="fixed inset-0 z-[80] bg-black/25 backdrop-blur-[1px] flex items-center justify-center p-3">
      <div className="w-full max-w-[1050px] h-[95vh] bg-[var(--theme-page)] rounded-2xl border border-[var(--theme-border)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-3 border-b border-[var(--theme-border)] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--theme-accent-strong)] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[22px] font-semibold text-[var(--theme-accent-strong)]">
                {STEP_TITLES[step]}
              </h2>
              <p className="text-xs text-[var(--theme-accent-hover)] mt-1">
                Step {step} of 6
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[var(--theme-border)] text-[var(--theme-text-muted)] flex items-center justify-center hover:bg-[var(--theme-surface-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <WizardStepBar step={step} />

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto flex-1">
          {/* Step 1 – Purpose */}
          {step === 1 && (
            <div>
              <p className="text-[var(--theme-accent-strong)] font-bold text-sm">STEP 1 OF 6</p>
              <p className="text-[var(--theme-accent-strong)] mt-2 text-base">
                Answer a few quick questions — we&apos;ll use your answers to
                build the perfect agent.
              </p>
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-[#7f7c76] text-xs font-semibold mb-1">
                    AGENT NAME
                  </p>
                  <input
                    value={data.agentName}
                    onChange={(e) =>
                      setData((p) => ({ ...p, agentName: e.target.value }))
                    }
                    className="w-full rounded-xl border border-[#bfb8ac] bg-white px-4 h-12 text-sm text-[#1f1f1d] placeholder:text-[#6f6a61] focus:outline-none focus:ring-2 focus:ring-[#d9b79e] focus:border-[#b6784c]"
                    placeholder="e.g. Support Bot, Research Assistant, Code Reviewer..."
                  />
                </div>
                <div>
                  <p className="text-[#7f7c76] text-xs font-semibold mb-2">
                    AGENT TYPE
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {PURPOSE_TYPES.map((x) => (
                      <Chip
                        key={x}
                        label={x}
                        active={data.purposeType === x}
                        onClick={() =>
                          setData((p) => ({ ...p, purposeType: x }))
                        }
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[#7f7c76] text-xs font-semibold mb-1">
                    MAIN JOB
                  </p>
                  <textarea
                    value={data.mainJob}
                    onChange={(e) =>
                      setData((p) => ({ ...p, mainJob: e.target.value }))
                    }
                    className="w-full h-28 rounded-xl border border-[#bfb8ac] bg-white p-4 text-sm text-[#1f1f1d] placeholder:text-[#6f6a61] focus:outline-none focus:ring-2 focus:ring-[#d9b79e] focus:border-[#b6784c]"
                    placeholder="e.g. Answer customer questions, handle returns, and create support tickets..."
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      "Answer customer questions and escalate unresolved issues",
                      "Search the web and write structured research reports",
                      "Review code for bugs and suggest improvements",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => setData((p) => ({ ...p, mainJob: s }))}
                        className="px-3 py-1.5 rounded-full border border-[var(--theme-border)] bg-[var(--theme-accent-soft)] text-[var(--theme-accent-hover)] text-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[#7f7c76] text-xs font-semibold mb-2">
                    AUDIENCE
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {AUDIENCE_CHIPS.map((x) => (
                      <Chip
                        key={x}
                        label={x}
                        active={data.audience === x}
                        onClick={() => setData((p) => ({ ...p, audience: x }))}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[#7f7c76] text-xs font-semibold mb-2">
                    TONE
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {TONE_CHIPS.map((x) => (
                      <Chip
                        key={x}
                        label={x}
                        active={data.tone === x}
                        onClick={() => setData((p) => ({ ...p, tone: x }))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 – System Prompt */}
          {step === 2 && (
            <div>
              <p className="text-[#9a4f20] font-bold text-sm">STEP 2 OF 6</p>
              <p className="text-[#66645f] mt-2 text-base">
                The system prompt defines the agent&apos;s persona, scope, and
                behaviour.
              </p>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() =>
                    setData((p) => ({ ...p, systemPrompt: makePrompt(p) }))
                  }
                  className="px-5 h-10 rounded-full border border-[#e0b895] text-[#c8682b] bg-[#fff3e8] text-sm font-semibold"
                >
                  Regenerate from answers
                </button>
              </div>
              {data.systemPrompt && (
                <div className="mt-2 rounded-lg border border-[#99c8ba] bg-[#d8efe8] text-[#215d50] px-4 py-2 text-sm font-medium">
                  Auto-generated from your Step 1 answers — edit freely below.
                </div>
              )}
              <textarea
                value={data.systemPrompt}
                onChange={(e) =>
                  setData((p) => ({ ...p, systemPrompt: e.target.value }))
                }
                className="mt-2 w-full h-[300px] rounded-xl border border-[#bfb8ac] bg-white p-4 text-[15px] text-[#1f1f1d] placeholder:text-[#6f6a61] leading-6 focus:outline-none focus:ring-2 focus:ring-[#d9b79e] focus:border-[#b6784c]"
                placeholder="Write your system prompt here or click 'Regenerate from answers' above..."
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="rounded-xl border border-[#d8e6db] bg-white p-4">
                  <p className="text-emerald-700 font-semibold mb-2">Include</p>
                  <ul className="list-disc pl-4 text-sm text-[#65635e] space-y-1">
                    <li>Agent persona &amp; role</li>
                    <li>Scope (what it handles)</li>
                    <li>Tone &amp; response length</li>
                    <li>Escalation rules</li>
                    <li>What it must never do</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-[#eaded7] bg-white p-4">
                  <p className="text-rose-600 font-semibold mb-2">Avoid</p>
                  <ul className="list-disc pl-4 text-sm text-[#65635e] space-y-1">
                    <li>Vague instructions</li>
                    <li>Contradictory rules</li>
                    <li>Unnecessary jargon</li>
                    <li>Overly long prompts</li>
                    <li>Missing edge cases</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 – Tools */}
          {step === 3 && (
            <div>
              <p className="text-[#9a4f20] font-bold text-sm">STEP 3 OF 6</p>
              <p className="text-[#66645f] mt-2 text-base">
                Equip your agent with tools. Click any tool to see configuration
                steps.
              </p>
              <div className="mt-5 flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 flex-wrap">
                  {["All", "Connected", "Available", "Suggested"].map(
                    (tab, i) => (
                      <button
                        key={tab}
                        className={`px-4 h-9 rounded-full text-sm font-medium border ${
                          i === 0
                            ? "bg-[#c8682b] text-white border-[#c8682b]"
                            : "bg-[#f4f2ed] text-[#494744] border-[#d4d0c7]"
                        }`}
                      >
                        {tab}
                      </button>
                    ),
                  )}
                </div>
                <button className="px-4 h-9 rounded-full border border-[#d4d0c7] text-[#4e4c48] text-sm flex items-center gap-1 bg-[#f9f8f5]">
                  All categories <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {TOOL_CARDS.map((tool) => {
                  const checked = data.selectedTools.includes(tool.name);
                  return (
                    <label
                      key={tool.name}
                      className="rounded-xl border border-[#d6d2ca] bg-[#f7f5f1] overflow-hidden cursor-pointer"
                    >
                      <div className="px-4 py-3 flex gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setData((p) => ({
                              ...p,
                              selectedTools: toggle(p.selectedTools, tool.name),
                            }))
                          }
                          className="mt-1"
                        />
                        <div>
                          <p className="font-semibold text-[#2b2b2a] flex items-center gap-2">
                            <tool.icon className="w-4 h-4 text-[#6c6a66]" />
                            {tool.name}
                          </p>
                          <p className="text-[#6d6a64] text-sm mt-1">
                            {tool.desc}
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-2 border-t border-[#dfdbd2] text-[#c8682b] text-sm font-semibold flex items-center justify-between">
                        <span>How to configure</span>
                        <span>›</span>
                      </div>
                    </label>
                  );
                })}
              </div>
              <div className="mt-3 rounded-xl border border-[#97addb] bg-[#e8efff] px-4 py-3 text-sm text-[#2d4d90] font-medium">
                Claude Opus 4.6 and other top models support function calling —
                define tools in JSON schema and the model invokes them
                automatically.
              </div>
            </div>
          )}

          {/* Step 4 – Memory */}
          {step === 4 && (
            <div>
              <p className="text-[#9a4f20] font-bold text-sm">STEP 4 OF 6</p>
              <p className="text-[#66645f] mt-2 text-base">
                Configure short-term (conversation history) and long-term memory
                (vector store).
              </p>
              <div className="mt-5 space-y-3">
                {MEMORY_MODES.map((mode) => {
                  const active = data.memoryMode === mode;
                  const descriptions: Record<MemoryMode, string> = {
                    "No Memory":
                      "Stateless — each conversation starts fresh. Best for simple Q&A agents.",
                    "Short-term Only":
                      "Maintains conversation history within a session. Forgets after the session ends.",
                    "Short + Long-term":
                      "Persists key facts, preferences, and user data to a vector store across all sessions.",
                  };
                  return (
                    <button
                      key={mode}
                      onClick={() =>
                        setData((p) => ({ ...p, memoryMode: mode }))
                      }
                      className={`w-full rounded-2xl border p-5 text-left transition-colors ${
                        active
                          ? "border-[#d46f34] bg-[#fbf4ed]"
                          : "border-[#d4d0c7] bg-[#f7f5f1]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {active ? (
                          <Check className="w-5 h-5 mt-0.5 text-[#c8682b]" />
                        ) : (
                          <Circle className="w-5 h-5 mt-0.5 text-[#938f87]" />
                        )}
                        <div>
                          <p className="font-semibold text-xl text-[#1f1f1d]">
                            {mode}
                          </p>
                          <p className="text-[#6f6d68] text-sm mt-1">
                            {descriptions[mode]}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
                <div className="rounded-xl border border-[#d5bf7a] bg-[#f5eccd] px-4 py-3 text-sm text-[#6f5317] font-medium">
                  <span className="font-semibold">Pro tip:</span> Long-term
                  memory uses a vector store (Pinecone, Weaviate). Store user
                  preferences and context summaries — not raw conversation logs.
                </div>
              </div>
            </div>
          )}

          {/* Step 5 – Test */}
          {step === 5 && (
            <div>
              <p className="text-[#9a4f20] font-bold text-sm">STEP 5 OF 6</p>
              <p className="text-[#66645f] mt-2 text-base">
                Run the agent through test scenarios covering edge cases. Refine
                based on failures.
              </p>
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-xl text-[#1f1f1e]">
                    Recommended Scenarios
                  </p>
                  <p className="text-[#8b8984] text-sm">
                    {data.testScenarios.length} selected
                  </p>
                </div>
                <div className="space-y-2">
                  {SUGGESTED_SCENARIOS.map((q, i) => {
                    const checked = data.testScenarios.includes(q);
                    return (
                      <label
                        key={q}
                        className="rounded-xl border border-[#d9d5cc] bg-[#f7f5f1] px-4 py-3 flex items-center justify-between text-sm text-[#4f4d49] cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setData((p) => ({
                                ...p,
                                testScenarios: toggle(p.testScenarios, q),
                              }))
                            }
                          />
                          {q}
                        </span>
                        <span className="text-[#9b9993] text-sm shrink-0 ml-2">
                          Scenario {i + 1}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-xl border border-[#d4cfc6] bg-white p-3">
                  <input
                    value={manualScenario}
                    onChange={(e) => setManualScenario(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = manualScenario.trim();
                        if (!val) return;
                        setData((p) => ({
                          ...p,
                          testScenarios: p.testScenarios.includes(val)
                            ? p.testScenarios
                            : [...p.testScenarios, val],
                        }));
                        setManualScenario("");
                      }
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-[#bfb8ac] text-sm text-[#1f1f1d] placeholder:text-[#6f6a61] focus:outline-none focus:ring-2 focus:ring-[#d9b79e] focus:border-[#b6784c]"
                    placeholder="Add custom test scenario..."
                  />
                  <button
                    className="mt-2 h-9 px-4 rounded-full bg-[#c8682b] text-white text-sm font-semibold inline-flex items-center gap-1"
                    onClick={() => {
                      const val = manualScenario.trim();
                      if (!val) return;
                      setData((p) => ({
                        ...p,
                        testScenarios: p.testScenarios.includes(val)
                          ? p.testScenarios
                          : [...p.testScenarios, val],
                      }));
                      setManualScenario("");
                    }}
                  >
                    <Plus className="w-3 h-3" /> Add scenario
                  </button>
                </div>
                <div className="mt-3 rounded-xl border border-[#93c1b5] bg-[#d4eae3] px-4 py-3 text-sm text-[#165f51] font-medium">
                  <span className="font-semibold">Playground:</span> Use the
                  built-in Playground to run test conversations and debug
                  failures. Aim for ≥ 90% pass rate before deployment.
                </div>
                <button className="mt-3 w-full rounded-xl border border-[#e3c4ae] h-12 text-[#c8682b] text-lg font-semibold inline-flex items-center justify-center gap-2 bg-white">
                  <Play className="w-4 h-4" /> Open Playground
                </button>
              </div>
            </div>
          )}

          {/* Step 6 – Deploy */}
          {step === 6 && (
            <div>
              <p className="text-[#9a4f20] font-bold text-sm">STEP 6 OF 6</p>
              <p className="text-[#66645f] mt-2 text-base">
                Get a shareable endpoint or embed widget. Monitor performance in
                the dashboard.
              </p>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                {(
                  [
                    {
                      type: "API Endpoint" as DeploymentType,
                      desc: "Get a REST endpoint. Integrate into any app, website, or backend in minutes.",
                      tag: "Most flexible",
                      icon: Link2,
                    },
                    {
                      type: "Embed Widget" as DeploymentType,
                      desc: "Drop a chat widget onto your website with one line of JavaScript.",
                      tag: "No-code option",
                      icon: MessageCircleMore,
                    },
                    {
                      type: "Slack Bot" as DeploymentType,
                      desc: "Deploy as a Slack bot — your team can chat with the agent directly.",
                      tag: "Internal teams",
                      icon: Bot,
                    },
                    {
                      type: "WhatsApp / SMS" as DeploymentType,
                      desc: "Connect via Twilio to deploy on WhatsApp or SMS.",
                      tag: "Consumer reach",
                      icon: LayoutDashboard,
                    },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.type}
                    onClick={() =>
                      setData((p) => ({ ...p, deploymentType: d.type }))
                    }
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      data.deploymentType === d.type
                        ? "border-[#d46f34] bg-[#fbf4ed]"
                        : "border-[#d7d2c8] bg-[#f6f4ef]"
                    }`}
                  >
                    <d.icon className="w-5 h-5 text-[#9a6bba]" />
                    <p className="font-semibold text-xl mt-2 text-[#1f1f1e]">
                      {d.type}
                    </p>
                    <p className="text-sm text-[#6d6a64] mt-1">{d.desc}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#f8e6d6] text-[#c8682b] text-xs font-semibold">
                      {d.tag}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-[#d7b69e] bg-[#f6ece3] px-5 py-8 text-center">
                <p className="text-lg">🎉</p>
                <p className="font-semibold text-2xl text-[#252523] mt-1">
                  Your agent is ready to deploy!
                </p>
                <p className="text-[#74716a] text-sm mt-1">
                  Review your configuration and click Create Agent to save.
                </p>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-rose-600 mt-4">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--theme-border)] flex items-center justify-between">
          <button
            onClick={prev}
            disabled={step === 1}
            className="h-11 px-6 rounded-full border border-[var(--theme-border)] bg-white text-[var(--theme-text)] font-medium disabled:opacity-50"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            {WIZARD_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-2.5 rounded-full transition-all ${
                  step === idx + 1
                    ? "bg-[var(--theme-accent-strong)] w-6"
                    : "bg-[var(--theme-text-muted)] w-2.5"
                }`}
              />
            ))}
          </div>
          {step < 6 ? (
            <button
              onClick={next}
              className="h-11 px-7 rounded-full font-semibold bg-[var(--theme-accent-strong)] text-white"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => void create()}
              disabled={saving}
              className="h-11 px-7 rounded-full font-semibold bg-[var(--theme-accent-strong)] text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create Agent"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

function AgentChatPanel({
  agent,
  onBack,
}: {
  agent: AgentRecord;
  onBack: () => void;
}) {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const historyKey = useMemo(
    () => `${AGENT_CHAT_HISTORY_STORAGE_PREFIX}.${agent.id}`,
    [agent.id],
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getAgentChatHistory(historyKey),
  );
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const safeMessages = messages.map((message) => ({
        ...message,
        attachments: message.attachments?.map((attachment) => {
          const rest = { ...attachment };
          delete rest.previewUrl;
          return rest;
        }),
      }));
      window.sessionStorage.setItem(historyKey, JSON.stringify(safeMessages));
    } catch {
      // Ignore storage failures.
    }
  }, [historyKey, messages]);

  useEffect(() => {
    const socket = io(ChatService.apiUrl(), { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("disconnect", () => {
      setIsTyping(false);
    });

    socket.on("chat:typing", (payload: { typing: boolean }) => {
      setIsTyping(!!payload?.typing);
    });

    socket.on(
      "chat:response",
      (payload: {
        id: string;
        role: "assistant";
        content: string;
        timestamp: string;
      }) => {
        const assistantMessage: ChatMessage = {
          id: payload.id ?? crypto.randomUUID(),
          role: "assistant",
          content: payload.content ?? "",
          timestamp: payload.timestamp ?? new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      },
    );

    socket.on("chat:ack", () => {
      setSending(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, sending, isTyping]);

  const sendMessage = async (
    text: string,
    uploads?: { id: string; file: File; type: string }[],
  ) => {
    const trimmed = (text ?? "").trim();
    if (!trimmed && (!uploads || uploads.length === 0)) return;
    if (sending) return;

    const clientMessageId = crypto.randomUUID();
    const localAttachments: ChatAttachment[] =
      uploads?.map((upload) => ({
        id: upload.id,
        kind: (upload.type as ChatAttachment["kind"]) ?? "document",
        name: upload.file.name,
        mimeType: upload.file.type || "application/octet-stream",
        size: upload.file.size,
        previewUrl:
          upload.type === "image" || upload.type === "video"
            ? URL.createObjectURL(upload.file)
            : undefined,
      })) ?? [];

    const userMessage: ChatMessage = {
      id: clientMessageId,
      role: "user",
      content: trimmed,
      attachments: localAttachments.length ? localAttachments : undefined,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const uploaded =
        uploads && uploads.length > 0
          ? await ChatService.uploadAttachments(
              uploads.map((upload) => upload.file),
            )
          : [];

      socketRef.current?.emit("chat:message", {
        clientMessageId,
        text: trimmed,
        modelId: agent.modelId,
        attachments: uploaded,
      });

      if (!socketRef.current?.connected) {
        const result = await ChatService.simulate(
          trimmed || "(attachments)",
          agent.modelId,
          uploads?.map((upload) => upload.file) ?? [],
        );

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.reply,
          timestamp: result.timestamp,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setSending(false);
      }
    } catch {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: t("chat.sendError"),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setSending(false);
    }
  };

  return (
    <div className="p-3 md:p-4 h-full">
      <div className="rounded-2xl border border-[var(--theme-border)] bg-[linear-gradient(135deg,rgba(232,245,189,0.34),rgba(255,253,247,0.96))] p-4 md:p-5 h-full flex flex-col min-h-[78vh]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <button
              onClick={onBack}
              className="theme-button-secondary inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to agent overview
            </button>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[var(--theme-accent-strong)] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-semibold text-[var(--theme-text)] truncate">
                  {agent.name}
                </h1>
                <p className="text-sm text-[var(--theme-text-muted)] truncate">
                  {agent.description}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--theme-border)] bg-[rgba(255,255,255,0.92)] px-4 py-3 text-sm text-[var(--theme-text-muted)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--theme-text-muted)]">
              Active Model
            </p>
            <p className="mt-1 font-semibold text-[var(--theme-text)]">
              {agent.modelName ?? "No model selected"}
            </p>
            {agent.modelProvider && (
              <p className="text-xs text-[var(--theme-text-muted)]">
                {agent.modelProvider}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--theme-border)] bg-[rgba(255,255,255,0.92)] p-4 flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-muted)] p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="w-full max-w-2xl bg-[rgba(255,255,255,0.94)] border border-[var(--theme-border)] rounded-3xl p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[rgba(232,245,189,0.7)] border border-[var(--theme-border-strong)] flex items-center justify-center text-[var(--theme-accent-hover)]">
                    ✦
                  </div>
                  <h2 className="text-3xl font-semibold text-[var(--theme-text)] mb-2">
                    Chat with {agent.name}
                  </h2>
                  <p className="text-sm text-[var(--theme-text-muted)] mb-2">
                    {agent.role} is ready to help inside this dedicated
                    workspace.
                  </p>
                  <p className="text-xs text-[var(--theme-text-muted)]">
                    Model:{" "}
                    <span className="font-semibold text-[var(--theme-text)]">
                      {agent.modelName ?? "Not selected"}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[82%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
                      message.role === "user"
                        ? "ml-auto bg-[var(--theme-accent-strong)] text-white"
                        : "bg-[rgba(255,255,255,0.94)] border border-[var(--theme-border)] text-[var(--theme-text)]"
                    }`}
                  >
                    {message.content}
                    {!!message.attachments?.length && (
                      <div
                        className={`mt-3 flex flex-wrap gap-2 ${
                          message.role === "user"
                            ? "text-white/90"
                            : "text-[var(--theme-text-muted)]"
                        }`}
                      >
                        {message.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className={`rounded-lg border px-2 py-1 text-xs ${
                              message.role === "user"
                                ? "border-white/25 bg-white/10"
                                : "border-[var(--theme-border)] bg-[rgba(255,255,255,0.92)]"
                            }`}
                          >
                            {(attachment.kind === "image" ||
                              attachment.kind === "video") &&
                            attachment.previewUrl ? (
                              attachment.kind === "image" ? (
                                <Image
                                  src={attachment.previewUrl}
                                  alt={attachment.name}
                                  width={112}
                                  height={80}
                                  unoptimized
                                  className="mb-1 h-20 w-28 rounded object-cover"
                                />
                              ) : (
                                <video
                                  src={attachment.previewUrl}
                                  className="mb-1 h-20 w-28 rounded object-cover"
                                  controls
                                />
                              )
                            ) : null}
                            <div className="max-w-[240px] truncate">
                              {attachment.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {(sending || isTyping) && (
                  <p className="text-sm text-[var(--theme-text-muted)]">
                    {t("common.assistantTyping")}
                  </p>
                )}
              </>
            )}
            <div ref={bottomAnchorRef} />
          </div>

          <div className="mt-4">
            <ChatInputBar
              value={input}
              onChange={setInput}
              onSubmit={async (text, uploads) => {
                await sendMessage(text, uploads);
              }}
              submitBehavior="submit"
              tabRedirectToChatHub={true}
              disabled={sending}
            />
            <p className="mt-2 text-xs text-[var(--theme-text-muted)]">
              Responses are generated with{" "}
              <span className="font-semibold text-[var(--theme-text)]">
                {agent.modelName ?? "the assigned model"}
              </span>
              {agent.modelProvider ? ` by ${agent.modelProvider}` : ""}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentsPage() {
  const { t } = useI18n();
  const router = useRouter();

  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string>("");
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(TEMPLATES[0].title);

  const activeAgentData = useMemo(
    () => agents.find((a) => a.id === activeAgentId) ?? null,
    [agents, activeAgentId],
  );
  const shouldShowAgentChat = Boolean(activeAgentData?.modelId);

  const selectedTemplate =
    TEMPLATES.find((x) => x.title === activeTemplate) ?? TEMPLATES[0];

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push("/login?redirect=/agents");
      return;
    }
    const run = async () => {
      setLoadingAgents(true);
      setAgentsError(null);
      try {
        const rows = await AgentService.getMyAgents();
        setAgents(rows);
      } catch (e) {
        setAgentsError(AuthService.getErrorMessage(e));
      } finally {
        setLoadingAgents(false);
      }
    };
    void run();
  }, [router]);

  const handleCreated = (agent: AgentRecord) => {
    setAgents((prev) => [agent, ...prev]);
    setActiveAgentId(agent.id);
  };

  return (
    <div className="min-h-screen flex flex-col theme-page">
      <Header />
      <main className="flex-1 pt-24 px-2 sm:px-3 lg:px-4 pb-4">
        <div className="grid grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)] gap-3">
          {/* Sidebar */}
          <aside className="theme-panel rounded-2xl p-3 h-fit xl:sticky xl:top-24">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[rgba(232,245,189,0.45)] text-[var(--theme-accent-strong)] inline-flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--theme-text)]">
                  Agent Builder
                </p>
                <p className="text-[11px] text-[var(--theme-text-muted)]">
                  Create AI agents from scratch
                </p>
              </div>
            </div>

            <p className="text-xs text-[var(--theme-text-muted)] px-1 mb-2">
              Your Agents
            </p>

            {loadingAgents && (
              <p className="text-xs text-[var(--theme-text-muted)] mb-2">
                Loading agents...
              </p>
            )}
            {agentsError && (
              <p className="text-xs text-rose-600 mb-2">{agentsError}</p>
            )}
            {!loadingAgents && agents.length === 0 && (
              <p className="text-xs text-[var(--theme-text-muted)] mb-2">
                No agents yet. Create your first one.
              </p>
            )}

            <div className="space-y-1 mb-3">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgentId(agent.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg border transition-colors ${
                    activeAgentId === agent.id
                      ? "bg-[rgba(232,245,189,0.32)] border-[var(--theme-border-strong)]"
                      : "bg-[rgba(255,255,255,0.88)] border-transparent hover:bg-[var(--theme-surface-muted)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[var(--theme-text)]">
                      {agent.name}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        agent.status === "Live"
                          ? "bg-[rgba(232,245,189,0.45)] text-[var(--theme-accent-hover)]"
                          : "bg-[var(--theme-surface-muted)] text-[var(--theme-text-muted)]"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
                    {agent.role}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowBuilder(true)}
              className="theme-button-primary w-full rounded-xl py-2 text-sm font-medium mb-3"
            >
              + New Agent
            </button>

            <div className="theme-panel-muted rounded-xl p-3">
              <p className="text-xs font-semibold text-[var(--theme-text)] mb-1">
                Not sure where to start?
              </p>
              <p className="text-[11px] text-[var(--theme-text-muted)] mb-2">
                Ask Hub for guidance and generate your starter workflow.
              </p>
              <button
                onClick={() => router.push("/chat-hub")}
                className="theme-button-secondary text-xs rounded-full px-2.5 py-1"
              >
                Ask the Hub
              </button>
            </div>
          </aside>

          {/* Main content */}
          <section className="theme-panel rounded-2xl min-h-[78vh] overflow-hidden">
            {shouldShowAgentChat && activeAgentData ? (
              <AgentChatPanel
                key={activeAgentData.id}
                agent={activeAgentData}
                onBack={() => setActiveAgentId("")}
              />
            ) : (
              <div className="p-3 md:p-4 space-y-4">
                {/* Hero banner */}
                <div className="rounded-2xl border border-[var(--theme-border)] bg-[linear-gradient(135deg,rgba(232,245,189,0.34),rgba(255,253,247,0.96))] p-4 md:p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h1 className="text-xl md:text-2xl font-semibold text-[var(--theme-text)]">
                        Build your AI Agent in minutes
                      </h1>
                      <p className="text-sm text-[var(--theme-text-muted)] mt-1">
                        Pick a template, customize the behavior, and deploy
                        instantly.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBuilder(true)}
                      className="theme-button-primary self-start md:self-auto rounded-full px-4 py-2 text-sm font-medium"
                    >
                      Start Building
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {[
                      { icon: BrainCircuit, label: "Reasoning Ready" },
                      { icon: Code2, label: "Dev Workflows" },
                      { icon: Database, label: "Data Integrations" },
                      { icon: Rocket, label: "One-click Deploy" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-[var(--theme-border)] bg-[rgba(255,255,255,0.9)] px-3 py-2.5 flex items-center gap-2"
                      >
                        <item.icon className="w-4 h-4 text-[var(--theme-accent-strong)]" />
                        <span className="text-xs font-medium text-[var(--theme-text)]">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {activeAgentData && (
                  <div className="rounded-xl border border-[var(--theme-border)] bg-[rgba(255,255,255,0.9)] p-4">
                    <p className="text-xs text-[var(--theme-text-muted)]">
                      Selected agent
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-[var(--theme-accent-strong)]" />
                      <p className="text-lg font-semibold text-[var(--theme-text)]">
                        {activeAgentData.name}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--theme-surface-muted)] text-[var(--theme-text-muted)]">
                        {activeAgentData.role}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--theme-text-muted)] mt-2">
                      Status: {activeAgentData.status}
                    </p>
                    <p className="text-xs text-[var(--theme-text-muted)]">
                      Created:{" "}
                      {new Date(activeAgentData.createdAt).toLocaleString()}
                    </p>
                    {!activeAgentData.modelId && (
                      <p className="text-xs text-amber-700 mt-2">
                        Select or assign a model to enter focused chat mode.
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--theme-text-muted)] mb-2">
                      AGENT TEMPLATES
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                      {TEMPLATES.map((item) => (
                        <TemplateCard
                          key={item.title}
                          item={item}
                          active={activeTemplate === item.title}
                          onClick={() => setActiveTemplate(item.title)}
                        />
                      ))}
                      <button
                        onClick={() => setShowBuilder(true)}
                        className="theme-panel-muted rounded-xl p-3 text-[var(--theme-text-muted)] min-h-[146px] hover:shadow-sm text-left"
                      >
                        <div className="text-2xl mb-2">+</div>
                        <div className="text-sm font-medium">
                          {t("agents.buildFromScratch")}
                        </div>
                        <p className="text-xs text-[var(--theme-text-muted)] mt-1">
                          {t("agents.buildFromScratchDesc")}
                        </p>
                      </button>
                    </div>
                  </div>

                  <aside className="theme-panel-muted rounded-xl p-3 space-y-3 h-fit">
                    <p className="text-xs font-semibold text-[var(--theme-text)]">
                      TEMPLATE DETAILS
                    </p>
                    <div className="rounded-lg bg-[rgba(255,255,255,0.92)] border border-[var(--theme-border)] p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`w-8 h-8 rounded-lg ${selectedTemplate.color} inline-flex items-center justify-center`}
                        >
                          <Bot className="w-4 h-4 text-[var(--theme-accent-hover)]" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[var(--theme-text)]">
                            {selectedTemplate.title}
                          </p>
                          <p className="text-xs text-[var(--theme-text-muted)]">
                            Ready-to-use workflow
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                        {selectedTemplate.desc}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {selectedTemplate.tags.map((tag) => (
                          <Badge key={tag} label={tag} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg bg-[rgba(255,255,255,0.92)] border border-[var(--theme-border)] p-3">
                      <p className="text-xs font-semibold text-[var(--theme-text)] mb-2">
                        Best for
                      </p>
                      <div className="space-y-1.5 text-xs text-[var(--theme-text-muted)]">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-[var(--theme-accent-strong)]" />{" "}
                          Business automation
                        </div>
                        <div className="flex items-center gap-2">
                          <Code2 className="w-3.5 h-3.5 text-[var(--theme-accent-strong)]" />{" "}
                          Developer assistants
                        </div>
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-3.5 h-3.5 text-[var(--theme-accent-strong)]" />{" "}
                          Content and growth workflows
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowBuilder(true)}
                      className="theme-button-primary w-full rounded-xl text-sm font-medium py-2"
                    >
                      Use this Template
                    </button>
                    <button className="theme-button-secondary w-full rounded-xl text-sm font-medium py-2">
                      Preview Workflow
                    </button>
                    <div className="rounded-lg border border-[var(--theme-border)] bg-[rgba(255,255,255,0.92)] p-2.5 text-[11px] text-[var(--theme-text-muted)]">
                      Tip: Start with a template, then customize tools, memory
                      and response style.
                    </div>
                  </aside>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {showBuilder && (
        <BuilderWizard
          onClose={() => setShowBuilder(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
