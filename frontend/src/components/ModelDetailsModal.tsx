'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle2, Star } from 'lucide-react';
import { AiModel } from '../types/model.types';

export type ModelTab =
  | 'Overview'
  | 'How to Use'
  | 'Pricing'
  | 'Prompt Guide'
  | 'Agent Creation'
  | 'Reviews';

export function ModelDetailsModal({
  model,
  onClose,
  defaultTab = 'Overview',
}: {
  model: AiModel;
  onClose: () => void;
  defaultTab?: ModelTab;
}) {
  const tabs: ModelTab[] = [
    'Overview',
    'How to Use',
    'Pricing',
    'Prompt Guide',
    'Agent Creation',
    'Reviews',
  ];
  const [activeTab, setActiveTab] = useState<ModelTab>(defaultTab);

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden font-sans text-zinc-800 flex flex-col max-h-[92vh]">

        {/* HEADER */}
        <div className="px-8 py-6 flex items-center justify-between bg-white border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FCE8F3] rounded-xl flex items-center justify-center text-2xl shrink-0">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-zinc-900">{model.name}</h1>
                {model.isNew && (
                  <span className="bg-[#E8F8F0] text-[#2D8A5B] text-[10px] font-bold px-3 py-0.5 rounded-full border border-[#C8E6D9] uppercase tracking-wide">
                    New
                  </span>
                )}
              </div>
              <p className="text-zinc-400 text-sm mt-0.5">by {model.provider} · {model.category} model</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-all text-zinc-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="px-8 bg-white border-b border-zinc-100 flex gap-8 overflow-x-auto shrink-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab
                  ? 'text-[#D4622A]'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4622A]"
                />
              )}
            </button>
          ))}
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto flex-1 bg-[#F7F7F6]">
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === 'Overview' && <OverviewTab model={model} />}
                {activeTab === 'How to Use' && <HowToUseTab model={model} />}
                {activeTab === 'Pricing' && <PricingTab model={model} />}
                {activeTab === 'Prompt Guide' && <PromptGuideTab model={model} />}
                {activeTab === 'Agent Creation' && <AgentCreationTab />}
                {activeTab === 'Reviews' && <ReviewsTab model={model} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ model }: { model: AiModel }) {
  const useCases = [
    { icon: '✍️', label: 'Content writing' },
    { icon: '💻', label: 'Code generation' },
    { icon: '🔍', label: 'Document analysis' },
    { icon: '🌐', label: 'Translation' },
    { icon: '🎓', label: 'Education' },
    { icon: '📊', label: 'Data analysis' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <InfoCard title="DESCRIPTION">
          <p className="text-zinc-500 text-sm leading-relaxed">
            {model.name} is {model.provider}&apos;s {model.category} model optimized for{' '}
            {model.capabilities?.join(', ')}.
          </p>
        </InfoCard>
        <InfoCard title="INPUT / OUTPUT">
          <ul className="text-sm space-y-1.5 text-zinc-500">
            <li><span className="font-semibold text-zinc-800">Input:</span> Text, images, audio, PDFs</li>
            <li><span className="font-semibold text-zinc-800">Output:</span> Text, code, structured data</li>
            <li><span className="font-semibold text-zinc-800">Context:</span> {(model.contextWindow ?? 128000).toLocaleString()} tokens</li>
            <li><span className="font-semibold text-zinc-800">Max output:</span> 4,096 tokens</li>
            <li><span className="font-semibold text-zinc-800">Latency:</span> ~1.2s avg</li>
          </ul>
        </InfoCard>
      </div>

      <InfoCard title="USE CASES">
        <div className="grid grid-cols-5 gap-3">
          {useCases.map(({ icon, label }) => (
            <div
              key={label}
              className="bg-white border border-zinc-100 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:shadow-md hover:border-zinc-200 transition-all cursor-pointer"
            >
              <span className="text-2xl">{icon}</span>
              <p className="text-[10px] font-semibold text-zinc-500 text-center">{label}</p>
            </div>
          ))}
        </div>
      </InfoCard>

      <InfoCard title="EXAMPLE PROMPT → OUTPUT">
        <div className="space-y-4">
          <div className="bg-[#FFF6F2] p-4 rounded-xl border border-[#FFE4D6]">
            <p className="text-[10px] font-bold text-[#D4622A] mb-2 uppercase tracking-widest">User</p>
            <p className="text-zinc-700 text-sm italic">
              &quot;Summarize this research paper in 3 bullet points and suggest 2 follow-up questions.&quot;
            </p>
          </div>
          <div className="bg-[#EFF3FF] p-5 rounded-xl border border-[#DDE5FF]">
            <p className="text-[10px] font-bold text-blue-600 mb-3 uppercase tracking-widest">{model.name}</p>
            <ul className="text-sm text-zinc-600 space-y-1.5">
              <li>· The paper introduces a new attention mechanism reducing compute by 40%</li>
              <li>· Results on MMLU show 3.2% improvement over baseline</li>
              <li>· Authors release code and weights under MIT license</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-[#DDE5FF]">
              <p className="text-sm font-bold text-zinc-800 mb-2">Follow-up questions:</p>
              <ol className="text-sm text-zinc-500 space-y-1">
                <li>1. How does this scale to 100B+ parameter models?</li>
                <li>2. What are the trade-offs at inference time?</li>
              </ol>
            </div>
          </div>
        </div>
      </InfoCard>

      <div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">BENCHMARK SCORES</p>
        <div className="grid grid-cols-4 gap-4">
          <Benchmark score="87.2" label="MMLU" />
          <Benchmark score="90.2" label="HumanEval" />
          <Benchmark score="76.6" label="MATH" />
          <Benchmark score={`${model.rating?.toFixed(1) ?? '4.7'} ⭐`} label="Rating" />
        </div>
      </div>
    </div>
  );
}

/* ─── HOW TO USE TAB ─── */
function HowToUseTab({ model }: { model: AiModel }) {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 mb-1">How to Use This Model</h2>
        <p className="text-zinc-500 text-sm">
          Follow these steps to integrate and start getting value from this model in minutes.
        </p>
      </div>

      <div className="space-y-8">
        <Step num={1} title="Get API Access"
          desc="Sign up for a NexusAI account (free). Navigate to Settings → API Keys and create a new key. Your key grants access to all models in the marketplace — no separate accounts needed."
        />
        <Step num={2} title="Choose your integration method"
          desc="Options: (a) NexusAI REST API — simple HTTP requests from any language, (b) Official SDK — Python, Node.js, Go packages available, (c) No-code — use the built-in Playground or connect via Zapier / Make."
        >
          <div className="mt-3 bg-[#F5F6F7] border border-zinc-200 rounded-xl p-4 font-mono text-[12px] leading-relaxed">
            <div className="flex items-center justify-between mb-3">
              <p className="text-zinc-400 text-[9px] uppercase font-bold tracking-widest">Quick Start (Python)</p>
              <button className="px-2 py-1 bg-white border border-zinc-200 rounded text-[10px] font-semibold flex items-center gap-1.5 hover:bg-zinc-50">
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <p><span className="text-blue-600">import</span> nexusai</p>
            <p>client = nexusai.Client(api_key=<span className="text-amber-600">&quot;YOUR_KEY&quot;</span>)</p>
            <p>response = client.chat(</p>
            <p className="pl-4">model=<span className="text-amber-600">&quot;{model.id ?? 'gpt-4o'}&quot;</span>,</p>
            <p className="pl-4">messages=[&#123;<span className="text-amber-600">&quot;role&quot;</span>:<span className="text-amber-600">&quot;user&quot;</span>, <span className="text-amber-600">&quot;content&quot;</span>:<span className="text-amber-600">&quot;Hello!&quot;</span>&#125;]</p>
            <p>)</p>
            <p><span className="text-blue-600">print</span>(response.content)</p>
          </div>
        </Step>
        <Step num={3} title="Understand input and output formats"
          desc={`This model accepts text, images, and PDFs as input. Outputs are text and structured JSON. The context window is ${((model.contextWindow ?? 128000) / 1000).toFixed(0)}K tokens — roughly ${Math.round((model.contextWindow ?? 128000) * 0.75 / 1000)}K words. For long documents, consider chunking content into sections.`}
        />
        <Step num={4} title="Set parameters for your use case"
          desc="Key parameters: temperature (0 = deterministic, 1 = creative), max_tokens (controls output length), system (sets model persona and behaviour). Start with temperature 0.3–0.7 for most applications."
        />
        <Step num={5} title="Test in the Playground first"
          desc="Before writing code, iterate on your prompt in the built-in Playground. Test edge cases, adjust tone and format, then copy the final prompt into your integration."
        >
          <button className="mt-3 px-6 py-2.5 bg-[#C06020] text-white rounded-full font-semibold text-sm hover:bg-[#A85018] transition-all flex items-center gap-2">
            Open Playground →
          </button>
        </Step>
      </div>

      <div className="bg-[#EBF8F4] border border-[#C2E0D6] p-4 rounded-xl">
        <p className="text-sm text-[#1E6B4A] leading-relaxed">
          <span className="font-bold text-[#145034]">Pro tip:</span> Start with a small free-tier experiment. Build a minimal working version, measure quality and latency, then scale. Most production apps iterate through 3–5 prompt versions before going live.
        </p>
      </div>
    </div>
  );
}

/* ─── PRICING TAB ─── */
function PricingTab({ model }: { model: AiModel }) {
  const inputPrice = model.pricePer1k ? (model.pricePer1k * 5).toFixed(2) : '5.00';
  const outputPrice = model.pricePer1k ? (model.pricePer1k * 15).toFixed(2) : '15.00';

  return (
    <div className="space-y-8">
      <p className="text-zinc-500 text-sm">
        Choose the plan that fits your usage. All plans include API access, documentation, and community support.
      </p>
      <div className="grid grid-cols-3 gap-6 items-start">
        <PriceCard
          type="PAY-PER-USE"
          price={`$${inputPrice}`}
          unit="per 1M input tokens"
          features={[
            'No monthly commitment',
            `$${outputPrice} per 1M output tokens`,
            `${((model.contextWindow ?? 128000) / 1000).toFixed(0)}K context window`,
            'Rate: 500 RPM',
            'Standard support',
          ]}
        />
        <PriceCard
          type="PRO SUBSCRIPTION"
          price="$49"
          unit="per month"
          popular
          features={[
            `$${(parseFloat(inputPrice) * 0.6).toFixed(2)} per 1M input tokens`,
            `$${(parseFloat(outputPrice) * 0.6).toFixed(2)} per 1M output tokens`,
            `${((model.contextWindow ?? 128000) / 1000).toFixed(0)}K context window`,
            'Rate: 3,000 RPM',
            'Priority support',
            'Usage dashboard',
          ]}
        />
        <PriceCard
          type="ENTERPRISE"
          price="Custom"
          unit="negotiated pricing"
          features={[
            'Volume discounts',
            'Dedicated capacity',
            'Fine-tuning access',
            'Unlimited RPM',
            'SLA & compliance',
            'Dedicated CSM',
          ]}
        />
      </div>
      <div className="bg-[#EEF4FF] border border-[#D6E4FF] p-5 rounded-xl">
        <p className="text-sm text-[#1E3FA0] leading-relaxed">
          <span className="font-bold text-blue-900">Free tier available:</span> Get 100K tokens/month at no cost. Perfect for prototyping and exploration. No credit card required to get started.
        </p>
      </div>
    </div>
  );
}

/* ─── PROMPT GUIDE TAB ─── */
function PromptGuideTab({ model }: { model: AiModel }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 mb-1">Prompt Engineering for {model.name}</h2>
        <p className="text-zinc-500 text-sm">
          Well-crafted prompts dramatically improve model output quality. Follow these principles to get the best results every time.
        </p>
      </div>
      <div className="space-y-4">
        <PromptPrinciple num={1} title="BE EXPLICIT ABOUT FORMAT"
          code={`Summarize the following text in exactly 3 bullet points.\nEach bullet should be one sentence, under 20 words.\nText: {your_text_here}`}
        />
        <PromptPrinciple num={2} title="ASSIGN A ROLE"
          code={`You are a senior software engineer specializing in Python.\nReview the following code for bugs, performance issues,\nand style violations. Be concise and actionable.\n\nCode: {your_code_here}`}
        />
        <PromptPrinciple num={3} title="CHAIN-OF-THOUGHT FOR COMPLEX TASKS"
          code={`Solve this step by step, showing your reasoning at each stage.\nProblem: {your_problem_here}\n\nThink through: assumptions → approach → calculation → answer`}
        />
        <PromptPrinciple num={4} title="FEW-SHOT EXAMPLES"
          code={`Classify customer sentiment. Examples:\nInput: "Shipping was fast!" → Output: positive\nInput: "Product broke after a day." → Output: negative\nInput: "It's okay, nothing special." → Output: neutral\n\nNow classify: "{new_review_here}"`}
        />
      </div>
      <div className="bg-[#FFFBEB] border border-[#FEF3C7] p-5 rounded-xl">
        <p className="text-sm text-[#92400E] leading-relaxed">
          <span className="font-bold text-amber-900">Pro tips:</span> Always specify the desired output length. Use delimiters like triple backticks to separate instructions from content. For JSON output, include a sample structure in the prompt.
        </p>
      </div>
    </div>
  );
}

/* ─── AGENT CREATION TAB ─── */
function AgentCreationTab() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 mb-1">Create an Agent with GPT-4o</h2>
        <p className="text-zinc-500 text-sm">Follow these steps to build a powerful AI agent in under 10 minutes.</p>
      </div>
      <div className="space-y-7">
        <Step num={1} title="Define your agent's purpose"
          desc='Clearly state what your agent should do. Example: "A customer support agent that answers product questions, escalates billing issues, and creates Jira tickets for bugs."'
        />
        <Step num={2} title="Write the system prompt"
          desc="The system prompt defines the agent's persona, scope, and behaviour. Be explicit about what the agent should and shouldn't do. Include tone, response length, and escalation rules."
        />
        <Step num={3} title="Connect tools & APIs"
          desc="Equip your agent with tools: web search, database lookup, email sender, calendar API, Slack webhook. GPT-4o supports function calling — define your tools in JSON schema format."
        />
        <Step num={4} title="Set up memory"
          desc="Configure short-term (conversation history) and long-term memory (vector store). This lets the agent remember user preferences and important context across sessions."
        />
        <Step num={5} title="Test & iterate"
          desc="Run the agent through 20+ test scenarios covering edge cases. Refine the system prompt based on failures. Use our Agent Playground to debug and tune before deployment."
        />
        <Step num={6} title="Deploy & monitor"
          desc="Get a shareable endpoint or embed widget. Monitor performance in the NexusAI dashboard — track response quality, latency, token usage, and user satisfaction scores in real time."
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button className="px-6 py-2.5 bg-[#C06020] text-white rounded-full font-semibold text-sm hover:bg-[#A85018] transition-all">
          Open Agent Builder →
        </button>
        <button className="px-6 py-2.5 border border-zinc-200 rounded-full font-semibold text-sm hover:bg-zinc-50 transition-all text-zinc-600">
          Ask the Hub
        </button>
      </div>
    </div>
  );
}

/* ─── REVIEWS TAB ─── */
function ReviewsTab({ model }: { model: AiModel }) {
  const rating = model.rating ?? 4.7;
  const reviewCount = model.reviewCount ?? 2847;

  const bars = [
    { stars: 5, pct: 72 },
    { stars: 4, pct: 20 },
    { stars: 3, pct: 6 },
    { stars: '1-2', pct: 2 },
  ];

  const reviews = model.reviews ?? [
    { name: 'Sarah K.', role: 'ML Engineer at Stripe', date: 'Mar 2025', stars: 5, text: 'GPT-4o has transformed our document processing pipeline. The vision capabilities are remarkably accurate — it handles complex financial statements and extracts structured data with minimal post-processing. Latency is excellent for our use case.' },
    { name: 'Tariq M.', role: 'Founder, EdTech Startup', date: 'Feb 2025', stars: 4, text: 'Impressive reasoning and creative capabilities. We use it for personalised learning content and student feedback. The main downside is cost at scale — the Pro subscription helps but enterprise pricing is where it becomes truly cost-effective.' },
    { name: 'Priya N.', role: 'Senior Developer at Shopify', date: 'Feb 2025', stars: 5, text: "Best coding model we've used. Code review, refactoring suggestions, and debugging explanations are outstanding. The function calling is reliable and JSON mode outputs are always well-structured. Highly recommend for developer tooling." },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white border border-zinc-200 rounded-xl p-6 flex items-center gap-12">
        <div className="text-center shrink-0">
          <div className="text-5xl font-black text-zinc-900">{rating.toFixed(1)}</div>
          <div className="flex justify-center text-amber-400 my-1.5 gap-0.5">
            {[1, 2, 3, 4].map((i) => <Star key={i} size={16} fill="currentColor" />)}
            <Star size={16} className="opacity-30" />
          </div>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{reviewCount.toLocaleString()} reviews</p>
        </div>
        <div className="flex-1 space-y-2">
          {bars.map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-zinc-400 w-4 text-right">{row.stars}</span>
              <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div style={{ width: `${row.pct}%` }} className="h-full bg-amber-400 rounded-full" />
              </div>
              <span className="text-[10px] font-bold text-zinc-400 w-8">{row.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {reviews.map((r: any, i: number) => (
          <div key={i} className="space-y-3 pb-8 border-b border-zinc-100 last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 text-sm">{r.name}</span>
                <span className="text-zinc-400 text-xs">{r.role}</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: r.stars }).map((_: any, j: number) => (
                  <Star key={j} size={13} fill="#F59E0B" className="text-amber-400" />
                ))}
                {Array.from({ length: 5 - r.stars }).map((_: any, j: number) => (
                  <Star key={j} size={13} className="text-zinc-200" />
                ))}
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest ml-2">{r.date}</span>
              </div>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SHARED SUB-COMPONENTS ─── */

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
      <h3 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Benchmark({ score, label }: { score: string; label: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-200 text-center shadow-sm">
      <div className="text-xl font-black text-zinc-900 mb-1">{score}</div>
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function Step({
  num, title, desc, children,
}: {
  num: number; title: string; desc: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <div className="w-8 h-8 rounded-full bg-[#FFF3EE] border border-[#FFD9C7] flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[#C06020] font-bold text-sm">{num}</span>
      </div>
      <div>
        <h4 className="text-base font-bold text-zinc-900 mb-1">{title}</h4>
        <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
        {children}
      </div>
    </div>
  );
}

function PriceCard({
  type, price, unit, features, popular,
}: {
  type: string; price: string; unit: string; features: string[]; popular?: boolean;
}) {
  return (
    <div className={`p-6 rounded-2xl border-2 bg-white flex flex-col relative ${popular ? 'border-[#C06020] shadow-lg scale-[1.03] z-10' : 'border-zinc-200 shadow-sm'}`}>
      {popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C06020] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow whitespace-nowrap">
          Most Popular
        </div>
      )}
      <h4 className="text-[10px] font-bold text-zinc-400 text-center uppercase tracking-widest mb-5">{type}</h4>
      <div className="text-4xl font-black text-zinc-900 text-center mb-1">{price}</div>
      <p className="text-zinc-400 text-[11px] font-medium text-center mb-7">{unit}</p>
      <div className="space-y-3 flex-1">
        {features.map((f) => (
          <div key={f} className="flex items-center gap-2.5 text-zinc-500 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D8A5B] shrink-0" />
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

function PromptPrinciple({ num, title, code }: { num: number; title: string; code: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">
          Principle {num} — {title}
        </h3>
        <button className="p-1.5 bg-zinc-50 border border-zinc-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-zinc-400 hover:text-zinc-600">
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="bg-[#EFF3FF] border border-[#DDE5FF] rounded-lg p-4 font-mono text-xs text-blue-800 leading-relaxed whitespace-pre-wrap">
        {code}
      </div>
    </div>
  );
}