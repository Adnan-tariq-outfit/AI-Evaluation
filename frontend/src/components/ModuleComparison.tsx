"use client";

import React from "react";
import {
  Check,
  X,
  Zap,
  Brain,
  Crown,
  Sparkles,
  Lightbulb,
  Terminal,
  Monitor,
  Clover,
  Building2,
  Cloud,
  Circle,
  Moon,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// Data matching the provided image
const comparisonData = [
  {
    model: "GPT-5.4",
    lab: "OpenAI",
    context: "1.05M",
    input: "$2.50",
    output: "$15",
    multimodal: true,
    speed: "Fast",
    bestFor: "High-precision professional tasks",
    icon: <Brain className="text-pink-500 w-4 h-4" />,
  },
  {
    model: "Claude Opus 4.6",
    lab: "Anthropic",
    context: "200K/1M β",
    input: "$5",
    output: "$25",
    multimodal: true,
    speed: "Moderate",
    bestFor: "Agents, advanced coding",
    icon: <Crown className="text-orange-400 w-4 h-4" />,
  },
  {
    model: "Claude Sonnet 4.6",
    lab: "Anthropic",
    context: "200K/1M β",
    input: "$3",
    output: "$15",
    multimodal: true,
    speed: "Fast",
    bestFor: "Code, data, content at scale",
    icon: <Zap className="text-orange-500 w-4 h-4" />,
  },
  {
    model: "Claude Haiku 4.5",
    lab: "Anthropic",
    context: "200K",
    input: "$1",
    output: "$5",
    multimodal: true,
    speed: "Fastest",
    bestFor: "Real-time, high-volume",
    icon: <Zap className="text-pink-400 w-4 h-4" />,
  },
  {
    model: "Gemini 3.1 Pro",
    lab: "Google",
    context: "2M-5M",
    input: "$2",
    output: "$12",
    multimodal: true,
    speed: "Moderate",
    bestFor: "Deep reasoning, long context",
    icon: <Sparkles className="text-blue-400 w-4 h-4" />,
  },
  {
    model: "Gemini 3 Flash",
    lab: "Google",
    context: "1M",
    input: "$2",
    output: "$12",
    multimodal: true,
    speed: "Moderate",
    bestFor: "High-volume chat & coding",
    icon: <Zap className="text-orange-400 w-4 h-4" />,
  },
  {
    model: "Gemini 3.1 Flash-Lite",
    lab: "Google",
    context: "1M",
    input: "$0.10",
    output: "$0.40",
    multimodal: true,
    speed: "Fastest",
    bestFor: "Low-cost agents, translation",
    icon: <Lightbulb className="text-yellow-400 w-4 h-4" />,
  },
  {
    model: "Grok-4-1 Fast",
    lab: "xAI",
    context: "2000K",
    input: "$0.20",
    output: "$0.50",
    multimodal: true,
    speed: "Moderate",
    bestFor: "Real-time X data analysis",
    icon: <Terminal className="text-zinc-800 w-4 h-4" />,
  },
  {
    model: "DeepSeek-V3",
    lab: "DeepSeek",
    context: "128K",
    input: "~$0.07",
    output: "~$0.28",
    multimodal: true,
    speed: "Moderate",
    bestFor: "Budget general model",
    icon: <Monitor className="text-blue-400 w-4 h-4" />,
  },
  {
    model: "Llama 4 Maverick",
    lab: "Meta",
    context: "128K",
    input: "Free",
    output: "Free",
    multimodal: true,
    speed: "Moderate",
    bestFor: "Open-source multimodal",
    icon: <Clover className="text-pink-300 w-4 h-4" />,
  },
  {
    model: "Qwen3-Max",
    lab: "Alibaba",
    context: "128K",
    input: "$0.40",
    output: "$1.20",
    multimodal: true,
    speed: "Moderate",
    bestFor: "Multilingual / APAC",
    icon: <Building2 className="text-pink-400 w-4 h-4" />,
  },
  {
    model: "Devstral 2",
    lab: "Mistral",
    context: "256K",
    input: "$0.40",
    output: "$2",
    multimodal: true,
    speed: "Fastest",
    bestFor: "Software engineering agents",
    icon: <Cloud className="text-blue-500 w-4 h-4" />,
  },
  {
    model: "Nemotron Ultra 253B",
    lab: "NVIDIA",
    context: "131K",
    input: "$0.60",
    output: "$1.80",
    multimodal: false,
    speed: "Moderate",
    bestFor: "Enterprise reasoning & RAG",
    icon: <Circle className="text-emerald-500 w-4 h-4 fill-emerald-500" />,
  },
  {
    model: "kimi-k2.5",
    lab: "Moonshot",
    context: "262K",
    input: "$0.60",
    output: "$3",
    multimodal: true,
    speed: "Fastest",
    bestFor: "Multi-agent RAG, visual coding",
    icon: <Moon className="text-yellow-400 w-4 h-4" />,
  },
];

export default function ModelComparison() {
  return (
    <section className="bg-transparent py-12 px-12 font-sans">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-bold text-[var(--theme-text)] tracking-tight">
              Flagship Model Comparison
            </h2>
            <p className="text-[var(--theme-text-muted)] text-sm mt-3">
              Side-by-side view of the leading models across all major labs.
              Input/Output prices per 1M tokens.
            </p>
          </div>
          <Link
            href={"/marketplace"}
            className="text-[11px] font-bold theme-link flex items-center hover:underline"
          >
            Compare all <ChevronRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Table Container */}
        <div className="theme-panel rounded-[1.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--theme-border)]">
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest">
                    Model
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest">
                    Lab
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest">
                    Context
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest">
                    Input $/1M
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest">
                    Output $/1M
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest text-center">
                    Multimodal
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest">
                    Speed
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-[var(--theme-text-muted)] uppercase tracking-widest">
                    Best For
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                  >
                    {/* Model Cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                          {row.icon}
                        </div>
                        <span className="text-[13px] font-bold text-zinc-900 whitespace-nowrap">
                          {row.model}
                        </span>
                      </div>
                    </td>

                    {/* Lab Cell */}
                    <td className="px-6 py-4 text-[13px] font-medium text-zinc-400">
                      {row.lab}
                    </td>

                    {/* Context Cell */}
                    <td className="px-6 py-4 text-[13px] font-bold text-blue-600">
                      {row.context}
                    </td>

                    {/* Input Price Cell */}
                    <td
                      className={`px-6 py-4 text-[13px] font-bold ${row.input === "Free" ? "text-emerald-500" : "text-emerald-600"}`}
                    >
                      {row.input}
                    </td>

                    {/* Output Price Cell */}
                    <td
                      className={`px-6 py-4 text-[13px] font-bold ${row.output === "Free" ? "text-emerald-500" : "text-zinc-900"}`}
                    >
                      {row.output}
                    </td>

                    {/* Multimodal Cell */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {row.multimodal ? (
                          <div className="w-5 h-5 bg-[#C6E9D8] text-[#1E634B] rounded flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 bg-[#FEE2E2] text-[#B91C1C] rounded flex items-center justify-center">
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Speed Cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {row.speed === "Fastest" ? (
                          <div className="flex items-center gap-1.5 text-orange-500">
                            <Zap className="w-3.5 h-3.5 fill-orange-500" />
                            <span className="text-[11px] font-bold">
                              {row.speed}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${row.speed === "Fast" ? "bg-emerald-500" : "bg-orange-400"}`}
                            />
                            <span
                              className={`text-[11px] font-bold ${row.speed === "Fast" ? "text-emerald-500" : "text-orange-400"}`}
                            >
                              {row.speed}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Best For Cell */}
                    <td className="px-6 py-4 text-[13px] font-medium text-zinc-500 max-w-xs">
                      {row.bestFor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-4 text-[10px] text-zinc-400 italic">
          * Prices shown are approximate. Free tier limited to specific
          contexts. Rates subject to change.
        </p>
      </div>
    </section>
  );
}
