"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mic,
  Video,
  Image as ImageIcon,
  Paperclip,
  ArrowRight,
} from "lucide-react";
import FeatureButtons from "./FeatureButtons";

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
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-30 pb-16 overflow-hidden">
      {/* Background - Pure White */}
      <div className="absolute inset-0 -z-10 bg-white" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C7EABB]/30 text-[#6a9a5d] text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-[#84B179] animate-pulse" />
            525+ AI Models Available
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-zinc-900 tracking-tight leading-[1.1] mb-6"
        >
          Find your perfect{" "}
          <span
            className="text-[#84B179] block
          "
          >
            AI model
          </span>{" "}
          with guided <br /> discovery
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Discover, compare, and deploy AI models through intuitive
          conversations. Our guided experience helps you find exactly what you
          need in minutes.
        </motion.p>

        {/* Search Bar */}
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
          <motion.div
            animate={{
              boxShadow: isFocused
                ? "0 0 0 4px rgba(132, 177, 121, 0.15), 0 20px 40px -10px rgba(0, 0, 0, 0.1)"
                : "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
            }}
            className="relative bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm"
          >
            <div className="flex items-center gap-2 p-2">
              {/* Input Field */}
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Describe what you're looking for..."
                className="flex-1 px-4 py-3 bg-transparent text-zinc-900 placeholder:text-zinc-400 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 text-base"
                aria-label="Search for AI models"
              />

              {/* Media Buttons */}
              <div className="hidden sm:flex items-center gap-1">
                <MediaButton
                  icon={<Mic className="w-5 h-5" />}
                  label="Voice input"
                />
                <MediaButton
                  icon={<Video className="w-5 h-5" />}
                  label="Video input"
                />
                <MediaButton
                  icon={<ImageIcon className="w-5 h-5" />}
                  label="Image input"
                />
                <MediaButton
                  icon={<Paperclip className="w-5 h-5" />}
                  label="Attach file"
                />
              </div>

              {/* CTA Button */}
              <motion.button
                onClick={() => {
                  const query = searchValue.trim();
                  router.push(
                    query
                      ? `/chat-hub?prompt=${encodeURIComponent(query)}`
                      : "/chat-hub",
                  );
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#84B179] text-white font-semibold rounded-xl hover:bg-[#A2CB8B] transition-colors whitespace-nowrap"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="hidden sm:inline">Let&apos;s Go</span>
                <span className="sm:hidden">Go</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Mobile Media Buttons */}
            <div className="sm:hidden flex items-center justify-center gap-2 px-4 pb-3 pt-1">
              <MediaButton
                icon={<Mic className="w-5 h-5" />}
                label="Voice input"
              />
              <MediaButton
                icon={<Video className="w-5 h-5" />}
                label="Video input"
              />
              <MediaButton
                icon={<ImageIcon className="w-5 h-5" />}
                label="Image input"
              />
              <MediaButton
                icon={<Paperclip className="w-5 h-5" />}
                label="Attach file"
              />
            </div>
          </motion.div>
        </motion.div>

        <FeatureButtons />
      </motion.div>
    </section>
  );
}
