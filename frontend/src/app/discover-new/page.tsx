"use client";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";
import { useI18n } from "../../components/I18nProvider";

const feedItems = [
  {
    month: "MAR",
    day: "26",
    source: "Google DeepMind",
    title: "Gemini 2.5 Pro achieves new SOTA on reasoning benchmarks",
    excerpt:
      "Scores 83.5% on MMLU-Pro with strong gains in coding and long-context tasks.",
  },
  {
    month: "MAR",
    day: "22",
    source: "MIT CSAIL",
    title: "Scaling laws for multimodal models: new empirical findings",
    excerpt:
      "Research reveals unexpected scaling dynamics across text, vision, and audio under constrained budgets.",
  },
  {
    month: "MAR",
    day: "18",
    source: "Anthropic",
    title:
      "Constitutional AI v2: improved alignment through iterative refinement",
    excerpt:
      "New methodology delivers 40% reduction in harmful outputs while preserving capability on standard tasks.",
  },
  {
    month: "MAR",
    day: "15",
    source: "Meta AI",
    title: "Llama 4 Scout & Maverick: native multimodals from the ground up",
    excerpt:
      "17B MoE architecture trained on 40T tokens for robust understanding across text, image, and video.",
  },
  {
    month: "MAR",
    day: "10",
    source: "Stanford HAI",
    title: "Long-context recall: how models handle 1M+ token windows",
    excerpt:
      "Comprehensive evaluation shows sharp recall degradation beyond 200K tokens for most tested systems.",
  },
  {
    month: "MAR",
    day: "5",
    source: "DeepSeek",
    title:
      "DeepSeek-R1 open weights: reproducing frontier reasoning at minimal cost",
    excerpt:
      "Full weight release enables fine-tuning for domain-specific reasoning at a fraction of frontier model cost.",
  },
];

export default function DiscoverNewPage() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f7f5]">
      <Header />
      <main className="flex-1 pt-24 px-3 sm:px-4 lg:px-6">
        <div className="">
          <h1 className="text-3xl font-semibold text-zinc-900 mb-5">
            {t("discover.title")}
          </h1>

          <div className="space-y-3 pb-8 flex flex-col justify-center items-center">
            {feedItems.map((item) => (
              <article
                onClick={() => {
                  const query = item.title.trim();
                  router.push(
                    query
                      ? `/chat-hub?prompt=${encodeURIComponent(query)}`
                      : "/chat-hub",
                  );
                }}
                key={`${item.month}-${item.day}-${item.title}`}
                className="grid grid-cols-[72px_1fr] gap-4 bg-white border border-zinc-200 rounded-xl px-4 py-3 w-[800px]"
              >
                <div className="text-center border-r border-zinc-100 pr-3">
                  <p className="text-[10px] tracking-wide font-semibold text-zinc-400">
                    {item.month}
                  </p>
                  <p className="text-3xl leading-8 font-semibold text-zinc-900">
                    {item.day}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-zinc-400 mb-1">{item.source}</p>
                  <h2 className="text-base font-semibold text-zinc-900 leading-5">
                    {item.title}
                  </h2>
                  <p className="text-sm text-zinc-600 mt-1">{item.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
