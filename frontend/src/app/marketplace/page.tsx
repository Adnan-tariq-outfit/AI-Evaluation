"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  ModelDetailsModal,
  ModelTab,
} from "../../components/ModelDetailsModal";
import { ModelService } from "../../services/model.service";
import { AiModel } from "../../types/model.types";
import { useI18n } from "../../components/I18nProvider";

export default function MarketplacePage() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [models, setModels] = useState<AiModel[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("");
  const [capability, setCapability] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<
    "featured" | "rating" | "price-low" | "price-high"
  >("featured");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AiModel | null>(null);
  const [tab, setTab] = useState<ModelTab>("Overview");
  const quickTabHandled = useRef(false);

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

  useEffect(() => {
    if (loading || models.length === 0 || quickTabHandled.current) return;
    const quickTab = searchParams.get("quickTab");
    if (!quickTab) return;

    const tabByQuery: Record<string, ModelTab> = {
      overview: "Overview",
      "how-to-use": "How to Use",
      pricing: "Pricing",
      "prompt-guide": "Prompt Guide",
      "agent-creation": "Agent Creation",
      reviews: "Reviews",
    };

    const targetTab = tabByQuery[quickTab];
    if (!targetTab) return;

    const nextModel = models[0];
    const timer = window.setTimeout(() => {
      setSelectedModel(nextModel);
      setTab(targetTab);
      quickTabHandled.current = true;
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loading, models, searchParams]);

  const filteredAndSortedModels = useMemo(() => {
    const items = [...models];
    if (sortBy === "rating") {
      items.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price-low") {
      items.sort((a, b) => a.pricePer1k - b.pricePer1k);
    } else if (sortBy === "price-high") {
      items.sort((a, b) => b.pricePer1k - a.pricePer1k);
    } else {
      items.sort((a, b) => {
        const aScore = (a.isHot ? 2 : 0) + (a.isNew ? 1 : 0) + a.rating / 5;
        const bScore = (b.isHot ? 2 : 0) + (b.isNew ? 1 : 0) + b.rating / 5;
        return bScore - aScore;
      });
    }
    return items;
  }, [models, sortBy]);

  const countLabel = useMemo(
    () => `${filteredAndSortedModels.length} models`,
    [filteredAndSortedModels.length],
  );

  const providerCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of models) {
      map[m.provider] = (map[m.provider] || 0) + 1;
    }
    return map;
  }, [models]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count += 1;
    if (provider) count += 1;
    if (capability) count += 1;
    if (minRating) count += 1;
    if (maxPrice) count += 1;
    return count;
  }, [search, provider, capability, minRating, maxPrice]);

  const clearAllFilters = () => {
    setProvider("");
    setCapability("");
    setMinRating("");
    setMaxPrice("");
    setSearch("");
  };

  return (
    <div className="min-h-screen flex flex-col theme-page">
      <Header />
      <main className="flex-1 pt-24 px-3 sm:px-4 lg:px-6 pb-8">
        <div className="w-full max-w-[1600px] mx-auto">
          <section className="theme-panel rounded-2xl px-4 sm:px-6 py-5 mb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-[var(--theme-text)]">
                  Model Marketplace
                </h1>
                <p className="text-sm text-[var(--theme-text-muted)] mt-1">
                  Discover and compare AI models by provider, capability,
                  rating, and cost.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-[var(--theme-text-muted)] bg-[var(--theme-surface-muted)] border border-[var(--theme-border)] px-3 py-1.5 rounded-full">
                  {countLabel}
                </span>
                <button
                  onClick={() => setShowMobileFilters((prev) => !prev)}
                  className="theme-button-secondary lg:hidden px-3 py-1.5 text-sm rounded-full"
                >
                  {showMobileFilters ? "Hide Filters" : "Show Filters"}
                  {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                </button>
              </div>
            </div>
          </section>

          <section className="theme-panel mb-4 flex flex-col gap-3 rounded-2xl px-4 sm:px-6 py-4">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.searchModels", { count: models.length })}
                className="theme-input w-full md:flex-1 px-4 py-2.5 rounded-full text-sm"
              />
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | "featured"
                        | "rating"
                        | "price-low"
                        | "price-high",
                    )
                  }
                  className="theme-input px-3 py-2.5 rounded-full text-sm"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="rating">Sort: Rating (High to Low)</option>
                  <option value="price-low">Sort: Price (Low to High)</option>
                  <option value="price-high">Sort: Price (High to Low)</option>
                </select>
                <button
                  onClick={clearAllFilters}
                  className="theme-button-secondary px-3 py-2.5 text-sm rounded-full"
                >
                  Reset
                </button>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {provider && (
                  <button
                    onClick={() => setProvider("")}
                    className="theme-badge px-3 py-1 rounded-full"
                  >
                    Provider: {provider} ×
                  </button>
                )}
                {capability && (
                  <button
                    onClick={() => setCapability("")}
                    className="theme-badge px-3 py-1 rounded-full"
                  >
                    Capability: {capability} ×
                  </button>
                )}
                {minRating && (
                  <button
                    onClick={() => setMinRating("")}
                    className="theme-badge px-3 py-1 rounded-full"
                  >
                    Min Rating: {minRating}+ ×
                  </button>
                )}
                {maxPrice && (
                  <button
                    onClick={() => setMaxPrice("")}
                    className="theme-badge px-3 py-1 rounded-full"
                  >
                    Max Price: ${maxPrice} ×
                  </button>
                )}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-4">
            <aside
              className={`${
                showMobileFilters ? "block" : "hidden"
              } lg:block h-fit lg:sticky lg:top-28 theme-panel rounded-2xl p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold tracking-wide text-[var(--theme-text-muted)]">
                  FILTERS
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs theme-link font-medium hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <p className="text-xs font-semibold text-[var(--theme-text-muted)] mb-2">
                PROVIDER
              </p>
              <div className="space-y-1.5 mb-4 max-h-52 overflow-y-auto pr-1">
                <button
                  onClick={() => setProvider("")}
                  className={`w-full text-left px-2.5 py-2 text-sm rounded-lg border ${
                    provider === ""
                      ? "bg-[rgba(232,245,189,0.36)] border-[var(--theme-border-strong)] text-[var(--theme-accent-hover)]"
                      : "border-transparent hover:bg-[var(--theme-surface-muted)] text-[var(--theme-text-muted)]"
                  }`}
                >
                  All providers
                </button>
                {providers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(provider === p ? "" : p)}
                    className={`w-full text-left px-2.5 py-2 text-sm rounded-lg border ${
                      provider === p
                        ? "bg-[rgba(232,245,189,0.36)] border-[var(--theme-border-strong)] text-[var(--theme-accent-hover)]"
                        : "border-transparent hover:bg-[var(--theme-surface-muted)] text-[var(--theme-text-muted)]"
                    }`}
                  >
                    {p}{" "}
                    <span className="text-xs text-zinc-500">
                      ({providerCounts[p] || 0})
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-xs font-semibold text-[var(--theme-text-muted)] mb-2">
                CAPABILITY
              </p>
              <select
                value={capability}
                onChange={(e) => setCapability(e.target.value)}
                className="theme-input w-full px-2.5 py-2 text-sm rounded-lg mb-3"
              >
                <option value="">All capabilities</option>
                {capabilities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <p className="text-xs font-semibold text-[var(--theme-text-muted)] mb-2">
                MAX PRICE /1K TOKENS
              </p>
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 30"
                className="theme-input w-full px-2.5 py-2 text-sm rounded-lg mb-3"
              />

              <p className="text-xs font-semibold text-[var(--theme-text-muted)] mb-2">
                MIN RATING
              </p>
              <input
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder="e.g. 4.5"
                className="theme-input w-full px-2.5 py-2 text-sm rounded-lg"
              />
            </aside>

            <section className="min-w-0">
              {loading ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="theme-panel rounded-2xl p-4"
                      >
                        <div className="animate-pulse space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#f0ece4]" />
                              <div className="space-y-2">
                                <div className="h-3 w-24 rounded bg-[#f0ece4]" />
                                <div className="h-2.5 w-16 rounded bg-[#f0ece4]" />
                              </div>
                            </div>
                            <div className="h-5 w-10 rounded-full bg-[#f0ece4]" />
                          </div>
                          <div className="h-3 w-full rounded bg-[#f0ece4]" />
                          <div className="h-3 w-4/5 rounded bg-[#f0ece4]" />
                          <div className="flex gap-2">
                            <div className="h-5 w-16 rounded-full bg-[#f0ece4]" />
                            <div className="h-5 w-20 rounded-full bg-[#f0ece4]" />
                            <div className="h-5 w-14 rounded-full bg-[#f0ece4]" />
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <div className="h-3 w-24 rounded bg-[#f0ece4]" />
                            <div className="h-3 w-16 rounded bg-[#f0ece4]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : filteredAndSortedModels.length === 0 ? (
                <div className="theme-panel rounded-2xl p-8 text-center">
                  <h3 className="text-lg font-semibold text-[var(--theme-text)] mb-2">
                    No models found
                  </h3>
                  <p className="text-sm text-[var(--theme-text-muted)] mb-4">
                    Try adjusting your search keywords or clearing one or more
                    filters.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="theme-button-primary px-4 py-2 text-sm rounded-full"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                  {filteredAndSortedModels.map((m) => (
                    <button
                      key={m._id}
                      onClick={() => {
                        setTab("Overview");
                        setSelectedModel(m);
                      }}
                      className="theme-panel text-left rounded-2xl p-4 hover:shadow-md transition-shadow flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[rgba(232,245,189,0.4)] border border-[var(--theme-border-strong)] flex items-center justify-center shrink-0 text-xl">
                            🧠
                          </div>
                          <div>
                            <h3 className="font-semibold text-[var(--theme-text)] text-sm leading-tight">
                              {m.name}
                            </h3>
                            <span className="text-xs text-[var(--theme-text-muted)]">
                              {m.provider}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {m.isHot && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(232,245,189,0.4)] text-[var(--theme-accent-hover)] border border-[var(--theme-border-strong)] font-medium">
                              Hot
                            </span>
                          )}
                          {m.isNew && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(215,233,196,0.52)] text-[var(--theme-accent-strong)] border border-[var(--theme-border-strong)] font-medium">
                              New
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed line-clamp-2">
                        {`${m.provider} flagship. Native computer-use agents, advanced reasoning, ${(m.contextWindow / 1_000_000).toFixed(0)}M context.`}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {m.capabilities.slice(0, 4).map((cap) => (
                          <span
                            key={cap}
                            className="text-[11px] px-3 py-0.5 rounded-full bg-[var(--theme-surface-muted)] text-[var(--theme-text-muted)] font-medium"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>

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
                        <span className="text-xs text-[var(--theme-text-muted)] font-medium">
                          {m.rating.toFixed(1)} ({Math.floor(m.rating * 1000)})
                        </span>
                        <span className="text-xs font-semibold text-[var(--theme-text)]">
                          ${m.pricePer1k}/1M tk
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModel(m);
                            setTab("How to Use");
                          }}
                          className="text-xs theme-link font-semibold hover:underline ml-auto whitespace-nowrap"
                        >
                          How to Use →
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
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
