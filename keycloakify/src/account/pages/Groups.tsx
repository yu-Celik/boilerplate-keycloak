import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "keycloakify/account/KcContext";
import type { I18n } from "keycloakify/account/i18n";
import { Badge } from "@/components/ui/badge";

// Groups page — no default keycloakify implementation exists.
// KcContext does not have a specific "groups.ftl" type in keycloakify v11,
// so we use the generic KcContext type here.
export default function Groups(props: PageProps<KcContext, I18n>) {
    const { Template } = props;

    // Groups data is not in the standard KcContext type.
    // Access via kcContext properties if extended, or render a placeholder.
    const kcContextAny = props.kcContext as any;
    const groups: string[] = kcContextAny.groups ?? [];

    return (
        <Template {...props} active="groups">
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">
                        {"My Groups"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Groups you are a member of.
                    </p>
                </div>

                {groups.length > 0 ? (
                    <div className="glass-card divide-y divide-border/30 overflow-hidden">
                        {groups.map((group, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                                        <circle cx="3.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" />
                                        <circle cx="9.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" />
                                        <path d="M1 12c0-1.66 1.12-2.5 2.5-2.5S6 10.34 6 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                        <path d="M7 12c0-1.66 1.12-2.5 2.5-2.5S12 10.34 12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <span className="text-sm text-foreground font-medium">{group}</span>
                                <Badge variant="secondary" className="ml-auto text-xs">Member</Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card px-6 py-10 text-center">
                        <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                                <circle cx="5" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                                <circle cx="13" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                                <path d="M1 16c0-2.21 1.79-3.5 4-3.5s4 1.29 4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                <path d="M9 16c0-2.21 1.79-3.5 4-3.5s4 1.29 4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">You are not a member of any groups.</p>
                    </div>
                )}
            </div>
        </Template>
    );
}
