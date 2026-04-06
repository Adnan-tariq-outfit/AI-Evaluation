"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Banknote, Scale, Trophy } from "lucide-react";

const BUDGET_DATA = [
  {
    title: "Free & Open Source",
    desc: "Llama 4 Maverick, Llama 4 Scout, DeepSeek-V3, DeepSeek-R1 — self-host with zero API cost.",
    count: "6 models available",
    icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
    bgColor: "bg-[#E6F4F1]",
    borderColor: "border-[#D1EAEA]",
    textColor: "text-[#1E634B]",
    iconWrapper: "bg-white",
  },
  {
    title: "Budget — Under $0.50/1M",
    desc: "Gemini 3.1 Flash-Lite, Mistral Medium, Nemotron Nano — best performance per dollar.",
    count: "9 models available",
    icon: <Banknote className="w-5 h-5 text-emerald-500" />,
    bgColor: "bg-[#EFF3FF]",
    borderColor: "border-[#E0E7FF]",
    textColor: "text-[#1E40AF]",
    iconWrapper: "bg-white",
  },
  {
    title: "Mid-Range — $1-$5/1M",
    desc: "Claude Sonnet 4.6, Claude Haiku 4.5, Gemini 3.1 Pro, GPT-5.4, Qwen3-Max.",
    count: "11 models available",
    icon: <Scale className="w-5 h-5 text-amber-500" />,
    bgColor: "bg-[#FEF9E7]",
    borderColor: "border-[#FEF3C7]",
    textColor: "text-[#92400E]",
    iconWrapper: "bg-white",
  },
  {
    title: "Premium — $5+/1M",
    desc: "Claude Opus 4.6, Sora 2 Pro, gpt-image-1.5 — top-tier quality for demanding workloads.",
    count: "5 models available",
    icon: <Trophy className="w-5 h-5 text-orange-500" />,
    bgColor: "bg-[#FFF5F1]",
    borderColor: "border-[#FEE2D5]",
    textColor: "text-[#991B1B]",
    iconWrapper: "bg-white",
  },
];

export default function FindModelsByBudget() {
  const router = useRouter();

  const handleNavigation = () => {
    router.push("/marketplace");
  };

  return (
    <section className="py-12 px-12 sm:px-8 lg:px-12 bg-transparent font-sans">
      <div className=" mx-auto">
        {/* Section Header */}
        <h2 className="text-3xl font-bold text-[var(--theme-text)] mb-10 tracking-tight">
          Find Models by Budget
        </h2>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {BUDGET_DATA.map((card, index) => (
            <div
              key={index}
              onClick={handleNavigation}
              className="theme-panel rounded-[2rem] p-8 flex flex-col h-full cursor-pointer hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group"
            >
              {/* Icon Container */}
              <div
                className={`${card.iconWrapper} w-10 h-10 rounded-xl flex items-center justify-center mb-6 shadow-sm`}
              >
                {card.icon}
              </div>

              {/* Title */}
              <h3 className="text-[15px] font-bold text-[var(--theme-text)] mb-3 leading-tight">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-[12px] text-[var(--theme-text-muted)] leading-relaxed font-medium mb-6 flex-grow">
                {card.desc}
              </p>

              {/* Footer Link */}
              <div className="mt-auto text-[11px] font-black flex items-center gap-1.5 text-[var(--theme-accent-hover)] tracking-tight group-hover:underline">
                {card.count}{" "}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
