import { useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import { useScript } from "keycloakify/login/pages/LoginPassword.useScript";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPassword(props: PageProps<Extract<KcContext, { pageId: "login-password.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { realm, url, messagesPerField, enableWebAuthnConditionalUI, authenticators } = kcContext;
    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const webAuthnButtonId = "authenticateWebAuthnButton";

    useScript({ webAuthnButtonId, kcContext, i18n });

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            headerNode={msg("doLogIn")}
            displayMessage={!messagesPerField.existsError("password")}
        >
            <form
                id="kc-form-login"
                onSubmit={() => {
                    setIsLoginButtonDisabled(true);
                    return true;
                }}
                action={url.loginAction}
                method="post"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">{msg("password")}</Label>
                        <PasswordInput
                            id="password"
                            name="password"
                            autoFocus
                            autoComplete="on"
                            aria-invalid={messagesPerField.existsError("username", "password")}
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

                    {realm.resetPasswordAllowed && (
                        <div className="flex justify-end">
                            <a tabIndex={5} href={url.loginResetCredentialsUrl} className="text-sm text-primary hover:underline">
                                {msg("doForgotPassword")}
                            </a>
                        </div>
                    )}

                    <Button
                        tabIndex={4}
                        name="login"
                        id="kc-login"
                        type="submit"
                        className="w-full"
                        disabled={isLoginButtonDisabled}
                    >
                        {msgStr("doLogIn")}
                    </Button>
                </div>
            </form>

            {enableWebAuthnConditionalUI && (
                <>
                    <form id="webauth" action={url.loginAction} method="post">
                        <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
                        <input type="hidden" id="authenticatorData" name="authenticatorData" />
                        <input type="hidden" id="signature" name="signature" />
                        <input type="hidden" id="credentialId" name="credentialId" />
                        <input type="hidden" id="userHandle" name="userHandle" />
                        <input type="hidden" id="error" name="error" />
                    </form>

                    {authenticators !== undefined && authenticators.authenticators.length !== 0 && (
                        <form id="authn_select">
                            {authenticators.authenticators.map((authenticator, i) => (
                                <input key={i} type="hidden" name="authn_use_chk" readOnly value={authenticator.credentialId} />
                            ))}
                        </form>
                    )}

                    <div className="mt-4">
                        <Button
                            id={webAuthnButtonId}
                            type="button"
                            variant="outline"
                            className="w-full"
                        >
                            {msgStr("passkey-doAuthenticate")}
                        </Button>
                    </div>
                </>
            )}
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
