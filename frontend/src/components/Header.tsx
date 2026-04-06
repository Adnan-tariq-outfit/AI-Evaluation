"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  User,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "./I18nProvider";
import { LanguageCode } from "../lib/i18n";

const navLinks = [
  { key: "nav.chatHub", href: "/chat-hub" },
  { key: "nav.marketplace", href: "/marketplace" },
  { key: "nav.discoverNew", href: "/discover-new" },
  { key: "nav.agents", href: "/agents" },
];

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { t, language, setLanguage, languages } = useI18n();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languageList = Object.values(languages);

  const handleLanguageSelect = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    setIsLanguageOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setIsUserMenuOpen(false);
    await logout();
    setIsLoggingOut(false);
    router.push("/login");
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[rgba(255,253,247,0.94)] backdrop-blur-md shadow-sm border-b border-[var(--theme-border)]"
          : "bg-[rgba(252,251,245,0.82)] backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center rounded-2xl theme-icon-surface">
                <Sparkles className="w-6 h-6 text-[var(--theme-accent-strong)]" />
              </div>
              <span className="text-xl font-bold text-[var(--theme-text)]">NexusAI</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <motion.div
                key={link.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-[var(--theme-text-muted)] rounded-lg hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-muted)] transition-colors inline-block"
                >
                  {t(link.key)}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <motion.button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--theme-text-muted)] rounded-lg hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-muted)] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-expanded={isLanguageOpen}
                aria-haspopup="listbox"
              >
                <Globe className="w-4 h-4" />
                <span>{language.toUpperCase()}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isLanguageOpen ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-40 rounded-xl shadow-lg border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] overflow-hidden z-50"
                    role="listbox"
                  >
                    {languageList.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => handleLanguageSelect(item.code)}
                        className={`w-full px-4 py-2.5 text-sm text-left hover:bg-[var(--theme-surface-muted)] transition-colors ${
                          language === item.code
                            ? "text-[var(--theme-accent-strong)] font-medium"
                            : "text-[var(--theme-text-muted)]"
                        }`}
                        role="option"
                        aria-selected={language === item.code}
                      >
                        {item.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth Section */}
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
              </div>
            ) : isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--theme-text)] rounded-lg hover:bg-[var(--theme-surface-muted)] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-strong)] flex items-center justify-center text-white font-semibold text-sm">
                    {getUserInitials()}
                  </div>
                  <span className="hidden lg:block">{user?.firstName}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg border border-[var(--theme-border)] bg-[var(--theme-surface-elevated)] overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-[var(--theme-border)]">
                        <p className="text-sm font-medium text-[var(--theme-text)]">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-[var(--theme-text-muted)] truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--theme-text)] hover:bg-[var(--theme-surface-muted)] transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          {t("common.profile")}
                        </Link>

                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--theme-danger)] hover:bg-[rgba(185,75,73,0.08)] transition-colors w-full disabled:opacity-50"
                        >
                          {isLoggingOut ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4" />
                          )}
                          {isLoggingOut
                            ? t("common.loggingOut")
                            : t("common.logOut")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <motion.button
                    className="px-4 py-2 text-sm font-medium text-[var(--theme-text)] rounded-lg hover:bg-[var(--theme-surface-muted)] transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("common.signIn")}
                  </motion.button>
                </Link>
                <Link href="/login">
                  <motion.button
                    className="theme-button-primary px-5 py-2.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("common.getStarted")}
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[var(--theme-text-muted)] rounded-lg hover:bg-[var(--theme-surface-muted)] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={t("common.toggleMenu")}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-[var(--theme-surface-elevated)] border-t border-[var(--theme-border)]"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="block px-4 py-3 text-base font-medium text-[var(--theme-text-muted)] rounded-lg hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface-muted)] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(link.key)}
                </Link>
              ))}

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-[var(--theme-border)] space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-strong)] flex items-center justify-center text-white font-semibold">
                        {getUserInitials()}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--theme-text)]">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-[var(--theme-text-muted)]">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-base font-medium text-[var(--theme-text)] rounded-lg hover:bg-[var(--theme-surface-muted)] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("common.profile")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full px-4 py-3 text-base font-medium text-[var(--theme-danger)] rounded-lg hover:bg-[rgba(185,75,73,0.08)] transition-colors text-left flex items-center gap-2"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      {isLoggingOut
                        ? t("common.loggingOut")
                        : t("common.logOut")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-3 text-base font-medium text-[var(--theme-text)] rounded-lg hover:bg-[var(--theme-surface-muted)] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("common.signIn")}
                    </Link>
                    <Link
                      href="/register"
                      className="theme-button-primary block px-4 py-3 text-base font-semibold rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("common.getStarted")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
