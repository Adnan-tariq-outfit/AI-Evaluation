"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Flame,
  Rocket,
  Monitor,
  Timer,
  Globe,
  Terminal,
} from "lucide-react";

const TRENDING_ITEMS = [
  {
    badge: "Just Released",
    badgeIcon: <Rocket className="w-3 h-3" />,
    badgeColor: "bg-[#EBF7F7] text-[#2D8A8A] border-[#D1EAEA]",
    lab: "Anthropic",
    title: "Claude Opus 4.6 & Sonnet 4.6",
    desc: "Adaptive Thinking and 1M token context (beta) mark a major leap in agent capability. Now the most intelligent Claude for coding and agentic tasks.",
  },
  {
    badge: "Hot",
    badgeIcon: <Flame className="w-3 h-3" />,
    badgeColor: "bg-[#FFF8F1] text-[#E5733C] border-[#FEE2D5]",
    lab: "Google DeepMind",
    title: "Gemini 3.1 Pro — Thought Signatures",
    desc: "Thought Signatures bring new transparency to deep reasoning. 5M context window makes it the go-to for ultra-long document analysis.",
  },
  {
    badge: "Computer Use",
    badgeIcon: <Monitor className="w-3 h-3" />,
    badgeColor: "bg-[#F1F4FF] text-[#4F46E5] border-[#E0E7FF]",
    lab: "OpenAI",
    title: "GPT-5.4 — Native Computer-Use Agents",
    desc: "GPT-5.4 introduces native computer-use agents, letting it operate browsers, apps, and files autonomously with improved reasoning efficiency.",
  },
  {
    badge: "Real-Time",
    badgeIcon: <Timer className="w-3 h-3" />,
    badgeColor: "bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]",
    lab: "xAI",
    title: "Grok-4-1 Fast — 4-Agent Architecture",
    desc: "Grok's 4-agent architecture with real-time X (Twitter) data access and 2M context makes it unique for real-time analysis tasks.",
  },
  {
    badge: "Open Source",
    badgeIcon: <Globe className="w-3 h-3" />,
    badgeColor: "bg-[#F0F9FF] text-[#0369A1] border-[#E0F2FE]",
    lab: "Meta",
    title: "Llama 4 Maverick — 400B MoE",
    desc: "Meta's 400B Mixture-of-Experts model with native multimodal understanding. Free to self-host with a full commercial licence.",
  },
  {
    badge: "Coding",
    badgeIcon: <Terminal className="w-3 h-3" />,
    badgeColor: "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]",
    lab: "Mistral",
    title: "Devstral 2 — Fastest Coding Agent",
    desc: "Mistral's coding agent with 256K context, multi-file edits, and codebase navigation. The fastest software engineering model available.",
  },
];

export default function TrendingThisWeek() {
  const router = useRouter();

  const handleNavigation = () => {
    router.push("/chat-hub");
  };

  return (
    <section className="py-12 px-12 sm:px-8 lg:px-12 bg-white font-sans">
      <div className=" mx-auto">
        {/* Header Row */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">
              Trending This Week
            </h2>
          </div>
          <button
            onClick={() => router.push("/discover-new")}
            className="text-[11px] font-bold text-[#BC6D25] flex items-center gap-1 hover:underline tracking-tight"
          >
            View research feed <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Horizontal Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {TRENDING_ITEMS.map((item, index) => (
            <div
              key={index}
              onClick={handleNavigation}
              className="bg-white border border-zinc-100 rounded-[2rem] p-7 flex flex-col min-h-[320px] cursor-pointer hover:shadow-xl hover:border-zinc-200 transition-all duration-500 group relative"
            >
              {/* Badge & Lab Name */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tighter ${item.badgeColor}`}
                >
                  {item.badgeIcon}
                  {item.badge}
                </div>
                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest whitespace-nowrap">
                  {item.lab}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[15px] font-bold text-zinc-900 mb-4 leading-tight group-hover:text-[#BC6D25] transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-[12px] text-zinc-400 leading-relaxed font-medium">
                {item.desc}
              </p>

              {/* Subtle hover indicator */}
              <div className="mt-auto pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold text-[#BC6D25] flex items-center gap-1">
                  Try in Chat Hub <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
