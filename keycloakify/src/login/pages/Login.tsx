/**
 * Login page (login.ftl) — glassmorphism blue-gray redesign.
 * All protocol elements preserved: form action, hidden inputs, name attributes,
 * WebAuthn conditional UI forms, rememberMe, resetPassword, social providers.
 */
import { useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useScript } from "keycloakify/login/pages/Login.useScript";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

type Props = PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>;

export default function Login(props: Props) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const {
        social,
        realm,
        url,
        usernameHidden,
        login,
        auth,
        registrationDisabled,
        messagesPerField,
        enableWebAuthnConditionalUI,
        authenticators
    } = kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const webAuthnButtonId = "authenticateWebAuthnButton";

    useScript({ webAuthnButtonId, kcContext, i18n });

    const hasFieldError = messagesPerField.existsError("username", "password");

    return (
        <Template
            kcContext={kcContext}
            i18n={i18n}
            doUseDefaultCss={doUseDefaultCss}
            classes={classes}
            displayMessage={!hasFieldError}
            headerNode={msg("loginAccountTitle")}
            displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
            infoNode={
                <span className="text-sm text-muted-foreground">
                    {msg("noAccount")}{" "}
                    <a
                        tabIndex={8}
                        href={url.registrationUrl}
                        className="text-primary font-medium hover:underline underline-offset-2 transition-colors"
                    >
                        {msg("doRegister")}
                    </a>
                </span>
            }
            socialProvidersNode={
                realm.password &&
                social?.providers !== undefined &&
                social.providers.length !== 0 ? (
                    <div id="kc-social-providers" className="mt-5">
                        <div className="relative my-4">
                            <Separator className="bg-border/40" />
                            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs text-muted-foreground bg-card">
                                {msg("identity-provider-login-label")}
                            </span>
                        </div>
                        <ul
                            className={cn(
                                "flex flex-col gap-2",
                                social.providers.length > 3 && "grid grid-cols-2"
                            )}
                        >
                            {social.providers.map(p => (
                                <li key={p.alias}>
                                    <a
                                        id={`social-${p.alias}`}
                                        href={p.loginUrl}
                                        className={cn(
                                            "flex items-center justify-center gap-2 w-full",
                                            "rounded-md border border-border/50 px-4 py-2",
                                            "text-sm font-medium text-foreground",
                                            "bg-secondary/30 hover:bg-secondary/60",
                                            "transition-colors duration-150"
                                        )}
                                    >
                                        {p.iconClasses && (
                                            <i className={p.iconClasses} aria-hidden="true" />
                                        )}
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: kcSanitize(p.displayName)
                                            }}
                                        />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null
            }
        >
            {/* Main password form */}
            {realm.password && (
                <form
                    id="kc-form-login"
                    onSubmit={() => {
                        setIsLoginButtonDisabled(true);
                        return true;
                    }}
                    action={url.loginAction}
                    method="post"
                    className="space-y-4"
                >
                    {/* Username / email field */}
                    {!usernameHidden && (
                        <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-sm text-foreground/80">
                                {!realm.loginWithEmailAllowed
                                    ? msg("username")
                                    : !realm.registrationEmailAsUsername
                                      ? msg("usernameOrEmail")
                                      : msg("email")}
                            </Label>
                            <Input
                                tabIndex={2}
                                id="username"
                                name="username"
                                defaultValue={login.username ?? ""}
                                type="text"
                                autoFocus
                                autoComplete={
                                    enableWebAuthnConditionalUI
                                        ? "username webauthn"
                                        : "username"
                                }
                                aria-invalid={hasFieldError}
                                className={cn(
                                    "bg-secondary/20 border-border/50 focus-visible:ring-primary/60",
                                    hasFieldError && "border-destructive/70"
                                )}
                            />
                            {hasFieldError && (
                                <span
                                    id="input-error"
                                    className="block text-xs text-destructive mt-1"
                                    aria-live="polite"
                                    dangerouslySetInnerHTML={{
                                        __html: kcSanitize(
                                            messagesPerField.getFirstError("username", "password")
                                        )
                                    }}
                                />
                            )}
                        </div>
                    )}

                    {/* Password field */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm text-foreground/80">
                                {msg("password")}
                            </Label>
                            {realm.resetPasswordAllowed && (
                                <a
                                    tabIndex={6}
                                    href={url.loginResetCredentialsUrl}
                                    className="text-xs text-primary hover:underline underline-offset-2 transition-colors"
                                >
                                    {msg("doForgotPassword")}
                                </a>
                            )}
                        </div>
                        <PasswordWrapper i18n={i18n} passwordInputId="password">
                            <Input
                                tabIndex={3}
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                aria-invalid={hasFieldError}
                                className={cn(
                                    "bg-secondary/20 border-border/50 focus-visible:ring-primary/60",
                                    hasFieldError && "border-destructive/70"
                                )}
                            />
                        </PasswordWrapper>
                        {usernameHidden && hasFieldError && (
                            <span
                                id="input-error"
                                className="block text-xs text-destructive mt-1"
                                aria-live="polite"
                                dangerouslySetInnerHTML={{
                                    __html: kcSanitize(
                                        messagesPerField.getFirstError("username", "password")
                                    )
                                }}
                            />
                        )}
                    </div>

                    {/* Remember me */}
                    {realm.rememberMe && !usernameHidden && (
                        <div id="kc-form-options" className="flex items-center gap-2">
                            <input
                                tabIndex={5}
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                defaultChecked={!!login.rememberMe}
                                className="h-4 w-4 rounded border-border/60 bg-secondary/20 accent-primary cursor-pointer ring-1 ring-border/40"
                            />
                            <Label
                                htmlFor="rememberMe"
                                className="text-xs text-muted-foreground cursor-pointer select-none font-normal"
                            >
                                {msg("rememberMe")}
                            </Label>
                        </div>
                    )}

                    {/* Hidden credential id for WebAuthn */}
                    <input
                        type="hidden"
                        id="id-hidden-input"
                        name="credentialId"
                        value={auth.selectedCredential}
                    />

                    {/* Submit */}
                    <div id="kc-form-buttons" className="pt-1">
                        <Button
                            tabIndex={7}
                            type="submit"
                            name="login"
                            id="kc-login"
                            disabled={isLoginButtonDisabled}
                            className="w-full h-10 font-semibold tracking-wide shadow-md shadow-primary/20"
                        >
                            {msgStr("doLogIn")}
                        </Button>
                    </div>
                </form>
            )}

            {/* WebAuthn conditional UI — hidden protocol forms */}
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

                    {authenticators !== undefined &&
                        authenticators.authenticators.length !== 0 && (
                            <form id="authn_select">
                                {authenticators.authenticators.map((authenticator, i) => (
                                    <input
                                        key={i}
                                        type="hidden"
                                        name="authn_use_chk"
                                        readOnly
                                        value={authenticator.credentialId}
                                    />
                                ))}
                            </form>
                        )}

                    <div className="mt-4">
                        <Button
                            id={webAuthnButtonId}
                            type="button"
                            variant="outline"
                            className="w-full h-10 border-border/50 bg-secondary/20 hover:bg-secondary/50"
                        >
                            {msgStr("passkey-doAuthenticate")}
                        </Button>
                    </div>
                </>
            )}
        </Template>
    );
}

// ── Password visibility toggle wrapper ────────────────────────────────────────

function PasswordWrapper(props: {
    i18n: I18n;
    passwordInputId: string;
    children: React.ReactElement;
}) {
    const { i18n, passwordInputId, children } = props;
    const { msgStr } = i18n;
    const { isPasswordRevealed, toggleIsPasswordRevealed } =
        useIsPasswordRevealed({ passwordInputId });

    return (
        <div className="relative flex items-center">
            {/* Clone the child and strip its rounded-r if needed */}
            <div className="flex-1 [&_input]:pr-9">{children}</div>
            <button
                type="button"
                aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
                aria-controls={passwordInputId}
                onClick={toggleIsPasswordRevealed}
                className={cn(
                    "absolute right-2.5 text-muted-foreground hover:text-foreground",
                    "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1",
                    "focus-visible:ring-ring rounded-sm"
                )}
            >
                {isPasswordRevealed ? (
                    /* eye-off icon */
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                ) : (
                    /* eye icon */
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
            </button>
        </div>
    );
}
