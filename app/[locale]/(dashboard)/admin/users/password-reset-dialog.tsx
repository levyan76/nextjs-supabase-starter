"use client";

import { useState } from "react";
import { Key, Check, Copy, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Input,
  Label,
} from "@/components/ui";
import { resetUserPassword } from "./actions";

interface PasswordResetDialogProps {
  userId: string;
  userName: string;
  trigger?: React.ReactNode;
}

export function PasswordResetDialog({
  userId,
  userName,
  trigger,
}: PasswordResetDialogProps) {
  const tCommon = useTranslations("Common.Actions");
  const t = useTranslations("Admin.Users");
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const result = await resetUserPassword(userId);
      if (result.success && result.newPassword) {
        setNewPassword(result.newPassword);
        toast.success(t("resetPasswordSuccess"));
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to reset password";
      toast.error(message);
      setIsOpen(false);
    } finally {
      setIsResetting(false);
    }
  };

  const copyToClipboard = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast.success(t("copied") || "Copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setNewPassword(null);
          setCopied(false);
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" title={t("resetPassword")}>
            <Key className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("resetPasswordTitle")}</DialogTitle>
          <DialogDescription>
            {t("resetPasswordDescription", { name: userName })}
          </DialogDescription>
        </DialogHeader>

        {newPassword ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">
                {t("generatedPasswordLabel")}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="new-password"
                  value={newPassword}
                  readOnly
                  className="bg-muted font-mono"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="text-success h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-error text-sm font-medium">
              {t("passwordWarning") ||
                "Veuillez noter ce mot de passe, il ne sera plus affiché."}
            </p>
          </div>
        ) : (
          <div className="py-4">
            <p className="text-muted-foreground text-sm">
              {t("confirmResetAction") ||
                "Cette action est immédiate et irréversible."}
            </p>
          </div>
        )}

        <DialogFooter>
          {!newPassword ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isResetting}
              >
                {t("actions.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={isResetting}
              >
                {isResetting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("resetPasswordConfirm")}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsOpen(false)}>{tCommon("close")}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
