"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  Label,
  Select,
  Dialog,
  Button,
  SelectItem,
  SelectValue,
  DialogTitle,
  DialogHeader,
  DialogContent,
  SelectContent,
  SelectTrigger,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui";
import { Plus, Loader2, Eye, EyeOff } from "lucide-react";
import { createUser, updateUser } from "./actions";
import { useTranslations } from "next-intl";
import { UserFormValues, userSchema } from "@/lib/validations";

interface UserFormProps {
  mode: "create" | "edit";
  user?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    role: "USER" | "ADMIN";
    active: boolean;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function UserForm({ mode, user, trigger, onSuccess }: UserFormProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const t = useTranslations("Admin.Users");
  const tCommon = useTranslations("Common.filter");

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "USER",
      active: true,
      password: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        firstName: user?.first_name || "",
        lastName: user?.last_name || "",
        email: user?.email || "",
        role: user?.role || "USER",
        active: user?.active ?? true,
        password: "",
      });
      setServerError(null);
    }
  }, [open, user, form]);

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const formData = new FormData();
      formData.set("firstName", data.firstName);
      formData.set("lastName", data.lastName);
      formData.set("email", data.email);
      formData.set("role", data.role);
      formData.set("active", String(data.active));
      if (mode === "create" && data.password) {
        formData.set("password", data.password);
        await createUser(formData);
      } else if (mode === "edit" && user?.id) {
        formData.set("userId", user.id);
        await updateUser(formData);
      }
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("addUser")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? t("addUser") : t("actions.edit")}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? t("createExternalUserNote")
              : t("editSubtitle")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-lg border p-3 text-sm">
              {serverError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t("fields.firstName")} *</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                disabled={isLoading}
              />
              {form.formState.errors.firstName && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t("fields.lastName")} *</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                disabled={isLoading}
              />
              {form.formState.errors.lastName && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("fields.email")} *</Label>
            <Input
              id="email"
              {...form.register("email")}
              type="email"
              disabled={isLoading || mode === "edit"}
            />
            {mode === "edit" ? (
              <p className="text-muted-foreground text-xs">
                {t("emailImmutable")}
              </p>
            ) : (
              form.formState.errors.email && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.email.message}
                </p>
              )
            )}
          </div>
          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="password">{t("fields.password")} *</Label>
              <div className="relative">
                <Input
                  id="password"
                  {...form.register("password")}
                  type={showPassword ? "text" : "password"}
                  disabled={isLoading}
                  className="pr-10"
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
              {form.formState.errors.password && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="role">{t("fields.role")}</Label>
            <Select
              onValueChange={(val: "USER" | "ADMIN") =>
                form.setValue("role", val)
              }
              value={form.watch("role")}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">{t("roles.USER")}</SelectItem>
                <SelectItem value="ADMIN">{t("roles.ADMIN")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{tCommon("status")}</Label>
            <Select
              onValueChange={(val) => form.setValue("active", val === "true")}
              value={form.watch("active") ? "true" : "false"}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{tCommon("active")}</SelectItem>
                <SelectItem value="false">{tCommon("inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {t("actions.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? t("actions.create") : t("actions.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
