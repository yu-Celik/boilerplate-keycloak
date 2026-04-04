import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginUpdatePassword(props: PageProps<Extract<KcContext, { pageId: "login-update-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { msg, msgStr } = i18n;
    const { url, messagesPerField, isAppInitiatedAction } = kcContext;

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!messagesPerField.existsError("password", "password-confirm")}
            headerNode={msg("updatePasswordTitle")}
        >
            <form id="kc-passwd-update-form" action={url.loginAction} method="post">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password-new">{msg("passwordNew")}</Label>
                        <PasswordInput
                            id="password-new"
                            name="password-new"
                            autoFocus
                            autoComplete="new-password"
                            aria-invalid={messagesPerField.existsError("password", "password-confirm")}
                            i18n={i18n}
                        />
                        {messagesPerField.existsError("password") && (
                            <p
                                id="input-error-password"
                                className="text-sm text-destructive"
                                aria-live="polite"
                                dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get("password")) }}
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password-confirm">{msg("passwordConfirm")}</Label>
                        <PasswordInput
                            id="password-confirm"
                            name="password-confirm"
                            autoComplete="new-password"
                            aria-invalid={messagesPerField.existsError("password", "password-confirm")}
                            i18n={i18n}
                        />
                        {messagesPerField.existsError("password-confirm") && (
                            <p
                                id="input-error-password-confirm"
                                className="text-sm text-destructive"
                                aria-live="polite"
                                dangerouslySetInnerHTML={{ __html: kcSanitize(messagesPerField.get("password-confirm")) }}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="checkbox"
                            id="logout-sessions"
                            name="logout-sessions"
                            value="on"
                            defaultChecked
                            className="h-4 w-4 rounded border-border/60 bg-secondary/20 accent-primary cursor-pointer ring-1 ring-border/40"
                        />
                        <Label
                            htmlFor="logout-sessions"
                            className="text-sm text-muted-foreground cursor-pointer select-none font-normal"
                        >
                            {msg("logoutOtherSessions")}
                        </Label>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="submit" className="w-full">
                            {msgStr("doSubmit")}
                        </Button>
                        {isAppInitiatedAction && (
                            <Button type="submit" name="cancel-aia" value="true" variant="outline">
                                {msg("doCancel")}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </Template>
    );
}

function PasswordInput(props: {
    id: string;
    name: string;
    autoFocus?: boolean;
    autoComplete?: string;
    "aria-invalid"?: boolean;
    i18n: I18n;
}) {
    const { id, name, autoFocus, autoComplete, "aria-invalid": ariaInvalid, i18n } = props;
    const { msgStr } = i18n;
    const { isPasswordRevealed, toggleIsPasswordRevealed } = useIsPasswordRevealed({ passwordInputId: id });

    return (
        <div className="relative">
            <Input
                id={id}
                name={name}
                type={isPasswordRevealed ? "text" : "password"}
                autoFocus={autoFocus}
                autoComplete={autoComplete}
                aria-invalid={ariaInvalid}
                className="pr-10"
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
                aria-controls={id}
                onClick={toggleIsPasswordRevealed}
            >
                {isPasswordRevealed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                )}
            </button>
        </div>
    );
}
