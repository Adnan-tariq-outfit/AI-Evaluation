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
  Settings,
  Loader2,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navLinks = [
  { name: "Chat Hub", href: "/chat-hub" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Discover New", href: "/discover-new" },
  { name: "Agents", href: "/agents" },
];

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
];

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
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

  const handleLanguageSelect = (language: (typeof languages)[0]) => {
    setSelectedLanguage(language);
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
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-zinc-100"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10  flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-[#84B179]" />
              </div>
              <span className="text-xl font-bold text-zinc-900">NexusAI</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <motion.div
                key={link.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 rounded-lg hover:text-zinc-900 hover:bg-zinc-50 transition-colors inline-block"
                >
                  {link.name}
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
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 rounded-lg hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-expanded={isLanguageOpen}
                aria-haspopup="listbox"
              >
                <Globe className="w-4 h-4" />
                <span>{selectedLanguage.code.toUpperCase()}</span>
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
                    className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden z-50"
                    role="listbox"
                  >
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => handleLanguageSelect(language)}
                        className={`w-full px-4 py-2.5 text-sm text-left hover:bg-zinc-50 transition-colors ${
                          selectedLanguage.code === language.code
                            ? "text-[#84B179] font-medium"
                            : "text-zinc-700"
                        }`}
                        role="option"
                        aria-selected={selectedLanguage.code === language.code}
                      >
                        {language.name}
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
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#84B179] to-[#A2CB8B] flex items-center justify-center text-white font-semibold text-sm">
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
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-zinc-100">
                        <p className="text-sm font-medium text-zinc-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full disabled:opacity-50"
                        >
                          {isLoggingOut ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4" />
                          )}
                          {isLoggingOut ? "Logging out..." : "Log out"}
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
                    className="px-4 py-2 text-sm font-medium text-zinc-700 rounded-lg hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link href="/login">
                  <motion.button
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#84B179] rounded-lg hover:bg-[#A2CB8B] transition-colors shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
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
            className="md:hidden bg-white border-t border-zinc-100"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-4 py-3 text-base font-medium text-zinc-600 rounded-lg hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-zinc-100 space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#84B179] to-[#A2CB8B] flex items-center justify-center text-white font-semibold">
                        {getUserInitials()}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-zinc-500">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-base font-medium text-zinc-700 rounded-lg hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full px-4 py-3 text-base font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left flex items-center gap-2"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      {isLoggingOut ? "Logging out..." : "Log out"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-3 text-base font-medium text-zinc-700 rounded-lg hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-3 text-base font-semibold text-white bg-[#84B179] rounded-lg hover:bg-[#A2CB8B] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
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
