"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  Paperclip,
  Image as ImageIcon,
  Video,
  MonitorUp,
  Bot,
} from "lucide-react";
import type { ReactNode } from "react";

const DEFAULT_TAB_DATA: Record<string, string[]> = {
  Recruiting: [
    "Monitor job postings at target companies",
    "Benchmark salary for a specific role",
    "Build a hiring pipeline tracker",
    "Research a candidate before an interview",
    "Build an interactive talent market map",
  ],
  "Create a prototype": [
    "Draft a React component for a dashboard",
    "Write a Python script for a basic CRUD API",
    "Design a database schema for an e-commerce app",
  ],
  "Build a business": [
    "Generate a SWOT analysis for a SaaS startup",
    "Draft a 12-month marketing strategy",
    "Calculate projected revenue based on user growth",
  ],
  "Help me learn": [
    "Teach me prompt engineering basics",
    "Explain vector databases in simple terms",
    "How does RAG work in production systems?",
  ],
  Research: [
    "Summarize this scientific research paper",
    "Compare features of top 5 CRM software",
    "Explain implications of recent AI regulations",
  ],
};

type UploadedFile = {
  id: string;
  file: File;
  type: "document" | "image" | "video" | "screen";
};

type SpeechRecognitionAlternativeLike = { transcript: string };
type SpeechRecognitionResultLike = SpeechRecognitionAlternativeLike[];
type SpeechRecognitionEventLike = {
  results: SpeechRecognitionResultLike[];
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionCtorLike = new () => SpeechRecognitionLike;

function IconButton({
  label,
  onClick,
  icon,
  active,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border text-zinc-600 transition-colors ${
        active
          ? "border-[#84B179] bg-[#e9f4de] text-[#567544]"
          : "border-zinc-200 bg-white hover:bg-zinc-50"
      }`}
      title={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
}

export type ChatInputBarProps = {
  value: string;
  onChange: (next: string) => void;
  // When provided, clicking "Let's go" submits via this callback.
  onSubmit?: (text: string, uploads: UploadedFile[]) => void | Promise<void>;
  // Defaults to redirecting to chat hub (for landing page usage).
  submitBehavior?: "submit" | "redirect";
  // Tabs + suggestions below the composer.
  tabData?: Record<string, string[]>;
  // When true, clicking a tab will redirect to `/chat-hub` and prefill the prompt with the tab label.
  tabRedirectToChatHub?: boolean;
  // Optional override for what suggestion clicks do.
  onSuggestionSelect?: (suggestion: string) => void;
  disabled?: boolean;
};

export function ChatInputBar({
  value,
  onChange,
  onSubmit,
  submitBehavior = "redirect",
  tabData = DEFAULT_TAB_DATA,
  tabRedirectToChatHub = false,
  onSuggestionSelect,
  disabled,
}: ChatInputBarProps) {
  const router = useRouter();
  const tabs = Object.keys(tabData);
  const [activeTab, setActiveTab] = useState<string>(tabs[0] ?? "Recruiting");
  const [isRecording, setIsRecording] = useState(false);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const valueRef = useRef(value);
  const imagePreviewUrlsRef = useRef<Record<string, string>>({});

  const docInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const activeTabForUI =
    tabRedirectToChatHub && tabs.includes(value.trim())
      ? value.trim()
      : activeTab;

  // Create image preview thumbnails for selected images.
  // (We only revoke object URLs in effects; we do not call setState in effects.)
  const imagePreviewUrls = useMemo(() => {
    const nextUrls: Record<string, string> = {};
    for (const u of uploads) {
      if (u.type !== "image") continue;
      nextUrls[u.id] = URL.createObjectURL(u.file);
    }
    return nextUrls;
  }, [uploads]);

  useEffect(() => {
    const prevUrls = imagePreviewUrlsRef.current;
    for (const url of Object.values(prevUrls)) {
      URL.revokeObjectURL(url);
    }
    imagePreviewUrlsRef.current = imagePreviewUrls;
  }, [imagePreviewUrls]);

  useEffect(() => {
    return () => {
      for (const url of Object.values(imagePreviewUrlsRef.current)) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtorLike;
      webkitSpeechRecognition?: SpeechRecognitionCtorLike;
    };

    const SpeechRecognitionImpl =
      win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) return;

    const recognition = new SpeechRecognitionImpl();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ");
      const trimmed = transcript.trim();
      if (!trimmed) return;

      const current = valueRef.current.trim();
      onChange(current ? `${current} ${trimmed}` : trimmed);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, [onChange]);

  const handleStartStopRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
      }
    }
  };

  const handleFilesSelected = (
    files: FileList | null,
    type: UploadedFile["type"],
  ) => {
    if (!files) return;
    const next: UploadedFile[] = [];
    Array.from(files).forEach((file) => {
      next.push({
        id: `${type}-${file.name}-${file.lastModified}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        file,
        type,
      });
    });
    setUploads((prev) => [...prev, ...next]);
  };

  const handleSubmit = async () => {
    const text = value.trim();
    if (disabled) return;

    if (!text && uploads.length === 0) return;

    if (submitBehavior === "submit" && onSubmit) {
      const submittingUploads = uploads;
      await onSubmit(text, submittingUploads);
      setUploads([]);
      return;
    }

    // Default behavior for landing usage: redirect to chat-hub.
    const url = text
      ? `/chat-hub?prompt=${encodeURIComponent(text)}`
      : "/chat-hub";
    router.push(url);
  };

  const renderUploads = () => {
    if (!uploads.length) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600">
        {uploads.map((u) => (
          <div
            key={u.id}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1"
          >
            {u.type === "image" && imagePreviewUrls[u.id] ? (
              <img
                src={imagePreviewUrls[u.id]}
                alt={u.file.name}
                className="h-5 w-5 rounded object-cover"
              />
            ) : (
              <span className="font-medium">
                {u.type === "document"
                  ? "Doc"
                  : u.type === "video"
                    ? "Video"
                    : u.type === "screen"
                      ? "Screen"
                      : "Image"}
              </span>
            )}
            <span className="max-w-[180px] truncate">{u.file.name}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm shadow-zinc-100">
      <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2">
        <div className="flex items-center gap-1">
          <IconButton
            label={isRecording ? "Stop voice input" : "Start voice input"}
            onClick={handleStartStopRecording}
            icon={
              <Mic
                className={`h-4 w-4 ${
                  isRecording ? "text-red-500" : "text-zinc-600"
                }`}
              />
            }
            active={isRecording}
          />
          <IconButton
            label="Upload document or file"
            onClick={() => docInputRef.current?.click()}
            icon={<Paperclip className="h-4 w-4" />}
          />
          <IconButton
            label="Upload image"
            onClick={() => imageInputRef.current?.click()}
            icon={<ImageIcon className="h-4 w-4" />}
          />
          <IconButton
            label="Upload video"
            onClick={() => videoInputRef.current?.click()}
            icon={<Video className="h-4 w-4" />}
          />
          <IconButton
            label="Share screen (UI only)"
            onClick={() => {
              alert("Screen capture UI placeholder – not implemented yet.");
            }}
            icon={<MonitorUp className="h-4 w-4" />}
          />
          <IconButton
            label="Go to Agents"
            onClick={() => router.push("/agents")}
            icon={<Bot className="h-4 w-4" />}
          />
        </div>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Click here and type anything — or just say hi! 👋"
          onKeyDown={(e) => {
            if (e.key !== "Enter" || e.shiftKey) return;
            e.preventDefault();
            handleSubmit();
          }}
          className="ml-2 flex-1 border-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className="ml-2 inline-flex items-center rounded-full bg-[#84B179] px-4 py-1.5 text-sm font-semibold text-white shadow-sm  disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Let&apos;s go
        </button>
      </div>

      {renderUploads()}

      <div className="mt-3 border border-zinc-200 rounded-xl p-3 bg-white">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
              }}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                activeTab === tab
                  ? "bg-[#84B179] text-white"
                  : "bg-zinc-50 text-zinc-600 border border-zinc-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
          {(tabData[activeTabForUI] ?? []).map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => {
                if (onSuggestionSelect) onSuggestionSelect(text);
                else onChange(text);
              }}
              className="text-left text-xs text-zinc-600 hover:text-zinc-900"
            >
              • {text}
            </button>
          ))}
        </div>
      </div>

      <input
        ref={docInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files, "document")}
        multiple
        accept=".pdf,.doc,.docx,.txt,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files, "image")}
        multiple
        accept="image/*"
      />
      <input
        ref={videoInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files, "video")}
        multiple
        accept="video/*"
      />
    </div>
  );
}

export default ChatInputBar;
