"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/lib/i18n";
import { Button } from "@/components/ui";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import Image from "next/image";
import { APP_NAME, COMPANY_PROFILE } from "@/lib/config/company-profile";

export default function SetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then(({ needsSetup }) => {
        if (!needsSetup) router.replace("/login");
        else setChecking(false);
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Vérification...</div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-3 text-center">
          <CheckCircle className="mx-auto size-12 text-green-500" />
          <p className="font-medium">Compte admin créé !</p>
          <p className="text-muted-foreground text-sm">
            Redirection vers la connexion...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center gap-2">
            <Image
              src={COMPANY_PROFILE.branding.logoPath}
              alt={APP_NAME}
              width={140}
              height={40}
              className="h-20 w-auto rounded-lg object-contain"
              priority
            />
          </div>
          <h1 className="mt-4 text-xl font-semibold">Configuration initiale</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Créez le premier compte administrateur
          </p>
        </div>

        <div className="bg-card rounded-xl border p-8 shadow-sm">
          {error && (
            <div className="bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-lg border p-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium">Prénom</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Nom</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                  placeholder="Tremblay"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Courriel</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                placeholder="admin@votreentreprise.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Mot de passe{" "}
                <span className="text-muted-foreground font-normal">
                  (min. 8 caractères)
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="border-input bg-background focus:ring-ring w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:ring-2 focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
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
              {loading ? "Création en cours..." : "Créer le compte admin"}
            </Button>
          </form>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          Cette page disparaît automatiquement après la création du premier
          compte.
        </p>
      </div>
    </div>
  );
}
