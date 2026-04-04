import type { PageProps } from "keycloakify/account/pages/PageProps";
import type { KcContext } from "keycloakify/account/KcContext";
import type { I18n } from "keycloakify/account/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type KcContextPersonalInfo = Extract<KcContext, { pageId: "account.ftl" }>;

export default function PersonalInfo(props: PageProps<KcContextPersonalInfo, I18n>) {
    const { kcContext, i18n, Template } = props;
    const { url, realm, messagesPerField, stateChecker, account, referrer } = kcContext;
    const { msg } = i18n;

    return (
        <Template {...props} active="account">
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">
                        {msg("editAccountHtmlTitle")}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        <span className="text-destructive mr-0.5">*</span>
                        {msg("requiredFields")}
                    </p>
                </div>

                <form action={url.accountUrl} method="post" className="space-y-5">
                    <input type="hidden" id="stateChecker" name="stateChecker" value={stateChecker} />

                    {!realm.registrationEmailAsUsername && (
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="username"
                                className={cn(
                                    "text-sm font-medium",
                                    messagesPerField.existsError("username") && "text-destructive"
                                )}
                            >
                                {msg("username")}
                                {realm.editUsernameAllowed && (
                                    <span className="text-destructive ml-0.5">*</span>
                                )}
                            </Label>
                            <Input
                                type="text"
                                id="username"
                                name="username"
                                disabled={!realm.editUsernameAllowed}
                                defaultValue={account.username ?? ""}
                                className={cn(
                                    "glass",
                                    messagesPerField.existsError("username") && "border-destructive/60"
                                )}
                                aria-invalid={messagesPerField.existsError("username")}
                            />
                            {messagesPerField.existsError("username") && (
                                <p className="text-xs text-destructive">{messagesPerField.get("username")}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="email"
                            className={cn(
                                "text-sm font-medium",
                                messagesPerField.existsError("email") && "text-destructive"
                            )}
                        >
                            {msg("email")}
                            <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="email"
                            name="email"
                            autoFocus
                            defaultValue={account.email ?? ""}
                            className={cn(
                                "glass",
                                messagesPerField.existsError("email") && "border-destructive/60"
                            )}
                            aria-invalid={messagesPerField.existsError("email")}
                        />
                        {messagesPerField.existsError("email") && (
                            <p className="text-xs text-destructive">{messagesPerField.get("email")}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="firstName"
                            className={cn(
                                "text-sm font-medium",
                                messagesPerField.existsError("firstName") && "text-destructive"
                            )}
                        >
                            {msg("firstName")}
                            <span className="text-destructive ml-0.5">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="firstName"
                            name="firstName"
                            defaultValue={account.firstName ?? ""}
                            className={cn(
                                "glass",
                                messagesPerField.existsError("firstName") && "border-destructive/60"
                            )}
                            aria-invalid={messagesPerField.existsError("firstName")}
                        />
                        {messagesPerField.existsError("firstName") && (
                            <p className="text-xs text-destructive">{messagesPerField.get("firstName")}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label
                            htmlFor="lastName"
                            className={cn(
                                "text-sm font-medium",
                                messagesPerField.existsError("lastName") && "text-destructive"
                            )}
                        >
                            {msg("lastName")}
                        </Label>
                        <Input
                            type="text"
                            id="lastName"
                            name="lastName"
                            defaultValue={account.lastName ?? ""}
                            className={cn(
                                "glass",
                                messagesPerField.existsError("lastName") && "border-destructive/60"
                            )}
                            aria-invalid={messagesPerField.existsError("lastName")}
                        />
                        {messagesPerField.existsError("lastName") && (
                            <p className="text-xs text-destructive">{messagesPerField.get("lastName")}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        {referrer !== undefined && (
                            <a
                                href={referrer.url}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                            >
                                {msg("backToApplication")}
                            </a>
                        )}
                        <Button type="submit" name="submitAction" value="Save">
                            {msg("doSave")}
                        </Button>
                        <Button type="submit" name="submitAction" value="Cancel" variant="outline">
                            {msg("doCancel")}
                        </Button>
                    </div>
                </form>
            </div>
        </Template>
    );
}
