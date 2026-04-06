"use client";

import React from "react";
import { useRouter } from "next/navigation";

// Define the data for the cards to keep the JSX clean
const builderFeatures = [
  {
    emoji: "🧭",
    title: "Guided Discovery Chat",
    description:
      "I'll greet you, ask about your goals, and have a genuine conversation before recommending models. No overwhelming lists.",
  },
  {
    emoji: "📐",
    title: "Prompt Engineering Guide",
    description:
      "Every model includes tailored prompt templates, principles, and examples so you get the best output from day one.",
  },
  {
    emoji: "🤖",
    title: "Agent Builder",
    description:
      "Step-by-step agent creation guides for every model — system prompts, tool configuration, memory setup, deployment.",
  },
  {
    emoji: "💰",
    title: "Flexible Pricing",
    description:
      "Free tiers, pay-per-use, subscriptions, and enterprise plans. Transparent pricing with no hidden fees.",
  },
  {
    emoji: "⭐",
    title: "User Reviews & Ratings",
    description:
      "Verified reviews from real builders, benchmark scores, and detailed I/O specs to help you choose confidently.",
  },
  {
    emoji: "🔬",
    title: "Research Feed",
    description:
      "Daily curated AI research, model releases, and breakthroughs from top labs — stay ahead of the curve.",
  },
];

export default function BuilderFeatures() {
  const router = useRouter();

  const handleNavigation = () => {
    // Navigates to the marketplace URL
    router.push("/marketplace");
  };

  return (
    <section className="py-16 px-12 sm:px-8 lg:px-12 bg-transparent">
      <div className="mx-auto">
        {/* Section Header */}
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--theme-text)] mb-10 tracking-tight">
          Built for every builder
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {builderFeatures.map((feature, index) => (
            <div
              key={index}
              onClick={handleNavigation}
              className="theme-panel rounded-[1.5rem] p-7 flex flex-col h-full cursor-pointer hover:shadow-lg hover:border-[var(--theme-border-strong)] transition-all duration-300 group"
            >
              {/* Emoji Icon */}
              <div className="text-2xl mb-5 group-hover:scale-110 transition-transform origin-left">
                {feature.emoji}
              </div>

              {/* Title */}
              <h3 className="text-[15px] font-bold text-[var(--theme-text)] mb-3 leading-tight">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-[13px] text-[var(--theme-text-muted)] leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
