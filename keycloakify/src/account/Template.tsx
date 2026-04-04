import { useEffect } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { TemplateProps } from "keycloakify/account/TemplateProps";
import { useSetClassName } from "keycloakify/tools/useSetClassName";
import { useInitialize } from "keycloakify/account/Template.useInitialize";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { I18n } from "./i18n";
import type { KcContext } from "keycloakify/account/KcContext";
import "../shared/theme.css";

type NavItem = {
    key: string;
    label: string;
    href: string;
    condition?: boolean;
    icon: React.ReactNode;
};

export default function Template(props: TemplateProps<KcContext, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, children, active } = props;

    const { msg, msgStr, currentLanguage, enabledLanguages } = i18n;
    const { url, features, realm, message, referrer } = kcContext;

    useEffect(() => {
        document.title = msgStr("accountManagementTitle");
    }, []);

    useSetClassName({ qualifiedName: "html", className: "dark" });
    useSetClassName({ qualifiedName: "body", className: "" });

    const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });
    if (!isReadyToRender) return null;

    const navItems: NavItem[] = [
        {
            key: "account",
            label: msgStr("account"),
            href: url.accountUrl,
            icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
            )
        },
        {
            key: "password",
            label: msgStr("password"),
            href: url.passwordUrl,
            condition: features.passwordUpdateSupported,
            icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
            )
        },
        {
            key: "totp",
            label: msgStr("authenticator"),
            href: url.totpUrl,
            icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="4" y="1" width="8" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M6 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <circle cx="8" cy="4.5" r="1" fill="currentColor" />
                </svg>
            )
        },
        {
            key: "social",
            label: msgStr("federatedIdentity"),
            href: url.socialUrl,
            condition: features.identityFederation,
            icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="3.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="12.5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="12.5" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M5.4 7.1l5.2-2.6M5.4 8.9l5.2 2.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
            )
        },
        {
            key: "sessions",
            label: msgStr("sessions"),
            href: url.sessionsUrl,
            icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M1 6h14" stroke="currentColor" strokeWidth="1.3" />
                </svg>
            )
        },
        {
            key: "applications",
            label: msgStr("applications"),
            href: url.applicationsUrl,
            icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                </svg>
            )
        },
        {
            key: "log",
            label: msgStr("log"),
            href: url.logUrl,
            condition: features.log,
            icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 4h10M3 8h10M3 12h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
            )
        }
    ];

    const visibleNav = navItems.filter(item => item.condition === undefined || item.condition);

    return (
        <div className="min-h-screen w-full flex flex-col bg-background relative overflow-hidden">
            {/* Background radial glows */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    background: [
                        "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(217 91% 60% / 0.10) 0%, transparent 70%)",
                        "radial-gradient(ellipse 50% 40% at 80% 80%, hsl(221 83% 40% / 0.06) 0%, transparent 60%)",
                        "radial-gradient(ellipse 40% 30% at 20% 90%, hsl(215 80% 35% / 0.05) 0%, transparent 60%)"
                    ].join(", ")
                }}
            />

            {/* Top header */}
            <header className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-border/40 glass">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shrink-0">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M8 2L13.5 5V11L8 14L2.5 11V5L8 2Z" stroke="hsl(222 47% 6%)" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                            <circle cx="8" cy="8" r="2" fill="hsl(222 47% 6%)" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-foreground tracking-tight">
                        {realm.internationalizationEnabled ? msgStr("accountManagementTitle") : "Account"}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Language switcher */}
                    {enabledLanguages.length > 1 && (
                        <details className="group relative">
                            <summary
                                tabIndex={0}
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
                            <ul className="absolute right-0 mt-1 min-w-[130px] z-20 glass-card border border-border/60 shadow-lg py-1 overflow-hidden rounded-md">
                                {enabledLanguages.map(({ languageTag, label, href }) => (
                                    <li key={languageTag}>
                                        <a href={href} className="block px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    )}

                    {/* Back to app */}
                    {referrer?.url && (
                        <a
                            href={referrer.url}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                        >
                            {msg("backTo", referrer.name)}
                        </a>
                    )}

                    {/* Sign out */}
                    <a
                        href={url.getLogoutUrl()}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium",
                            "text-muted-foreground border border-border/50",
                            "hover:text-foreground hover:border-border transition-colors"
                        )}
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M5 2H2.5A.5.5 0 0 0 2 2.5v7a.5.5 0 0 0 .5.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            <path d="M8 4l2 2-2 2M10 6H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {msg("doSignOut")}
                    </a>
                </div>
            </header>

            {/* Body: sidebar + content */}
            <div className="relative z-10 flex flex-1 min-h-0">
                {/* Sidebar */}
                <nav
                    aria-label="Account navigation"
                    className="w-56 shrink-0 border-r border-border/40 px-3 py-6 hidden md:block"
                >
                    <ul className="space-y-0.5">
                        {visibleNav.map(item => {
                            const isActive = active === item.key;
                            return (
                                <li key={item.key}>
                                    <a
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all",
                                            isActive
                                                ? "bg-primary/15 text-primary border border-primary/20"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent"
                                        )}
                                        aria-current={isActive ? "page" : undefined}
                                    >
                                        <span className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground/70")}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Mobile nav bar */}
                <div className="md:hidden w-full border-b border-border/40 overflow-x-auto">
                    <ul className="flex px-4 py-2 gap-1">
                        {visibleNav.map(item => {
                            const isActive = active === item.key;
                            return (
                                <li key={item.key} className="shrink-0">
                                    <a
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all",
                                            isActive
                                                ? "bg-primary/15 text-primary border border-primary/20"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent"
                                        )}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto px-6 py-8 max-w-4xl">
                    {/* Flash message */}
                    {message !== undefined && (
                        <Alert
                            variant={message.type === "error" ? "destructive" : "default"}
                            className={cn(
                                "mb-6 text-sm",
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

                    {children}
                </main>
            </div>
        </div>
    );
}
