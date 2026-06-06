import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NotFound() {
  const t = await getTranslations("Errors");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="space-y-2">
        <h1 className="text-muted-foreground text-8xl font-bold tracking-tight">
          404
        </h1>
        <h2 className="text-2xl font-semibold">{t("notFound")}</h2>
        <p className="text-muted-foreground max-w-sm">
          {t("notFoundDescription")}
        </p>
      </div>
      <Link
        href="/"
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
