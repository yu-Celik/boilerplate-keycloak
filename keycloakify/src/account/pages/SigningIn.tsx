import { useState } from "react";
import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "keycloakify/account/KcContext";
import type { I18n } from "keycloakify/account/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type KcContextPassword = Extract<KcContext, { pageId: "password.ftl" }>;

export default function SigningIn(props: PageProps<KcContextPassword, I18n>) {
    const { kcContext, i18n, Template } = props;
    const { url, password, account, stateChecker } = kcContext;
    const { msg, msgStr } = i18n;

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
    const [newPasswordError, setNewPasswordError] = useState("");
    const [newPasswordConfirmError, setNewPasswordConfirmError] = useState("");
    const [hasNewPasswordBlurred, setHasNewPasswordBlurred] = useState(false);
    const [hasNewPasswordConfirmBlurred, setHasNewPasswordConfirmBlurred] = useState(false);

    const checkNewPassword = (value: string) => {
        if (!password.passwordSet) return;
        if (value === currentPassword) {
            setNewPasswordError(msgStr("newPasswordSameAsOld"));
        } else {
            setNewPasswordError("");
        }
    };

    const checkNewPasswordConfirm = (value: string) => {
        if (value === "") return;
        if (newPassword !== value) {
            setNewPasswordConfirmError(msgStr("passwordConfirmNotMatch"));
        } else {
            setNewPasswordConfirmError("");
        }
    };

    // Inline error override for the template message display
    const kcContextWithErrors = {
        ...kcContext,
        message: (() => {
            if (newPasswordError !== "") return { type: "error" as const, summary: newPasswordError };
            if (newPasswordConfirmError !== "") return { type: "error" as const, summary: newPasswordConfirmError };
            return kcContext.message;
        })()
    };

    return (
        <Template {...props} kcContext={kcContextWithErrors} active="password">
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">
                        {msg("changePasswordHtmlTitle")}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{msg("allFieldsRequired")}</p>
                </div>

                <form action={url.passwordUrl} method="post" className="space-y-5">
                    {/* Hidden username for password managers */}
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={account.username ?? ""}
                        autoComplete="username"
                        readOnly
                        className="sr-only"
                        aria-hidden="true"
                    />
                    <input type="hidden" id="stateChecker" name="stateChecker" value={stateChecker} />

                    {password.passwordSet && (
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-medium">
                                {msg("password")}
                            </Label>
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                autoFocus
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                className="glass"
                            />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="password-new"
                            className={cn("text-sm font-medium", newPasswordError && "text-destructive")}
                        >
                            {msg("passwordNew")}
                        </Label>
                        <Input
                            type="password"
                            id="password-new"
                            name="password-new"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={e => {
                                const v = e.target.value;
                                setNewPassword(v);
                                if (hasNewPasswordBlurred) checkNewPassword(v);
                            }}
                            onBlur={() => {
                                setHasNewPasswordBlurred(true);
                                checkNewPassword(newPassword);
                            }}
                            className={cn("glass", newPasswordError && "border-destructive/60")}
                            aria-invalid={!!newPasswordError}
                        />
                        {newPasswordError && (
                            <p className="text-xs text-destructive">{newPasswordError}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="password-confirm"
                            className={cn("text-sm font-medium", newPasswordConfirmError && "text-destructive")}
                        >
                            {msg("passwordConfirm")}
                        </Label>
                        <Input
                            type="password"
                            id="password-confirm"
                            name="password-confirm"
                            autoComplete="new-password"
                            value={newPasswordConfirm}
                            onChange={e => {
                                const v = e.target.value;
                                setNewPasswordConfirm(v);
                                if (hasNewPasswordConfirmBlurred) checkNewPasswordConfirm(v);
                            }}
                            onBlur={() => {
                                setHasNewPasswordConfirmBlurred(true);
                                checkNewPasswordConfirm(newPasswordConfirm);
                            }}
                            className={cn("glass", newPasswordConfirmError && "border-destructive/60")}
                            aria-invalid={!!newPasswordConfirmError}
                        />
                        {newPasswordConfirmError && (
                            <p className="text-xs text-destructive">{newPasswordConfirmError}</p>
                        )}
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            name="submitAction"
                            value="Save"
                            disabled={newPasswordError !== "" || newPasswordConfirmError !== ""}
                        >
                            {msg("doSave")}
                        </Button>
                    </div>
                </form>
            </div>
        </Template>
    );
}
