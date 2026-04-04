import { useEffect } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { I18n } from "../i18n";
import type { KcContext } from "../KcContext";
import Footer from "./Footer";
import "../../shared/theme.css";

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const {
        displayInfo = false,
        displayMessage = true,
        displayRequiredFields = false,
        headerNode,
        socialProvidersNode = null,
        infoNode = null,
        documentTitle,
        bodyClassName,
        kcContext,
        i18n,
        doUseDefaultCss,
        classes: _classes,
        children
    } = props;

    const { msg, msgStr, currentLanguage, enabledLanguages } = i18n;
    const { realm, auth, url, message, isAppInitiatedAction } = kcContext;

    useEffect(() => {
        document.title = documentTitle ?? msgStr("loginTitle", realm.displayName || realm.name);
    }, []);

    // Force dark class on <html> for our dark-mode design system
    useSetClassName({
        qualifiedName: "html",
        className: "dark"
    });

    useSetClassName({
        qualifiedName: "body",
        className: bodyClassName ?? ""
    });

    const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

    if (!isReadyToRender) {
        return null;
    }

    const alertVariantMap = {
        success: "default",
        info: "default",
        warning: "default",
        error: "destructive"
    } as const;

    return (
        <div className="min-h-screen w-full flex flex-col bg-background relative overflow-hidden">
            {/* Layered radial glow backdrop — the signature visual element */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    background: [
                        "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(217 91% 60% / 0.12) 0%, transparent 70%)",
                        "radial-gradient(ellipse 50% 40% at 80% 80%, hsl(221 83% 40% / 0.08) 0%, transparent 60%)",
                        "radial-gradient(ellipse 40% 30% at 20% 90%, hsl(215 80% 35% / 0.06) 0%, transparent 60%)"
                    ].join(", ")
                }}
            />

            {/* Top bar */}
            <header className="relative z-10 flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    {/* Logo mark */}
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M8 2L13.5 5V11L8 14L2.5 11V5L8 2Z"
                                stroke="hsl(222 47% 6%)"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                                fill="none"
                            />
                            <circle cx="8" cy="8" r="2" fill="hsl(222 47% 6%)" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-foreground tracking-tight">
                        {realm.displayName ?? realm.name}
                    </span>
                </div>

                {/* Language switcher */}
                {enabledLanguages.length > 1 && (
                    <div id="kc-locale" className="relative">
                        <details className="group">
                            <summary
                                id="kc-current-locale-link"
                                tabIndex={1}
                                aria-label={msgStr("languages")}
                                aria-haspopup="true"
                                className={cn(
                                    "list-none cursor-pointer select-none",
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium",
                                    "text-muted-foreground border border-border/50",
                                    "hover:text-foreground hover:border-border transition-colors"
                                )}
                            >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                                    <path d="M6 1C6 1 4 3.5 4 6s2 5 2 5" stroke="currentColor" strokeWidth="1.2" />
                                    <path d="M6 1c0 0 2 2.5 2 5s-2 5-2 5" stroke="currentColor" strokeWidth="1.2" />
                                    <path d="M1 6h10" stroke="currentColor" strokeWidth="1.2" />
                                </svg>
                                {currentLanguage.label}
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="transition-transform group-open:rotate-180">
                                    <path d="M2.5 3.75L5 6.25L7.5 3.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </summary>
                            <ul
                                role="menu"
                                id="language-switch1"
                                aria-labelledby="kc-current-locale-link"
                                className={cn(
                                    "absolute right-0 mt-1 min-w-[120px] rounded-md z-20",
                                    "glass-card border border-border/60 shadow-lg",
                                    "py-1 overflow-hidden"
                                )}
                            >
                                {enabledLanguages.map(({ languageTag, label, href }, i) => (
                                    <li key={languageTag} role="none">
                                        <a
                                            role="menuitem"
                                            id={`language-${i + 1}`}
                                            href={href}
                                            className="block px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                                        >
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    </div>
                )}
            </header>

            {/* Main content — vertically centered */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-sm">
                    {/* Glassmorphism card */}
                    <div className="glass-card px-8 py-8 rounded-xl">

                        {/* Page header — title or attempted username */}
                        <div className="mb-6">
                            {auth !== undefined && auth.showUsername && !auth.showResetCredentials ? (
                                <div id="kc-username" className="flex items-center justify-between gap-2">
                                    <span className="text-sm text-muted-foreground truncate">
                                        {auth.attemptedUsername}
                                    </span>
                                    <a
                                        id="reset-login"
                                        href={url.loginRestartFlowUrl}
                                        aria-label={msgStr("restartLoginTooltip")}
                                        title={msgStr("restartLoginTooltip")}
                                        className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                                    >
                                        <Undo2 className="h-4 w-4" aria-hidden="true" />
                                    </a>
                                </div>
                            ) : (
                                <>
                                    <h1
                                        id="kc-page-title"
                                        className="text-xl font-semibold text-foreground tracking-tight"
                                    >
                                        {headerNode}
                                    </h1>
                                    {displayRequiredFields && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            <span className="text-destructive mr-0.5">*</span>
                                            {msg("requiredFields")}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Flash messages */}
                        {displayMessage &&
                            message !== undefined &&
                            (message.type !== "warning" || !isAppInitiatedAction) && (
                                <Alert
                                    variant={alertVariantMap[message.type] ?? "default"}
                                    className={cn(
                                        "mb-5 text-sm",
                                        message.type === "success" && "border-green-500/40 text-green-400",
                                        message.type === "warning" && "border-yellow-500/40 text-yellow-400",
                                        message.type === "info" && "border-primary/40 text-primary"
                                    )}
                                >
                                    <AlertDescription
                                        dangerouslySetInnerHTML={{ __html: kcSanitize(message.summary) }}
                                    />
                                </Alert>
                            )}

                        {/* Page-specific form content */}
                        <div id="kc-content">
                            <div id="kc-content-wrapper">
                                {children}

                                {/* Try another way link */}
                                {auth !== undefined && auth.showTryAnotherWayLink && (
                                    <form
                                        id="kc-select-try-another-way-form"
                                        action={url.loginAction}
                                        method="post"
                                        className="mt-4"
                                    >
                                        <input type="hidden" name="tryAnotherWay" value="on" />
                                        <a
                                            href="#"
                                            id="try-another-way"
                                            className="text-xs text-primary hover:underline underline-offset-2"
                                            onClick={event => {
                                                (document.forms as never as Record<string, HTMLFormElement>)[
                                                    "kc-select-try-another-way-form"
                                                ].requestSubmit();
                                                event.preventDefault();
                                                return false;
                                            }}
                                        >
                                            {msg("doTryAnotherWay")}
                                        </a>
                                    </form>
                                )}

                                {/* Social providers */}
                                {socialProvidersNode}

                                {/* Info block (registration link, etc.) */}
                                {displayInfo && (
                                    <div id="kc-info" className="mt-5 pt-5 border-t border-border/40">
                                        <div id="kc-info-wrapper" className="text-center text-sm text-muted-foreground">
                                            {infoNode}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
