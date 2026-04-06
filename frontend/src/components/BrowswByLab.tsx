"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Brain,
  Zap,
  Microscope,
  Terminal,
  Monitor,
  Clover,
  Globe,
  Dna,
  Diamond,
  Moon,
} from "lucide-react";

const AI_LABS = [
  {
    name: "OpenAI",
    modelsCount: 3,
    modelsList: "GPT-5.4, Sora 2",
    icon: <Brain className="w-6 h-6 text-pink-500" />,
  },
  {
    name: "Anthropic",
    modelsCount: 3,
    modelsList: "Opus, Sonnet, Haiku",
    icon: <Zap className="w-6 h-6 text-orange-400" />,
  },
  {
    name: "Google DeepMind",
    modelsCount: 5,
    modelsList: "Gemini 3.1, Veo 3",
    icon: <Microscope className="w-6 h-6 text-purple-500" />,
  },
  {
    name: "xAI (Grok)",
    modelsCount: 2,
    modelsList: "Grok-4-1, Grok-Imagine",
    icon: <Terminal className="w-6 h-6 text-zinc-800" />,
  },
  {
    name: "DeepSeek",
    modelsCount: 3,
    modelsList: "V3, V3.2, R1",
    icon: <Monitor className="w-6 h-6 text-blue-400" />,
  },
  {
    name: "Meta (Llama)",
    modelsCount: 2,
    modelsList: "Maverick, Scout",
    icon: <Clover className="w-6 h-6 text-pink-300" />,
  },
  {
    name: "Alibaba (Qwen)",
    modelsCount: 2,
    modelsList: "Qwen3-Max, Coder",
    icon: <Globe className="w-6 h-6 text-red-500" />,
  },
  {
    name: "Mistral",
    modelsCount: 2,
    modelsList: "Devstral 2, Medium 3.1",
    icon: <Dna className="w-6 h-6 text-blue-600" />,
  },
  {
    name: "NVIDIA NIM",
    modelsCount: 4,
    modelsList: "Nemotron Ultra, Nano",
    icon: <Diamond className="w-6 h-6 text-emerald-500" />,
  },
  {
    name: "GLM (Zhipu)",
    modelsCount: 3,
    modelsList: "GLM-5, 4.7, 4.6V",
    icon: <Diamond className="w-6 h-6 text-blue-500" />,
  },
  {
    name: "Moonshot (Kimi)",
    modelsCount: 2,
    modelsList: "k2.5, k2-Thinking",
    icon: <Moon className="w-6 h-6 text-yellow-500" />,
  },
];

export default function BrowseByLab() {
  const router = useRouter();

  const handleNavigation = () => {
    // Navigates to the marketplace
    router.push("/marketplace");
  };

  return (
    <section className="py-12 px-12 sm:px-8 lg:px-12 bg-transparent">
      <div className=" mx-auto">
        {/* Header Row */}
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-[var(--theme-text)] tracking-tight">
            Browse by AI Lab
          </h2>
          <Link
            href="/marketplace"
            className="text-xs font-bold theme-link flex items-center gap-1 hover:underline tracking-tight"
          >
            See all labs <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {AI_LABS.map((lab, index) => (
            <div
              key={index}
              onClick={handleNavigation}
              className="theme-panel rounded-2xl p-5 flex flex-col items-center justify-center text-center h-[180px] cursor-pointer hover:shadow-lg hover:border-[var(--theme-border-strong)] transition-all duration-300 group"
            >
              {/* Icon Container */}
              <div className="mb-5 group-hover:scale-110 transition-transform duration-300">
                {lab.icon}
              </div>

              {/* Lab Name */}
              <h3 className="text-[13px] font-bold text-[var(--theme-text)] mb-1 leading-tight px-1">
                {lab.name}
              </h3>

              {/* Lab Subtext */}
              <p className="text-[10px] font-medium text-[var(--theme-text-muted)] leading-relaxed px-2">
                {lab.modelsCount} models · {lab.modelsList}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
