"use client";

import { motion } from "framer-motion";
import {
  Mic,
  Video,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import FeatureButtons from "./FeatureButtons";
import ChatInputBarLanding from "./ChatInputBarLanding";
import { useI18n } from "./I18nProvider";

interface MediaButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function MediaButton({ icon, label, onClick }: MediaButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="p-2 text-zinc-500 rounded-lg hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
    >
      {icon}
    </motion.button>
  );
}

export default function HeroSection() {
  const isFocused = false;
  const { t } = useI18n();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-30 pb-16 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(252,251,245,0.96)_0%,rgba(245,243,234,0.88)_48%,rgba(239,236,223,0.92)_100%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top,rgba(232,245,189,0.72),transparent_58%)]" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--theme-border-strong)] bg-[rgba(232,245,189,0.34)] text-[var(--theme-accent-hover)] text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-[var(--theme-accent)] animate-pulse" />
            {t("hero.availableModels")}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--theme-text)] tracking-tight leading-[1.1] mb-6"
        >
          {t("hero.titleLine1")}{" "}
          <span
            className="block text-[var(--theme-accent-strong)]"
          >
            {t("hero.titleLine2")}
          </span>{" "}
          {t("hero.titleLine3")}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-[var(--theme-text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className=" ">
          <motion.div
            animate={{
              boxShadow: isFocused
                ? "0 0 0 4px rgba(132, 177, 121, 0.18), 0 24px 48px -18px rgba(88, 114, 72, 0.25)"
                : "0 18px 40px -22px rgba(88, 114, 72, 0.2)",
            }}
            className="theme-panel relative rounded-3xl overflow-hidden"
          >
            <section>
              <ChatInputBarLanding />
            </section>

            {/* Mobile Media Buttons */}
            <div className="sm:hidden flex items-center justify-center gap-2 px-4 pb-3 pt-1">
              <MediaButton
                icon={<Mic className="w-5 h-5" />}
                  label={t("input.startVoice")}
              />
              <MediaButton
                icon={<Video className="w-5 h-5" />}
                  label={t("input.uploadVideo")}
              />
              <MediaButton
                icon={<ImageIcon className="w-5 h-5" />}
                  label={t("input.uploadImage")}
              />
              <MediaButton
                icon={<Paperclip className="w-5 h-5" />}
                  label={t("input.uploadDocument")}
              />
            </div>
          </motion.div>
        </motion.div>

        <FeatureButtons />
      </motion.div>
    </section>
  );
}
