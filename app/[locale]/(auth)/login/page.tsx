"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Link, useRouter } from "@/lib/i18n";
import { Button } from "@/components/ui";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { getDefaultRoute } from "@/lib/utils";
import { APP_NAME, COMPANY_PROFILE } from "@/lib/config/company-profile";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const queryParams = useSearchParams();
  const t = useTranslations("Auth");
  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Get user profile to determine redirect
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = (profile as { role?: string } | null)?.role;
      const rawRedirect = queryParams.get("redirect") ?? "";
      const isSafeRedirect =
        rawRedirect.startsWith("/") && !rawRedirect.startsWith("//");
      const redirectPath = isSafeRedirect ? rawRedirect : getDefaultRoute(role);
      router.push(redirectPath);
    }
  };

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "email",
        redirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={COMPANY_PROFILE.branding.logoPath}
                alt={APP_NAME}
                width={140}
                height={40}
                className="h-20 w-auto rounded-lg object-contain"
                priority
              />
            </Link>
          </div>
          <p className="text-muted-foreground mt-2">
            {t("signInToYourAccount")}
          </p>
        </div>

        <div className="bg-card rounded-xl border p-8 shadow-sm">
          {error && (
            <div className="bg-error/10 border-error/20 text-error mb-4 rounded-lg border p-3 text-sm">
              {error}
            </div>
          )}

          {/* Microsoft SSO */}
          <Button
            onClick={handleMicrosoftLogin}
            disabled={loading}
            variant="secondary"
            className="mb-4 w-full"
          >
            <Image
              src="/microsoft.png"
              alt="Microsoft"
              width={200}
              height={200}
              className="size-4 rounded-b-xs object-contain"
              priority
            />
            {t("signInWithMicrosoft")}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="border-border w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card text-muted-foreground px-2">
                {t("orContinueWith")}
              </span>
            </div>
          </div>

          {/* Email/Password */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:ring-2 focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t("signingIn") : t("signIn")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
