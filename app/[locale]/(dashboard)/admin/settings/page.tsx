import { getTranslations } from "next-intl/server";
import { Settings, Shield, Bell } from "lucide-react";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.Settings" });

  const sections = [
    {
      icon: Settings,
      label: t("general"),
    },
    {
      icon: Shield,
      label: t("security"),
    },
    {
      icon: Bell,
      label: t("notifications"),
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="bg-card flex cursor-not-allowed items-center gap-4 rounded-xl border p-6 opacity-60"
          >
            <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
              <Icon className="text-muted-foreground size-5" />
            </div>
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-muted-foreground text-xs">{t("comingSoon")}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ajouter ici les sections de paramètres de l'app dérivée */}
    </div>
  );
}
