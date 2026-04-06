"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
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
import { useI18n } from "../../components/I18nProvider";
import { AuthService } from "../../services/auth.service";
import {
  AgentRecord,
  AgentService,
  CreateAgentPayload,
  DeploymentType,
  MemoryMode,
} from "../../services/agent.service";

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
const DEPLOYMENT_TYPES: DeploymentType[] = [
  "API Endpoint",
  "Embed Widget",
  "Slack Bot",
  "WhatsApp / SMS",
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
    color: "bg-[#ECF7F0]",
  },
  {
    title: "Customer Support Agent",
    desc: "Handles FAQs and resolves complex issues via multi-conversation context.",
    tags: ["Claude Sonnet 4", "Ticket System", "CRM"],
    color: "bg-[#F5EEFF]",
  },
  {
    title: "Code Review Agent",
    desc: "Reviews pull requests for bugs, suggests improvements, and explains changes.",
    tags: ["GPT-5", "GitHub API", "PR Checks"],
    color: "bg-[#ECF2FF]",
  },
  {
    title: "Data Analysis Agent",
    desc: "Processes spreadsheet and chart data to answer questions and produce insights.",
    tags: ["GPT-5", "CSV Parser", "Analytics"],
    color: "bg-[#FFF7EA]",
  },
  {
    title: "Content Writer Agent",
    desc: "Creates blog posts, social content, and marketing copy with consistent brand voice.",
    tags: ["GPT-5", "SEO Optimizer", "Brand Voice"],
    color: "bg-[#FCEFF4]",
  },
];

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
    <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#d7cfbf] bg-[#f8f6f1] text-zinc-700">
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
        active
          ? "bg-[#fff3ea] border-[#d56a2f] text-[#c8682b]"
          : "bg-[#f6f4ef] border-[#cfcac0] text-[#3a3937]"
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
          ? "border-[#d6723a] bg-[#fff8f3] shadow-sm"
          : "border-[#ebe6dc] bg-white hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-7 h-7 rounded-lg ${item.color} inline-flex items-center justify-center`}
        >
          <Bot className="w-4 h-4 text-zinc-700" />
        </span>
        <h3 className="text-sm font-semibold text-zinc-900">{item.title}</h3>
      </div>
      <p className="text-xs text-zinc-700 line-clamp-2">{item.desc}</p>
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
    <div className="px-6 py-2 border-b border-[#dcd6cb] bg-[#f7f4ee] flex items-center gap-5 text-sm overflow-x-auto">
      {WIZARD_STEPS.map((label, idx) => {
        const i = idx + 1;
        const done = i < step;
        const active = i === step;
        return (
          <div
            key={label}
            className={`flex items-center gap-2 whitespace-nowrap ${
              active
                ? "text-[#1e1e1d] font-semibold"
                : done
                  ? "text-[#4f4b44] font-medium"
                  : "text-[#6f6a61]"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full inline-flex items-center justify-center text-[10px] ${
                active
                  ? "bg-[#c8682b] text-white"
                  : done
                    ? "bg-[#e7c9b4] text-[#7b3d1c]"
                    : "bg-[#d6d0c5] text-[#4d4941]"
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
      <div className="w-full max-w-[1050px] h-[95vh] bg-[#f0efeb] rounded-2xl border border-[#ddd9d2] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-3 border-b border-[#e4e1dc] flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c8682b] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[22px] font-semibold text-[#1f1f1f]">
                {STEP_TITLES[step]}
              </h2>
              <p className="text-xs text-[#8d8a84] mt-1">Step {step} of 6</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#c8c5bf] text-[#8b8b87] flex items-center justify-center hover:bg-[#f6f4ef]"
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
              <p className="text-[#9a4f20] font-bold text-sm">
                STEP 1 OF 6
              </p>
              <p className="text-[#66645f] mt-2 text-base">
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
                        className="px-3 py-1.5 rounded-full border border-[#d9b79e] bg-[#fdf4ec] text-[#c8682b] text-sm"
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
              <p className="text-[#9a4f20] font-bold text-sm">
                STEP 2 OF 6
              </p>
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
              <p className="text-[#9a4f20] font-bold text-sm">
                STEP 3 OF 6
              </p>
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
              <p className="text-[#9a4f20] font-bold text-sm">
                STEP 4 OF 6
              </p>
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
              <p className="text-[#9a4f20] font-bold text-sm">
                STEP 5 OF 6
              </p>
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
              <p className="text-[#9a4f20] font-bold text-sm">
                STEP 6 OF 6
              </p>
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
        <div className="px-6 py-4 border-t border-[#e1ddd5] flex items-center justify-between">
          <button
            onClick={prev}
            disabled={step === 1}
            className="h-11 px-6 rounded-full border border-[#bcb5aa] bg-white text-[#232220] font-medium disabled:opacity-50"
          >
            ← Back
          </button>
          <div className="flex gap-2">
            {WIZARD_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-2.5 rounded-full transition-all ${
                  step === idx + 1 ? "bg-[#b65a24] w-6" : "bg-[#b8b1a6] w-2.5"
                }`}
              />
            ))}
          </div>
          {step < 6 ? (
            <button
              onClick={next}
              className="h-11 px-7 rounded-full font-semibold bg-[#c8682b] text-white"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => void create()}
              disabled={saving}
              className="h-11 px-7 rounded-full font-semibold bg-[#c8682b] text-white disabled:opacity-60"
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
    () => agents.find((a) => a.id === activeAgentId) ?? agents[0],
    [agents, activeAgentId],
  );

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
        if (rows.length > 0) setActiveAgentId(rows[0].id);
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
    <div className="min-h-screen flex flex-col bg-[#f4f3ef]">
      <Header />
      <main className="flex-1 pt-24 px-2 sm:px-3 lg:px-4 pb-4">
        <div className="grid grid-cols-1 xl:grid-cols-[240px_minmax(0,1fr)] gap-3">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-[#e7e1d7] bg-white p-3 h-fit xl:sticky xl:top-24">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#fbefe5] text-[#c55f23] inline-flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Agent Builder
                </p>
                <p className="text-[11px] text-zinc-700">
                  Create AI agents from scratch
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-700 px-1 mb-2">Your Agents</p>

            {loadingAgents && (
              <p className="text-xs text-zinc-600 mb-2">Loading agents...</p>
            )}
            {agentsError && (
              <p className="text-xs text-rose-600 mb-2">{agentsError}</p>
            )}
            {!loadingAgents && agents.length === 0 && (
              <p className="text-xs text-zinc-600 mb-2">
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
                      ? "bg-[#fff3ea] border-[#efcfb8]"
                      : "bg-white border-transparent hover:bg-[#f7f4ef]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-zinc-800">
                      {agent.name}
                    </p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        agent.status === "Live"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    {agent.role}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowBuilder(true)}
              className="w-full bg-[#d56a2f] hover:bg-[#bf5d29] text-white rounded-xl py-2 text-sm font-medium mb-3"
            >
              + New Agent
            </button>

            <div className="rounded-xl border border-[#eee8de] bg-[#faf8f4] p-3">
              <p className="text-xs font-semibold text-zinc-700 mb-1">
                Not sure where to start?
              </p>
              <p className="text-[11px] text-zinc-700 mb-2">
                Ask Hub for guidance and generate your starter workflow.
              </p>
              <button
                onClick={() => router.push("/chat-hub")}
                className="text-xs rounded-full border border-[#d9d0c2] text-zinc-700 px-2.5 py-1 bg-white"
              >
                Ask the Hub
              </button>
            </div>
          </aside>

          {/* Main content */}
          <section className="rounded-2xl border border-[#e7e1d7] bg-white min-h-[78vh] overflow-hidden">
            <div className="p-3 md:p-4 space-y-4">
              {/* Hero banner */}
              <div className="rounded-2xl border border-[#eadfce] bg-gradient-to-r from-[#fff7f2] to-[#fffdf9] p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h1 className="text-xl md:text-2xl font-semibold text-zinc-900">
                      Build your AI Agent in minutes
                    </h1>
                    <p className="text-sm text-zinc-700 mt-1">
                      Pick a template, customize the behavior, and deploy
                      instantly.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBuilder(true)}
                    className="self-start md:self-auto rounded-full px-4 py-2 text-sm font-medium bg-[#d56a2f] text-white hover:bg-[#bf5d29]"
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
                      className="rounded-xl border border-[#eadfce] bg-white px-3 py-2.5 flex items-center gap-2"
                    >
                      <item.icon className="w-4 h-4 text-[#c55f23]" />
                      <span className="text-xs font-medium text-zinc-800">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active agent card (if any) */}
              {activeAgentData && (
                <div className="rounded-xl border border-[#eadfce] bg-[#fffdf9] p-4">
                  <p className="text-xs text-zinc-600">Selected agent</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#c55f23]" />
                    <p className="text-lg font-semibold">
                      {activeAgentData.name}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#f2eee6]">
                      {activeAgentData.role}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-2">
                    Status: {activeAgentData.status}
                  </p>
                  <p className="text-xs text-zinc-600">
                    Created:{" "}
                    {new Date(activeAgentData.createdAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Templates + detail panel */}
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-zinc-700 mb-2">
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
                      className="rounded-xl border border-[#eadfd4] bg-[#fcf5ee] p-3 text-zinc-700 min-h-[146px] hover:shadow-sm text-left"
                    >
                      <div className="text-2xl mb-2">+</div>
                      <div className="text-sm font-medium">
                        {t("agents.buildFromScratch")}
                      </div>
                      <p className="text-xs text-zinc-700 mt-1">
                        {t("agents.buildFromScratchDesc")}
                      </p>
                    </button>
                  </div>
                </div>

                <aside className="rounded-xl border border-[#ece6db] bg-[#faf8f4] p-3 space-y-3 h-fit">
                  <p className="text-xs font-semibold text-zinc-700">
                    TEMPLATE DETAILS
                  </p>
                  <div className="rounded-lg bg-white border border-[#e6dfd2] p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-8 h-8 rounded-lg ${selectedTemplate.color} inline-flex items-center justify-center`}
                      >
                        <Bot className="w-4 h-4 text-zinc-700" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {selectedTemplate.title}
                        </p>
                        <p className="text-xs text-zinc-600">
                          Ready-to-use workflow
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-700 leading-relaxed">
                      {selectedTemplate.desc}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {selectedTemplate.tags.map((tag) => (
                        <Badge key={tag} label={tag} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg bg-white border border-[#e6dfd2] p-3">
                    <p className="text-xs font-semibold text-zinc-800 mb-2">
                      Best for
                    </p>
                    <div className="space-y-1.5 text-xs text-zinc-700">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-[#c55f23]" />{" "}
                        Business automation
                      </div>
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-[#c55f23]" />{" "}
                        Developer assistants
                      </div>
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-3.5 h-3.5 text-[#c55f23]" />{" "}
                        Content and growth workflows
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBuilder(true)}
                    className="w-full rounded-xl bg-[#d56a2f] text-white text-sm font-medium py-2 hover:bg-[#bf5d29]"
                  >
                    Use this Template
                  </button>
                  <button className="w-full rounded-xl border border-[#d9d0c2] text-zinc-700 text-sm font-medium py-2 bg-white hover:bg-[#f8f5ef]">
                    Preview Workflow
                  </button>
                  <div className="rounded-lg border border-[#e6dfd2] bg-white p-2.5 text-[11px] text-zinc-600">
                    Tip: Start with a template, then customize tools, memory and
                    response style.
                  </div>
                </aside>
              </div>
            </div>
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
