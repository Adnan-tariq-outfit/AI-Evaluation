"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useI18n } from "../../components/I18nProvider";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, error, clearAuthError } = useAuth();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = t("auth.firstNameRequired");
    } else if (formData.firstName.length < 2) {
      errors.firstName = t("auth.firstNameMin");
    }

    if (!formData.lastName.trim()) {
      errors.lastName = t("auth.lastNameRequired");
    } else if (formData.lastName.length < 2) {
      errors.lastName = t("auth.lastNameMin");
    }

    if (!formData.email) {
      errors.email = t("auth.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t("auth.emailInvalid");
    }

    if (!formData.password) {
      errors.password = t("auth.passwordRequired");
    } else if (formData.password.length < 8) {
      errors.password = t("auth.passwordMin");
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = t("auth.passwordComplex");
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t("auth.passwordMismatch");
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = t("auth.agreeTerms");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
    });
    setIsSubmitting(false);

    if (result.type === "auth/register/fulfilled") {
      const redirect = searchParams.get("redirect");
      router.push(redirect || "/");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear field error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md p-8 m-4 mx-auto bg-white rounded-2xl shadow-sm border border-zinc-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">
              {t("auth.register.title")}
            </h1>
            <p className="text-zinc-600">{t("auth.register.subtitle")}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  {t("auth.firstName")}
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#84B179] focus:border-transparent transition-all ${
                    formErrors.firstName ? "border-red-500" : ""
                  }`}
                  placeholder="John"
                  disabled={isSubmitting}
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-zinc-700 mb-2"
                >
                  {t("auth.lastName")}
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#84B179] focus:border-transparent transition-all ${
                    formErrors.lastName ? "border-red-500" : ""
                  }`}
                  placeholder="Doe"
                  disabled={isSubmitting}
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 mb-2"
              >
                {t("auth.emailAddress")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#84B179] focus:border-transparent transition-all ${
                  formErrors.email ? "border-red-500" : ""
                }`}
                placeholder="you@example.com"
                disabled={isSubmitting}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 mb-2"
              >
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#84B179] focus:border-transparent transition-all ${
                    formErrors.password ? "border-red-500" : ""
                  }`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-700 mb-2"
              >
                {t("auth.confirmPassword")}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-white border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#84B179] focus:border-transparent transition-all ${
                  formErrors.confirmPassword ? "border-red-500" : ""
                }`}
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="agreeToTerms"
                className="ml-2 text-sm text-zinc-600"
              >
                {t("auth.termsTextPrefix")}{" "}
                <Link
                  href="/terms"
                  className="text-[#84B179] hover:text-[#6f9766]"
                >
                  {t("auth.terms")}
                </Link>{" "}
                {t("auth.and")}{" "}
                <Link
                  href="/privacy"
                  className="text-[#84B179] hover:text-[#6f9766]"
                >
                  {t("auth.privacy")}
                </Link>
              </label>
            </div>
            {formErrors.agreeToTerms && (
              <p className="text-sm text-red-600">{formErrors.agreeToTerms}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#84B179] hover:bg-[#6f9766] text-white font-semibold rounded-lg shadow-sm transform transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t("auth.creatingAccount")}
                </span>
              ) : (
                t("auth.register.title")
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-500">
              {t("auth.alreadyHave")}{" "}
              <Link
                href="/login"
                className="text-[#84B179] hover:text-[#6f9766] font-semibold transition-colors"
              >
                {t("auth.signInLower")}
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
