import { getTranslations } from "next-intl/server";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Navigation" });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
        <p className="text-muted-foreground mt-1">Administration</p>
      </div>
      {/* Ajouter ici les widgets et stats du dashboard admin */}
    </div>
  );
}
