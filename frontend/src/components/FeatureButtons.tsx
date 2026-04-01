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

interface FeatureButton {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}

const features: FeatureButton[] = [
  {
    icon: <Palette className="w-5 h-5" />,
    label: "Create image",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <Music className="w-5 h-5" />,
    label: "Generate Audio",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <Video className="w-5 h-5" />,
    label: "Create video",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <Presentation className="w-5 h-5" />,
    label: "Create slides",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    label: "Create Infographs",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    label: "Create quiz",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <Files className="w-5 h-5" />,
    label: "Create Flashcards",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <Brain className="w-5 h-5" />,
    label: "Create Mind map",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <LineChart className="w-5 h-5" />,
    label: "Analyze Data",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <PencilLine className="w-5 h-5" />,
    label: "Write content",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <Code2 className="w-5 h-5" />,
    label: "Code Generation",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "Document Analysis",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    label: "Translate",
    color: "text-[#84B179]",
    bgColor: "bg-[#E8F5BD]/50 hover:bg-[#C7EABB]/70",
  },
  {
    icon: <Telescope className="w-5 h-5" />,
    label: "Just Exploring",
    color: "text-[#84B179]",
    // Note: In the image, this button has a dashed border
    bgColor:
      "bg-transparent border-2 border-dashed border-zinc-200 hover:bg-zinc-50",
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
  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white">
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
              key={feature.label}
              variants={itemVariants}
              className={`group flex items-center gap-2.5 px-5 py-3 rounded-full ${feature.bgColor} transition-all duration-200 border border-transparent hover:border-[#84B179]/30`}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <span
                className={`${feature.color} transition-transform group-hover:scale-110`}
              >
                {feature.icon}
              </span>
              <span className="text-sm font-medium text-zinc-700 whitespace-nowrap">
                {feature.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div variants={itemVariants} className="mt-10 text-center">
          <p className="text-sm text-zinc-500">
            Or browse our{" "}
            <Link
              href="/marketplace"
              className="text-[#84B179] font-medium hover:underline"
            >
              complete marketplace
            </Link>{" "}
            of 525+ models
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
