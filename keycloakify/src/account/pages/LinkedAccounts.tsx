import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "keycloakify/account/KcContext";
import type { I18n } from "keycloakify/account/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type KcContextFederated = Extract<KcContext, { pageId: "federatedIdentity.ftl" }>;

export default function LinkedAccounts(props: PageProps<KcContextFederated, I18n>) {
    const { kcContext, i18n, Template } = props;
    const { url, federatedIdentity, stateChecker } = kcContext;
    const { msg } = i18n;

    return (
        <Template {...props} active="social">
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">
                        {msg("federatedIdentitiesHtmlTitle")}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Connect external identity providers to your account.
                    </p>
                </div>

                <div className="space-y-3" id="federated-identities">
                    {federatedIdentity.identities.map(identity => (
                        <div
                            key={identity.providerId}
                            className={cn(
                                "glass-card px-4 py-4 flex items-center gap-4",
                                "flex-col sm:flex-row"
                            )}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Provider icon placeholder */}
                                <div className="w-8 h-8 rounded-lg bg-accent/50 border border-border/50 flex items-center justify-center shrink-0">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                        <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
                                        <path d="M2 13c0-2.76 2.24-4 5-4s5 1.24 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground">
                                        {identity.displayName}
                                    </p>
                                    {identity.userName && (
                                        <p className="text-xs text-muted-foreground truncate">
                                            {identity.userName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <Badge
                                    variant={identity.connected ? "default" : "secondary"}
                                    className={cn(
                                        "text-xs",
                                        identity.connected
                                            ? "bg-green-500/15 text-green-400 border-green-500/25"
                                            : "bg-muted/50 text-muted-foreground"
                                    )}
                                >
                                    {identity.connected ? "Connected" : "Not connected"}
                                </Badge>

                                {identity.connected ? (
                                    federatedIdentity.removeLinkPossible && (
                                        <form action={url.socialUrl} method="post" className="inline">
                                            <input type="hidden" name="stateChecker" value={stateChecker} />
                                            <input type="hidden" name="action" value="remove" />
                                            <input type="hidden" name="providerId" value={identity.providerId} />
                                            <Button
                                                id={`remove-link-${identity.providerId}`}
                                                type="submit"
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                {msg("doRemove")}
                                            </Button>
                                        </form>
                                    )
                                ) : (
                                    <form action={url.socialUrl} method="post" className="inline">
                                        <input type="hidden" name="stateChecker" value={stateChecker} />
                                        <input type="hidden" name="action" value="add" />
                                        <input type="hidden" name="providerId" value={identity.providerId} />
                                        <Button
                                            id={`add-link-${identity.providerId}`}
                                            type="submit"
                                            variant="outline"
                                            size="sm"
                                        >
                                            {msg("doAdd")}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))}

                    {federatedIdentity.identities.length === 0 && (
                        <div className="glass-card px-6 py-10 text-center text-muted-foreground text-sm">
                            No identity providers available.
                        </div>
                    )}
                </div>
            </div>
        </Template>
    );
}
