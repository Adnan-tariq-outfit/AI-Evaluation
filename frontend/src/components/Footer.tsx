"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
// Switched social icons to FontAwesome (fa6) for better reliability
import { FaGithub, FaXTwitter, FaLinkedin, FaYoutube } from "react-icons/fa6";
// Switched to HiSparkles and IoSend for better compatibility
import { HiSparkles } from "react-icons/hi2";
import { IoSend } from "react-icons/io5";
import { useI18n } from "./I18nProvider";

const footerLinks = {
  product: [
    { name: "Chat Hub", href: "#chat-hub" },
    { name: "Marketplace", href: "#marketplace" },
    { name: "Agents", href: "#agents" },
    { name: "Pricing", href: "#pricing" },
  ],
  resources: [
    { name: "Documentation", href: "#docs" },
    { name: "API Reference", href: "#api" },
    { name: "Tutorials", href: "#tutorials" },
    { name: "Blog", href: "#blog" },
  ],
  company: [
    { name: "About Us", href: "#about" },
    { name: "Careers", href: "#careers" },
    { name: "Contact", href: "#contact" },
    { name: "Partners", href: "#partners" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms of Service", href: "#terms" },
    { name: "Cookie Policy", href: "#cookies" },
  ],
};

const socialLinks = [
  { icon: <FaXTwitter className="w-5 h-5" />, href: "#", label: "Twitter" },
  { icon: <FaGithub className="w-5 h-5" />, href: "#", label: "GitHub" },
  { icon: <FaLinkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" },
  { icon: <FaYoutube className="w-5 h-5" />, href: "#", label: "YouTube" },
];

export default function Footer() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-white border-t border-zinc-100">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-zinc-100">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-zinc-900 mb-3">
              {t("footer.newsTitle")}
            </h3>
            <p className="text-zinc-600 mb-6">
              {t("footer.newsSubtitle")}
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.emailPlaceholder")}
                className="flex-1 px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#84B179]/20 focus:border-[#84B179] transition-colors"
                required
                aria-label={t("footer.emailAria")}
              />
              <motion.button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#84B179] text-white font-semibold rounded-xl hover:bg-[#A2CB8B] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{t("footer.subscribe")}</span>
                <IoSend className="w-4 h-4" />
              </motion.button>
            </form>

            {isSubscribed && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-[#84B179]"
              >
                {t("footer.subscribed")}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Logo & Social Links */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#84B179] flex items-center justify-center">
                <HiSparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-zinc-900">NexusAI</span>
            </Link>
            <p className="text-sm text-zinc-600 mb-6 max-w-xs">
              {t("footer.brandText")}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="p-2 text-zinc-500 rounded-lg hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4">{t("footer.product")}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4">{t("footer.resources")}</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4">{t("footer.company")}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-zinc-900 mb-4">{t("footer.legal")}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              &copy; {new Date().getFullYear()} NexusAI. {t("footer.rights")}
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#privacy"
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {t("footer.privacyShort")}
              </a>
              <a
                href="#terms"
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {t("footer.termsShort")}
              </a>
              <a
                href="#cookies"
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {t("footer.cookiesShort")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
