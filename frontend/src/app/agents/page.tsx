"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";

const templates = [
  {
    title: "Research Agent",
    desc: "Automates web research, summarizes findings, and generates reports.",
    models: ["GPT-4.1", "Web search", "Reports"],
  },
  {
    title: "Customer Support Agent",
    desc: "Handles FAQs and resolves complex issues via multi-conversation context.",
    models: ["GPT-4o", "Ticketing", "Escalation"],
  },
  {
    title: "Code Review Agent",
    desc: "Reviews pull requests for bugs, suggests improvements, and explains changes.",
    models: ["Claude 3.7", "GitLab", "Code"],
  },
  {
    title: "Data Analysis Agent",
    desc: "Processes spreadsheet and chart data to answer questions and produce insights.",
    models: ["Gemini", "Spreadsheets", "Charts"],
  },
  {
    title: "Content Writer Agent",
    desc: "Creates blog posts, social content, and marketing copy with consistent brand voice.",
    models: ["Claude 3.7", "Marketing", "SEO"],
  },
];

export default function AgentsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f5]">
      <Header />
      <main className="flex-1 pt-24 px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 xl:grid-cols-[500px_1fr_500px] gap-4">
          <aside className=" rounded-xl p-4 min-h-[72vh] flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-zinc-900 leading-tight">
                Agent Builder
              </h1>
              <p className="text-sm text-zinc-500 mt-2">
                Create powerful AI agents using any model. Pick a template or
                start from scratch.
              </p>
            </div>
            <button
              onClick={() => router.push("/marketplace")}
              className="self-start mb-70 px-4 py-2 rounded-full text-white text-sm font-medium shadow bg-[#84B179]"
            >
              + New Agent
            </button>
          </aside>

          <section className="bg-white border border-zinc-200 rounded-xl min-h-[72vh] p-4 flex items-center ">
            <div className=" rounded-xl  p-5">
              <p className="text-sm font-semibold text-zinc-800">
                Not sure where to start?
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Chat with our AI guide - describe what you want your agent to do
                and get a personalized setup plan.
              </p>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => router.push("/chat-hub")}
                className="px-3 py-1.5 text-xs text-black rounded-full border border-zinc-300 "
              >
                Ask the Hub →
              </button>
            </div>
          </section>

          <aside className=" rounded-xl p-3 min-h-[72vh]">
            <p className="text-xs font-semibold text-zinc-500 mb-3">
              AGENT TEMPLATES
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3">
              {templates.map((t) => (
                <div
                  key={t.title}
                  className="border border-zinc-200 py-6 rounded-xl p-3 bg-white hover:shadow-sm transition-shadow"
                >
                  <h3 className="text-sm font-semibold py-2 text-zinc-900">
                    {t.title}
                  </h3>
                  <p className="text-xs text-zinc-500 py-2 line-clamp-3">
                    {t.desc}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.models.map((m) => (
                      <span
                        key={m}
                        className="text-[10px] px-1.5 py-0.5 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <button className="mt-3 text-xs text-zinc-700 hover:text-zinc-900">
                    Use template →
                  </button>
                </div>
              ))}
              <button className="border border-[#eadfd4] bg-[#fcf5ee] rounded-xl p-3 text-zinc-700 min-h-[180px]">
                <div className="text-2xl mb-2">+</div>
                <div className="text-sm font-medium">Build from Scratch</div>
                <p className="text-xs text-zinc-500 mt-1">
                  Start with any model and a blank canvas - full control over
                  every detail.
                </p>
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
