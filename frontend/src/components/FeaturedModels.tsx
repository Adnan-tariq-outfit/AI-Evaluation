"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Brain,
  Zap,
  Sparkles,
  Lightbulb,
  Sun,
  Diamond,
  Flower2,
  Star,
  ArrowRight,
} from "lucide-react";

interface ModelCardProps {
  id: string;
  name: string;
  provider: string;
  description: string;
  tags: string[];
  rating: number;
  reviews: string;
  price: string;
  badge?: "Hot" | "New";
  icon: React.ReactNode;
  iconBg: string;
}

const featuredModels: ModelCardProps[] = [
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    badge: "Hot",
    description:
      "OpenAI flagship. Native computer-use agents, advanced reasoning, 2M context.",
    tags: ["Flagship", "Agents", "Multimodal"],
    rating: 4.9,
    reviews: "4,210",
    price: "$7.50/1M tk",
    icon: <Brain className="w-5 h-5 text-pink-500" />,
    iconBg: "bg-pink-50",
  },
  {
    id: "gpt-5.2",
    name: "GPT-5.2",
    provider: "OpenAI",
    badge: "New",
    description:
      "Mid-tier GPT-5 variant with improved instruction-following and multimodal support.",
    tags: ["Multimodal", "Balanced", "Instruction"],
    rating: 4.8,
    reviews: "2,180",
    price: "$4/1M tk",
    icon: <Brain className="w-5 h-5 text-pink-500" />,
    iconBg: "bg-pink-50",
  },
  {
    id: "gpt-5-turbo",
    name: "GPT-5 Turbo",
    provider: "OpenAI",
    badge: "Hot",
    description: "Fast, cost-effective GPT-5 for high-volume deployments.",
    tags: ["Fast", "Cost-Effective", "High-Volume"],
    rating: 4.8,
    reviews: "3,560",
    price: "$2.50/1M tk",
    icon: <Zap className="w-5 h-5 text-orange-500" />,
    iconBg: "bg-orange-50",
  },
  {
    id: "gpt-4.5",
    name: "GPT-4.5",
    provider: "OpenAI",
    description:
      "Bridging model with improved creativity and long-form generation.",
    tags: ["Creative", "Long-form", "Language"],
    rating: 4.7,
    reviews: "1,980",
    price: "$3/1M tk",
    icon: <Sparkles className="w-5 h-5 text-purple-600" />,
    iconBg: "bg-purple-50",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    description:
      "Optimized for coding and instruction-following with 128K context.",
    tags: ["Code", "Instructions", "128K"],
    rating: 4.7,
    reviews: "2,310",
    price: "$2/1M tk",
    icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
    iconBg: "bg-yellow-50",
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1-mini",
    provider: "OpenAI",
    description: "Lightweight GPT-4.1 for fast, affordable everyday tasks.",
    tags: ["Fast", "Affordable", "Everyday"],
    rating: 4.5,
    reviews: "1,870",
    price: "$0.40/1M tk",
    icon: <Zap className="w-5 h-5 text-orange-500" />,
    iconBg: "bg-orange-50",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description:
      "Multimodal flagship combining text, vision, and audio in one unified model.",
    tags: ["Multimodal", "Vision", "Audio"],
    rating: 4.7,
    reviews: "5,120",
    price: "$2.50/1M tk",
    icon: <Sun className="w-5 h-5 text-yellow-500" />,
    iconBg: "bg-yellow-50",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o-mini",
    provider: "OpenAI",
    description:
      "Affordable, fast GPT-4o for lightweight chat and classification tasks.",
    tags: ["Fast", "Budget", "Chat"],
    rating: 4.5,
    reviews: "4,380",
    price: "$0.15/1M tk",
    icon: <Diamond className="w-5 h-5 text-blue-500" />,
    iconBg: "bg-blue-50",
  },
  {
    id: "o3",
    name: "o3",
    provider: "OpenAI",
    badge: "Hot",
    description:
      "OpenAI's advanced reasoning model with chain-of-thought for complex tasks.",
    tags: ["Reasoning", "Math", "Science"],
    rating: 4.8,
    reviews: "1,640",
    price: "$15/1M tk",
    icon: <Flower2 className="w-5 h-5 text-green-500" />,
    iconBg: "bg-green-50",
  },
];

export default function FeaturedModels() {
  const router = useRouter();

  const handleCardClick = (id: string) => {
    // Navigates to marketplace with specific model selected
    router.push(`/chat-hub`);
  };

  return (
    <section className="py-12 px-12 bg-[#f9f9f8]">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-zinc-900">Featured Models</h2>
          <Link
            href="/marketplace"
            className="text-xs font-bold text-[#BC6D25] flex items-center gap-1 hover:underline tracking-tight"
          >
            Browse all 525 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {featuredModels.map((model) => (
            <div
              key={model.id}
              onClick={() => handleCardClick(model.id)}
              className="bg-white border border-zinc-200 rounded-3xl p-5 flex flex-col justify-between hover:shadow-lg hover:border-zinc-300 transition-all cursor-pointer group relative"
            >
              {/* Top Row: Icon and Badge */}
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${model.iconBg}`}
                >
                  {model.icon}
                </div>
                {model.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      model.badge === "Hot"
                        ? "bg-orange-50 text-orange-600 border-orange-100"
                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}
                  >
                    {model.badge}
                  </span>
                )}
              </div>

              {/* Title & Provider */}
              <div className="mb-3">
                <h3 className="text-sm font-bold text-zinc-900">
                  {model.name}
                </h3>
                <p className="text-[10px] font-medium text-zinc-400">
                  {model.provider}
                </p>
              </div>

              {/* Description */}
              <p className="text-[11px] text-zinc-500 leading-relaxed mb-4 line-clamp-3">
                {model.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {model.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer: Rating, Price, Try */}
              <div className="pt-4 border-t border-zinc-50">
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex gap-0.5">
                    {[...Array(4)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-2.5 h-2.5 fill-orange-400 text-orange-400"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400">
                    {model.rating} ({model.reviews})
                  </span>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <span className="text-[11px] font-bold text-[#1E634B]">
                    {model.price}
                  </span>
                  <span className="text-[10px] font-bold text-[#BC6D25] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Try <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
