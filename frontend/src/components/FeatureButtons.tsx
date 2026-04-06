"use client";

import { motion } from "framer-motion";
import {
  Palette,
  Music,
  Video,
  Presentation,
  BarChart3,
  HelpCircle,
  Files,
  Brain,
  LineChart,
  PencilLine,
  Code2,
  FileText,
  Globe,
  Telescope,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "./I18nProvider";

interface FeatureButton {
  icon: React.ReactNode;
  labelKey: string;
  variant: "solid" | "dashed";
}

const features: FeatureButton[] = [
  {
    icon: <Palette className="w-5 h-5" />,
    labelKey: "feature.createImage",
    variant: "solid",
  },
  {
    icon: <Music className="w-5 h-5" />,
    labelKey: "feature.generateAudio",
    variant: "solid",
  },
  {
    icon: <Video className="w-5 h-5" />,
    labelKey: "feature.createVideo",
    variant: "solid",
  },
  {
    icon: <Presentation className="w-5 h-5" />,
    labelKey: "feature.createSlides",
    variant: "solid",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    labelKey: "feature.createInfographs",
    variant: "solid",
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    labelKey: "feature.createQuiz",
    variant: "solid",
  },
  {
    icon: <Files className="w-5 h-5" />,
    labelKey: "feature.createFlashcards",
    variant: "solid",
  },
  {
    icon: <Brain className="w-5 h-5" />,
    labelKey: "feature.createMindMap",
    variant: "solid",
  },
  {
    icon: <LineChart className="w-5 h-5" />,
    labelKey: "feature.analyzeData",
    variant: "solid",
  },
  {
    icon: <PencilLine className="w-5 h-5" />,
    labelKey: "feature.writeContent",
    variant: "solid",
  },
  {
    icon: <Code2 className="w-5 h-5" />,
    labelKey: "feature.codeGeneration",
    variant: "solid",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    labelKey: "feature.documentAnalysis",
    variant: "solid",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    labelKey: "feature.translate",
    variant: "solid",
  },
  {
    icon: <Telescope className="w-5 h-5" />,
    labelKey: "feature.justExploring",
    variant: "dashed",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function FeatureButtons() {
  const { t } = useI18n();
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-transparent">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-4xl mx-auto"
      >
        {/* Feature Buttons Grid */}
        <motion.div
          variants={containerVariants}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {features.map((feature) => (
            <motion.button
              key={feature.labelKey}
              variants={itemVariants}
              className={`group flex items-center gap-2.5 px-5 py-3 rounded-full transition-all duration-200 ${
                feature.variant === "dashed"
                  ? "border-2 border-dashed border-[var(--theme-border-strong)] bg-transparent hover:bg-[var(--theme-surface-muted)]"
                  : "border border-[var(--theme-border-strong)] bg-[rgba(232,245,189,0.34)] hover:bg-[rgba(215,233,196,0.72)]"
              }`}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-[var(--theme-accent-strong)] transition-transform group-hover:scale-110">
                {feature.icon}
              </span>
              <span className="text-sm font-medium text-[var(--theme-text-muted)] whitespace-nowrap">
                {t(feature.labelKey)}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div variants={itemVariants} className="mt-10 text-center">
          <p className="text-sm text-[var(--theme-text-muted)]">
            {t("feature.orBrowse")}{" "}
            <Link
              href="/marketplace"
              className="theme-link font-medium hover:underline"
            >
              {t("feature.completeMarketplace")}
            </Link>{" "}
            {t("feature.ofModels")}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
