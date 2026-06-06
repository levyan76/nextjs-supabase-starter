"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="space-y-2">
        <h1 className="text-destructive text-8xl font-bold tracking-tight">
          500
        </h1>
        <h2 className="text-2xl font-semibold">{t("serverError")}</h2>
        <p className="text-muted-foreground max-w-sm">
          {t("serverErrorDescription")}
        </p>
      </div>
      <button
        onClick={reset}
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        {t("tryAgain")}
      </button>
    </div>
  );
}
