"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import { ModelService } from "../../services/model.service";
import { ChatService } from "../../services/chat.service";
import { AiModel } from "../../types/model.types";
import { ChatMessage } from "../../types/chat.types";
import { useRouter } from "next/navigation";

const TAB_DATA: Record<string, string[]> = {
  "Use cases": [
    "Help me find the best AI model for my project",
    "I want to build an AI chatbot for my website",
    "Generate realistic images for my marketing campaign",
    "Analyze documents and extract key information",
    "Create AI agents for workflow automation",
    "Add voice and speech recognition to my app",
  ],
  "Monitor the situation": [
    "Track real-time sentiment on social media",
    "Monitor server logs for security anomalies",
    "Analyze stock market trends for specific sectors",
    "Get alerts for mentions of my brand name online",
  ],
  "Create a prototype": [
    "Draft a React component for a dashboard",
    "Write a Python script for a basic CRUD API",
    "Design a database schema for an e-commerce app",
  ],
  "Build a business plan": [
    "Generate a SWOT analysis for a SaaS startup",
    "Draft a 12-month marketing strategy",
    "Calculate projected revenue based on user growth",
  ],
  "Analyze & research": [
    "Summarize this scientific research paper",
    "Compare features of top 5 CRM software",
    "Explain implications of recent AI regulations",
  ],
  "Learn something": [
    "Teach me prompt engineering basics",
    "Explain vector databases in simple terms",
    "How does RAG work in production systems?",
  ],
};

export default function ChatHubPage() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? "";
  const [models, setModels] = useState<AiModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [input, setInput] = useState(initialPrompt);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState("Use cases");
  const router = useRouter();

  useEffect(() => {
    const loadModels = async () => {
      const result = await ModelService.getModels();
      setModels(result.data);
      if (result.data.length > 0) {
        setSelectedModelId(result.data[0]._id);
      }
    };
    loadModels();
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    const result = await ChatService.simulate(
      userMessage.content,
      selectedModelId || undefined,
    );
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: result.reply,
      timestamp: result.timestamp,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setSending(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const filteredModels = models.filter((m) =>
    `${m.name} ${m.provider}`.toLowerCase().includes(modelSearch.toLowerCase()),
  );

  return (
    <div className="h-[100dvh] flex flex-col bg-[#f9f9f8] overflow-hidden">
      <Header />
      <main className="flex-1 mt-20 px-3 sm:px-4 lg:px-6 pb-3 overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-[270px_1fr_270px] gap-4 h-full min-h-0">
          <aside className="bg-white border h-full min-h-0 border-zinc-200 rounded-xl p-3 overflow-hidden">
            <p className="text-xs font-semibold text-zinc-500 mb-2">MODELS</p>
            <input
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder={`Search ${models.length} models...`}
              className="w-full mb-3 px-3 py-2 text-sm border border-zinc-300 rounded-xl bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#84B179]"
            />
            <div className="space-y-1 h-full overflow-y-auto pr-1">
              {filteredModels.map((m) => (
                <button
                  key={m._id}
                  onClick={() => setSelectedModelId(m._id)}
                  className={`w-full text-left px-2 py-2 rounded-lg border text-sm ${
                    selectedModelId === m._id
                      ? "bg-[#f6eadf] border-[#e5c3a5] text-[#8d5b30]"
                      : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  <div className="font-medium flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-zinc-100 inline-flex items-center justify-center text-xs">
                      {m.name[0]}
                    </span>
                    {m.name}
                  </div>
                  <div className="text-xs text-zinc-500 ml-7">
                    ● {m.provider}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col min-h-0 overflow-hidden">
            <div className="border border-zinc-200 rounded-xl bg-zinc-50 p-4 flex-1 min-h-0 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#E8F5BD]/70 border border-[#84B179]/30 flex items-center justify-center text-[#6a9a5d]">
                      ✦
                    </div>
                    <h1 className="text-3xl font-semibold text-zinc-900 mb-2">
                      Welcome! I&apos;m here to help you 👋
                    </h1>
                    <p className="text-sm text-zinc-500 mb-6">
                      No tech background needed. Tell me what you&apos;d like to achieve - I&apos;ll help you discover what&apos;s possible, step by step.
                    </p>
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                      <p className="text-[11px] font-semibold text-[#6a9a5d] mb-3">
                        ✨ WHAT WOULD YOU LIKE TO DO TODAY?
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          "Write content",
                          "Create images",
                          "Build something",
                          "Automate work",
                          "Analyze data",
                          "Just exploring",
                        ].map((item) => (
                          <button
                            key={item}
                            onClick={() => sendMessage(item)}
                            className="text-left bg-white border border-zinc-200 rounded-xl p-3 hover:bg-zinc-50"
                          >
                            <p className="text-sm font-semibold text-zinc-800">{item}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[82%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
                        m.role === "user"
                          ? "ml-auto bg-[#84B179] text-white"
                          : "bg-white border border-zinc-200 text-zinc-800"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))}
                  {sending && (
                    <p className="text-sm text-zinc-500">Assistant is typing...</p>
                  )}
                </>
              )}
            </div>

            <form onSubmit={onSubmit} className="mt-4 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your project, ask a question, or just say hi..."
                className="flex-1 px-4 py-3 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#84B179]"
              />
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-3 rounded-lg bg-[#84B179] text-white font-semibold hover:bg-[#6f9766] disabled:opacity-50"
              >
                Send
              </button>
            </form>

            <div className="mt-3 border border-zinc-200 rounded-xl p-3 bg-white">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.keys(TAB_DATA).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                      activeTab === tab
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-50 text-zinc-600 border border-zinc-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                {TAB_DATA[activeTab].map((text) => (
                  <button
                    key={text}
                    onClick={() => sendMessage(text)}
                    className="text-left text-xs text-zinc-600 hover:text-zinc-900"
                  >
                    • {text}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="bg-white border border-zinc-200 rounded-xl p-3 h-full min-h-0 overflow-y-auto">
            <p className="text-xs font-semibold text-zinc-500 mb-2">
              QUICK ACTIONS
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-zinc-500 mb-2">
                  NAVIGATION & TOOLS
                </p>
                <div className="space-y-1">
                  {[
                    "Browse Marketplace",
                    "Build an Agent",
                    "How to use Guide",
                    "Prompt Engineering",
                    "View Pricing",
                    "AI Models Analysis",
                  ].map((a) => (
                    <button
                      key={a}
                      onClick={() => router.push(`/marketplace`)}
                      className="w-full text-left px-2.5 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-zinc-500 mb-2">
                  CREATE & GENERATE
                </p>
                <div className="space-y-1">
                  {[
                    "Create image",
                    "Generate Audio",
                    "Create video",
                    "Create slides",
                    "Create Infographs",
                    "Create quiz",
                    "Create Flashcards",
                    "Create Mind map",
                  ].map((a) => (
                    <button
                      key={a}
                      onClick={() => setInput(`Help me with: ${a}`)}
                      className="w-full text-left px-2.5 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-zinc-500 mb-2">
                  ANALYZE & WRITE
                </p>
                <div className="space-y-1">
                  {[
                    "Analyze Data",
                    "Write content",
                    "Code Generation",
                    "Document Analysis",
                    "Translate",
                  ].map((a) => (
                    <button
                      key={a}
                      onClick={() => setInput(`Help me with: ${a}`)}
                      className="w-full text-left px-2.5 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
