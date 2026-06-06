import { getTranslations } from "next-intl/server";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Navigation" });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("dashboard")}</h2>
        <p className="text-muted-foreground mt-1">
          Bienvenue dans votre espace.
        </p>
      </div>
      {/* Ajouter ici les widgets et statistiques de l'app dérivée */}
    </div>
  );
}
