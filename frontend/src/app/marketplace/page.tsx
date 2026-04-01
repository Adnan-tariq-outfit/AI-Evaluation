"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ModelDetailsModal } from "../../components/ModelDetailsModal";
import { ModelService } from "../../services/model.service";
import { AiModel } from "../../types/model.types";

export default function MarketplacePage() {
  const [models, setModels] = useState<AiModel[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("");
  const [capability, setCapability] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedModel, setSelectedModel] = useState<AiModel | null>(null);
  const [tab, setTab] = useState<string>("Overview");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await ModelService.getModels({
        search: search || undefined,
        provider: provider || undefined,
        capability: capability || undefined,
        minRating: minRating ? Number(minRating) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
      setModels(result.data);
      setProviders(result.meta.providers);
      setCapabilities(result.meta.capabilities);
      setLoading(false);
    };
    load();
  }, [search, provider, capability, minRating, maxPrice]);

  const countLabel = useMemo(() => `${models.length} models`, [models.length]);

  const providerCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of models) {
      map[m.provider] = (map[m.provider] || 0) + 1;
    }
    return map;
  }, [models]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f8]">
      <Header />
      <main className="flex-1 pt-24 px-3 sm:px-4 lg:px-6">
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold text-zinc-900">
              Model Marketplace
            </h1>
            <span className="text-xs text-zinc-500">{countLabel}</span>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search models, capabilities..."
              className="min-w-[260px] flex-1 max-w-xl px-4 py-2 border border-zinc-300 rounded-full bg-white text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#84B179]"
            />
            <button
              onClick={() => {
                setProvider("");
                setCapability("");
                setMinRating("");
                setMaxPrice("");
                setSearch("");
              }}
              className="px-3 py-2 text-xs text-zinc-900 rounded-full border border-zinc-300 bg-white hover:bg-zinc-50"
            >
              Reset Filters
            </button>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setProvider("")}
              className={`px-3 py-1 rounded-full text-xs border ${
                provider === ""
                  ? "bg-[#f6eadf] border-[#e6c8ad] text-[#8d5b30]"
                  : "bg-white border-zinc-200 text-zinc-600"
              }`}
            >
              All
            </button>
            {providers.map((p) => (
              <button
                key={p}
                onClick={() => setProvider(provider === p ? "" : p)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  provider === p
                    ? "bg-[#f6eadf] border-[#e6c8ad] text-[#8d5b30]"
                    : "bg-white border-zinc-200 text-zinc-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-zinc-600">Loading models...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 pb-8">
              <aside className="bg-white rounded-xl border border-zinc-200 p-3 h-fit">
                <p className="text-xs font-semibold text-zinc-500 mb-2">
                  PROVIDER
                </p>
                <div className="space-y-1 mb-4">
                  {providers.map((p) => (
                    <button
                      key={p}
                      onClick={() => setProvider(provider === p ? "" : p)}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded ${
                        provider === p
                          ? "bg-[#f6eadf] text-[#8d5b30]"
                          : "hover:bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      {p}{" "}
                      <span className="text-xs text-zinc-500">
                        ({providerCounts[p] || 0})
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-xs font-semibold text-zinc-500 mb-2">
                  CAPABILITY
                </p>
                <select
                  value={capability}
                  onChange={(e) => setCapability(e.target.value)}
                  className="w-full px-2 py-2 text-sm border border-zinc-300 rounded-lg mb-3 bg-white text-zinc-900"
                >
                  <option value="">All capabilities</option>
                  {capabilities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <p className="text-xs font-semibold text-zinc-500 mb-2">
                  MAX PRICE /1K TOKENS
                </p>
                <input
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full px-2 py-2 text-sm border border-zinc-300 rounded-lg mb-3 text-zinc-900 placeholder:text-zinc-400 bg-white"
                />

                <p className="text-xs font-semibold text-zinc-500 mb-2">
                  MIN RATING
                </p>
                <input
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  placeholder="e.g. 4.5"
                  className="w-full px-2 py-2 text-sm border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 bg-white"
                />
              </aside>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                {models.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => setSelectedModel(m)}
                    className="text-left rounded-2xl border border-zinc-200 p-4 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
                  >
                    {/* TOP ROW: icon + name/provider + badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0 text-xl">
                          🧠
                        </div>
                        <div>
                          <h3 className="font-semibold text-zinc-900 text-sm leading-tight">
                            {m.name}
                          </h3>
                          <span className="text-xs text-zinc-400">
                            {m.provider}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {m.isHot && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-200 font-medium">
                            Hot
                          </span>
                        )}
                        {m.isNew && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
                      {m.description ??
                        `${m.provider} flagship. Native computer-use agents, advanced reasoning, ${(m.contextWindow / 1_000_000).toFixed(0)}M context.`}
                    </p>

                    {/* CAPABILITY TAGS */}
                    <div className="flex flex-wrap gap-1.5">
                      {m.capabilities.slice(0, 4).map((cap) => (
                        <span
                          key={cap}
                          className="text-[11px] px-3 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>

                    {/* BOTTOM ROW: stars + rating + price + how to use */}
                    <div className="flex items-center gap-2 mt-auto pt-1 flex-wrap">
                      <div className="flex text-amber-400 gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <svg
                            key={i}
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-zinc-600 font-medium">
                        {m.rating.toFixed(1)} (
                        {m.reviewCount?.toLocaleString() ??
                          Math.floor(m.rating * 1000)}
                        )
                      </span>
                      <span className="text-xs font-semibold text-zinc-800">
                        ${m.pricePer1k}/1M tk
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModel(m);
                          setTab("How to Use");
                        }}
                        className="text-xs text-[#D4622A] font-semibold hover:underline ml-auto whitespace-nowrap"
                      >
                        How to Use →
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      {selectedModel && (
        <ModelDetailsModal
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
          defaultTab={tab}
        />
      )}
      <Footer />
    </div>
  );
}
