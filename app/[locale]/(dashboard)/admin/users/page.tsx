import { UserForm } from "./user-form";
import { UsersList } from "./users-list";
import { useTranslations } from "next-intl";

export default function UsersPage() {
  const t = useTranslations("Admin.Users");
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>

        <UserForm mode="create" />
      </div>

      <UsersList />
    </div>
  );
}
