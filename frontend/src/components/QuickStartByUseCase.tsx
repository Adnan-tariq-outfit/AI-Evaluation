"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Code2,
  Palette,
  Bot,
  FileSearch,
  Clapperboard,
  Volume2,
  Globe2,
  Binary,
  ArrowRight,
} from "lucide-react";

const USE_CASES = [
  {
    title: "Code Generation",
    models: "Claude Opus 4.6, Devstral 2, GPT-5.4, Qwen3-Coder",
    linkText: "Start building",
    icon: <Code2 className="w-5 h-5 text-blue-500" />,
    bgColor: "bg-blue-50",
  },
  {
    title: "Image Generation",
    models: "gpt-image-1.5, Grok-Imagine-Pro, Gemini Flash Image",
    linkText: "Create images",
    icon: <Palette className="w-5 h-5 text-pink-500" />,
    bgColor: "bg-pink-50",
  },
  {
    title: "AI Agents",
    models: "GPT-5.4, Claude Opus 4.6, kimi-k2.5, Grok-4-1",
    linkText: "Build agents",
    icon: <Bot className="w-5 h-5 text-purple-500" />,
    bgColor: "bg-purple-50",
  },
  {
    title: "Document Analysis",
    models: "Claude Sonnet 4.6, Gemini 3.1 Pro, Nemotron Ultra",
    linkText: "Analyse docs",
    icon: <FileSearch className="w-5 h-5 text-indigo-500" />,
    bgColor: "bg-indigo-50",
  },
  {
    title: "Video Generation",
    models: "Sora 2 Pro, Veo 3.1, Grok-Imagine-Video",
    linkText: "Create video",
    icon: <Clapperboard className="w-5 h-5 text-slate-600" />,
    bgColor: "bg-slate-50",
  },
  {
    title: "Voice & Audio",
    models: "Gemini-TTS, ElevenLabs, Whisper v3",
    linkText: "Add voice",
    icon: <Volume2 className="w-5 h-5 text-blue-400" />,
    bgColor: "bg-blue-50/50",
  },
  {
    title: "Multilingual / Translation",
    models: "Qwen3-Max (119 langs), Gemini 3.1 Flash-Lite, GLM-4.7",
    linkText: "Go multilingual",
    icon: <Globe2 className="w-5 h-5 text-emerald-500" />,
    bgColor: "bg-emerald-50",
  },
  {
    title: "Math & Research",
    models: "DeepSeek-R1, QwQ-32B, Gemini 3.1 Pro",
    linkText: "Start researching",
    icon: <Binary className="w-5 h-5 text-blue-600" />,
    bgColor: "bg-blue-50",
  },
];

export default function QuickStartByUseCase() {
  const router = useRouter();

  const handleNavigation = () => {
    router.push("/chat-hub");
  };

  return (
    <section className="py-12 px-12 sm:px-8 lg:px-12 bg-[#F9F9F8] font-sans">
      <div className=" mx-auto">
        {/* Section Header */}
        <h2 className="text-2xl font-bold text-zinc-900 mb-10 tracking-tight">
          Quick-Start by Use Case
        </h2>

        {/* Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {USE_CASES.map((item, index) => (
            <div
              key={index}
              onClick={handleNavigation}
              className="bg-white border border-zinc-200 rounded-[1.5rem] p-6 flex flex-col min-h-[180px] cursor-pointer hover:shadow-lg hover:border-zinc-300 transition-all duration-300 group"
            >
              {/* Icon */}
              <div
                className={`${item.bgColor} w-10 h-10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="text-[13px] font-bold text-zinc-900 mb-2 leading-tight">
                {item.title}
              </h3>

              {/* Models List */}
              <p className="text-[10px] text-zinc-400 leading-relaxed font-medium mb-4 line-clamp-2">
                {item.models}
              </p>

              {/* Footer Link */}
              <div className="mt-auto text-[11px] font-bold text-[#BC6D25] flex items-center gap-1 group-hover:underline">
                {item.linkText}{" "}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
