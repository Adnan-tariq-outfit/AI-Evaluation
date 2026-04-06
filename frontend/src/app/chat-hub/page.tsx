"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import { ModelService } from "../../services/model.service";
import { ChatService } from "../../services/chat.service";
import { AiModel } from "../../types/model.types";
import { ChatAttachment, ChatMessage } from "../../types/chat.types";
import {
  ModelDetailsModal,
  ModelTab,
} from "../../components/ModelDetailsModal";
import { useRouter } from "next/navigation";
import ChatInputBar from "../../components/ChatInputBar";
import { consumePendingChat } from "../../lib/pendingChat";
import { io, Socket } from "socket.io-client";
import { useI18n } from "../../components/I18nProvider";
import { CHAT_HISTORY_STORAGE_KEY } from "../../lib/chatHistory";

const WELCOME_ACTION_KEYS = [
  "chat.action.writeContent",
  "chat.action.createImages",
  "chat.action.buildSomething",
  "chat.action.automateWork",
  "chat.action.analyzeData",
  "chat.action.justExploring",
];

const NAV_TOOL_KEYS = [
  "chat.nav.browseMarketplace",
  "chat.nav.buildAgent",
  "chat.nav.howToUseGuide",
  "chat.nav.promptEngineering",
  "chat.nav.viewPricing",
  "chat.nav.modelsAnalysis",
];

const CREATE_KEYS = [
  "chat.create.image",
  "chat.create.audio",
  "chat.create.video",
  "chat.create.slides",
  "chat.create.infographs",
  "chat.create.quiz",
  "chat.create.flashcards",
  "chat.create.mindmap",
];

const ANALYZE_KEYS = [
  "chat.analyze.data",
  "chat.analyze.writeContent",
  "chat.analyze.codeGeneration",
  "chat.analyze.documentAnalysis",
  "chat.analyze.translate",
];

export default function ChatHubPage() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") ?? "";
  const [models, setModels] = useState<AiModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [input, setInput] = useState(initialPrompt);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [quickActionTab, setQuickActionTab] = useState<ModelTab>("Overview");
  const [quickActionModel, setQuickActionModel] = useState<AiModel | null>(
    null,
  );
  const socketRef = useRef<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomAnchorRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { t } = useI18n();

  const persistedMessages = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ChatMessage[];
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (persistedMessages && persistedMessages.length > 0) {
      setMessages(persistedMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Don't persist blob preview URLs.
      const safe = messages.map((m) => ({
        ...m,
        attachments: m.attachments?.map((a) => {
          const { previewUrl, ...rest } = a;
          return rest;
        }),
      }));
      window.sessionStorage.setItem(
        CHAT_HISTORY_STORAGE_KEY,
        JSON.stringify(safe),
      );
    } catch {
      // ignore
    }
  }, [messages]);

  useEffect(() => {
    const socket = io(ChatService.apiUrl(), { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      // connected
    });

    socket.on("disconnect", () => {
      setIsTyping(false);
    });

    socket.on("chat:typing", (p: { typing: boolean }) => {
      setIsTyping(!!p?.typing);
    });

    socket.on(
      "chat:response",
      (msg: {
        id: string;
        role: "assistant";
        content: string;
        timestamp: string;
      }) => {
        const assistantMessage: ChatMessage = {
          id: msg.id ?? crypto.randomUUID(),
          role: "assistant",
          content: msg.content ?? "",
          timestamp: msg.timestamp ?? new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      },
    );

    socket.on("chat:ack", () => {
      setSending(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const pending = consumePendingChat();
    if (!pending) return;

    // Auto-send the pending message through the realtime channel.
    void sendMessage(pending.text || "", pending.uploads);
  }, []);

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

  useEffect(() => {
    // Keep the newest chat content visible with smooth scrolling.
    bottomAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, sending, isTyping]);

  const sendMessage = async (
    text: string,
    uploads?: { id: string; file: File; type: string }[],
  ) => {
    const trimmed = (text ?? "").trim();
    if (!trimmed && (!uploads || uploads.length === 0)) return;
    if (sending) return;

    const clientMessageId = crypto.randomUUID();
    const activeModelId = selectedModelId || models[0]?._id || undefined;

    const localAttachments: ChatAttachment[] =
      uploads?.map((u) => ({
        id: u.id,
        kind: (u.type as ChatAttachment["kind"]) ?? "document",
        name: u.file.name,
        mimeType: u.file.type || "application/octet-stream",
        size: u.file.size,
        previewUrl:
          u.type === "image" || u.type === "video"
            ? URL.createObjectURL(u.file)
            : undefined,
      })) ?? [];

    const userMessage: ChatMessage = {
      id: clientMessageId,
      role: "user",
      content: trimmed,
      attachments: localAttachments.length ? localAttachments : undefined,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const uploaded =
        uploads && uploads.length > 0
          ? await ChatService.uploadAttachments(uploads.map((u) => u.file))
          : [];

      socketRef.current?.emit("chat:message", {
        clientMessageId,
        text: trimmed,
        modelId: activeModelId,
        attachments: uploaded,
      });

      // If socket isn't connected, fallback to HTTP simulate to avoid "no response".
      if (!socketRef.current?.connected) {
        const result = await ChatService.simulate(
          trimmed || "(attachments)",
          activeModelId,
          uploads?.map((u) => u.file) ?? [],
        );
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.reply,
          timestamp: result.timestamp,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setSending(false);
      }
    } catch {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: t("chat.sendError"),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setSending(false);
    }
  };

  const filteredModels = models.filter((m) =>
    `${m.name} ${m.provider}`.toLowerCase().includes(modelSearch.toLowerCase()),
  );
  const selectedModel = models.find((m) => m._id === selectedModelId) ?? null;
  const openQuickActionModal = (tab: ModelTab) => {
    const activeModel = selectedModel ?? models[0] ?? null;
    if (!activeModel) return;
    setQuickActionTab(tab);
    setQuickActionModel(activeModel);
  };

  const sendQuickActionPrompt = async (label: string) => {
    await sendMessage(t("chat.helpMeWith", { value: label }));
  };

  const handleNavigationAction = async (key: string) => {
    if (key === "chat.nav.browseMarketplace") {
      router.push("/marketplace");
      return;
    }
    if (key === "chat.nav.buildAgent") {
      openQuickActionModal("Agent Creation");
      return;
    }
    if (key === "chat.nav.howToUseGuide") {
      openQuickActionModal("How to Use");
      return;
    }
    if (key === "chat.nav.promptEngineering") {
      openQuickActionModal("Prompt Guide");
      return;
    }
    if (key === "chat.nav.viewPricing") {
      openQuickActionModal("Pricing");
      return;
    }
    if (key === "chat.nav.modelsAnalysis") {
      await sendQuickActionPrompt(t(key));
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#f9f9f8] overflow-hidden">
      <Header />
      <main className="flex-1 mt-20 px-3 sm:px-4 lg:px-6 pb-3 overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-[270px_1fr_270px] gap-4 h-full min-h-0">
          <aside className="bg-white border h-full min-h-0 border-zinc-200 rounded-xl p-3 overflow-hidden">
            <p className="text-xs font-semibold text-zinc-500 mb-2">
              {t("common.models")}
            </p>
            <input
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder={t("common.searchModels", { count: models.length })}
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
            <div
              ref={messagesContainerRef}
              className="border border-zinc-200 rounded-xl bg-zinc-50 p-4 flex-1 min-h-0 overflow-y-auto space-y-3"
            >
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-3xl p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#E8F5BD]/70 border border-[#84B179]/30 flex items-center justify-center text-[#6a9a5d]">
                      ✦
                    </div>
                    <h1 className="text-3xl font-semibold text-zinc-900 mb-2">
                      {t("chat.welcomeTitle")}
                    </h1>
                    <p className="text-sm text-zinc-500 mb-6">
                      {t("chat.welcomeBody")}
                    </p>
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
                      <p className="text-[11px] font-semibold text-[#6a9a5d] mb-3">
                        ✨ {t("chat.whatDoYouWant")}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {WELCOME_ACTION_KEYS.map((key) => (
                          <button
                            key={key}
                            onClick={() => sendMessage(t(key))}
                            className="text-left bg-white border border-zinc-200 rounded-xl p-3 hover:bg-zinc-50"
                          >
                            <p className="text-sm font-semibold text-zinc-800">
                              {t(key)}
                            </p>
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
                      {!!m.attachments?.length && (
                        <div
                          className={`mt-3 flex flex-wrap gap-2 ${
                            m.role === "user"
                              ? "text-white/90"
                              : "text-zinc-700"
                          }`}
                        >
                          {m.attachments.map((a) => (
                            <div
                              key={a.id}
                              className={`rounded-lg border px-2 py-1 text-xs ${
                                m.role === "user"
                                  ? "border-white/25 bg-white/10"
                                  : "border-zinc-200 bg-white"
                              }`}
                            >
                              {(a.kind === "image" || a.kind === "video") &&
                              a.previewUrl ? (
                                a.kind === "image" ? (
                                  <img
                                    src={a.previewUrl}
                                    alt={a.name}
                                    className="mb-1 h-20 w-28 rounded object-cover"
                                  />
                                ) : (
                                  <video
                                    src={a.previewUrl}
                                    className="mb-1 h-20 w-28 rounded object-cover"
                                    controls
                                  />
                                )
                              ) : null}
                              <div className="max-w-[240px] truncate">
                                {a.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {(sending || isTyping) && (
                    <p className="text-sm text-zinc-500">
                      {t("common.assistantTyping")}
                    </p>
                  )}
                </>
              )}
              <div ref={bottomAnchorRef} />
            </div>

            <div className="mt-4">
              <ChatInputBar
                value={input}
                onChange={setInput}
                onSubmit={async (text, uploads) => {
                  await sendMessage(text, uploads);
                }}
                submitBehavior="submit"
                tabRedirectToChatHub={true}
                disabled={sending}
              />
              {selectedModel && (
                <p className="mt-2 text-xs text-zinc-500">
                  {t("chat.selectedModel")}:{" "}
                  <span className="font-semibold text-zinc-700">
                    {selectedModel.name}
                  </span>
                </p>
              )}
            </div>
          </section>

          <aside className="bg-white border border-zinc-200 rounded-xl p-3 h-full min-h-0 overflow-y-auto">
            <p className="text-xs font-semibold text-zinc-500 mb-2">
              {t("common.quickActions")}
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-zinc-500 mb-2">
                  {t("chat.navigationTools")}
                </p>
                <div className="space-y-1">
                  {NAV_TOOL_KEYS.map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        void handleNavigationAction(key);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-zinc-500 mb-2">
                  {t("chat.createGenerate")}
                </p>
                <div className="space-y-1">
                  {CREATE_KEYS.map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        void sendQuickActionPrompt(t(key));
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-zinc-500 mb-2">
                  {t("chat.analyzeWrite")}
                </p>
                <div className="space-y-1">
                  {ANALYZE_KEYS.map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        void sendQuickActionPrompt(t(key));
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      {quickActionModel && (
        <ModelDetailsModal
          model={quickActionModel}
          defaultTab={quickActionTab}
          onClose={() => setQuickActionModel(null)}
        />
      )}
    </div>
  );
}
